-- Continue fixing the remaining functions - batch 2

-- 3. Update generate_migration_report
CREATE OR REPLACE FUNCTION public.generate_migration_report()
RETURNS TABLE(metric_name text, metric_value text, details text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  -- Company Statistics
  SELECT 
    'Total CRM Companies'::TEXT,
    COUNT(*)::TEXT,
    'Companies with HubSpot data: ' || 
    COUNT(*) FILTER (WHERE custom_fields->>'hubspot_import' = 'true')::TEXT
  FROM crm_companies
  
  UNION ALL
  
  -- Contact Statistics  
  SELECT 
    'Total CRM Contacts'::TEXT,
    COUNT(*)::TEXT,
    'Contacts with HubSpot data: ' || 
    COUNT(*) FILTER (WHERE custom_fields->>'hubspot_import' = 'true')::TEXT
  FROM crm_contacts
  
  UNION ALL
  
  -- Original Leads Count
  SELECT 
    'Original HubSpot Leads'::TEXT,
    COUNT(*)::TEXT,
    'Imported on: ' || MIN(created_at)::DATE::TEXT
  FROM leads 
  WHERE source = 'hubspot'
  
  UNION ALL
  
  -- Data Coverage Analysis
  SELECT 
    'Companies with Websites'::TEXT,
    COUNT(*) FILTER (WHERE website IS NOT NULL AND website != '')::TEXT,
    ROUND(
      COUNT(*) FILTER (WHERE website IS NOT NULL AND website != '') * 100.0 / 
      NULLIF(COUNT(*), 0), 1
    )::TEXT || '% coverage'
  FROM crm_companies 
  WHERE custom_fields->>'hubspot_import' = 'true'
  
  UNION ALL
  
  -- Contact Distribution
  SELECT 
    'Average Contacts per Company'::TEXT,
    ROUND(AVG(contact_count), 1)::TEXT,
    'Range: ' || MIN(contact_count)::TEXT || ' to ' || MAX(contact_count)::TEXT
  FROM (
    SELECT 
      cc.id,
      COUNT(con.id) as contact_count
    FROM crm_companies cc
    LEFT JOIN crm_contacts con ON con.company_id = cc.id
    WHERE cc.custom_fields->>'hubspot_import' = 'true'
    GROUP BY cc.id
  ) company_contacts
  
  UNION ALL
  
  -- Top Companies by Contact Count
  SELECT 
    'Top Company by Contacts'::TEXT,
    cc.name,
    COUNT(con.id)::TEXT || ' contacts'
  FROM crm_companies cc
  LEFT JOIN crm_contacts con ON con.company_id = cc.id
  WHERE cc.custom_fields->>'hubspot_import' = 'true'
  GROUP BY cc.id, cc.name
  ORDER BY COUNT(con.id) DESC
  LIMIT 1;
END;
$$;

-- 4. Update handle_employee_status_change
CREATE OR REPLACE FUNCTION public.handle_employee_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If employee is terminated, disable time tracking
  IF NEW.employment_status = 'terminated' AND OLD.employment_status != 'terminated' THEN
    NEW.time_tracking_enabled = false;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Update log_crm_activity
CREATE OR REPLACE FUNCTION public.log_crm_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Skip if this is an activity log insert to prevent recursion
    IF TG_TABLE_NAME = 'crm_activity_log' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    INSERT INTO public.crm_activity_log (
        entity_type,
        entity_id,
        activity_type,
        description,
        old_values,
        new_values,
        performed_by,
        performed_by_type
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'created'
            WHEN 'UPDATE' THEN 'updated'
            WHEN 'DELETE' THEN 'deleted'
        END,
        CASE TG_OP
            WHEN 'INSERT' THEN TG_TABLE_NAME || ' created'
            WHEN 'UPDATE' THEN TG_TABLE_NAME || ' updated'
            WHEN 'DELETE' THEN TG_TABLE_NAME || ' deleted'
        END,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        auth.uid(),
        'user'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;