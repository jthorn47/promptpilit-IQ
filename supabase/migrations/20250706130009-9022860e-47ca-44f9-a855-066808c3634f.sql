-- Fix all function search path warnings by recreating functions with explicit search_path

-- 1. Fix calculate_conversion_rate
CREATE OR REPLACE FUNCTION public.calculate_conversion_rate(start_date date, end_date date)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
 SET search_path = 'public'
AS $function$
DECLARE
  total_leads INTEGER;
  converted_leads INTEGER;
  conversion_rate NUMERIC;
BEGIN
  -- Count total leads in period
  SELECT COUNT(*) INTO total_leads
  FROM public.leads
  WHERE created_at::DATE BETWEEN start_date AND end_date;
  
  -- Count converted leads (deals created from leads)
  SELECT COUNT(DISTINCT l.id) INTO converted_leads
  FROM public.leads l
  INNER JOIN public.deals d ON l.id = d.lead_id
  WHERE l.created_at::DATE BETWEEN start_date AND end_date;
  
  -- Calculate conversion rate
  IF total_leads > 0 THEN
    conversion_rate := (converted_leads::NUMERIC / total_leads::NUMERIC) * 100;
  ELSE
    conversion_rate := 0;
  END IF;
  
  RETURN ROUND(conversion_rate, 2);
END;
$function$;

-- 2. Fix get_email_performance
CREATE OR REPLACE FUNCTION public.get_email_performance(start_date date, end_date date)
 RETURNS TABLE(total_campaigns integer, total_emails_sent integer, total_opened integer, total_clicked integer, total_bounced integer, open_rate numeric, click_rate numeric, bounce_rate numeric)
 LANGUAGE plpgsql
 STABLE
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT c.id)::INTEGER as total_campaigns,
    COALESCE(SUM(c.sent_count), 0)::INTEGER as total_emails_sent,
    COALESCE(SUM(c.opened_count), 0)::INTEGER as total_opened,
    COALESCE(SUM(c.clicked_count), 0)::INTEGER as total_clicked,
    COALESCE(SUM(c.bounced_count), 0)::INTEGER as total_bounced,
    CASE 
      WHEN SUM(c.sent_count) > 0 THEN 
        ROUND((SUM(c.opened_count)::NUMERIC / SUM(c.sent_count)::NUMERIC) * 100, 2)
      ELSE 0
    END as open_rate,
    CASE 
      WHEN SUM(c.sent_count) > 0 THEN 
        ROUND((SUM(c.clicked_count)::NUMERIC / SUM(c.sent_count)::NUMERIC) * 100, 2)
      ELSE 0
    END as click_rate,
    CASE 
      WHEN SUM(c.sent_count) > 0 THEN 
        ROUND((SUM(c.bounced_count)::NUMERIC / SUM(c.sent_count)::NUMERIC) * 100, 2)
      ELSE 0
    END as bounce_rate
  FROM public.email_campaigns c
  WHERE c.created_at::DATE BETWEEN start_date AND end_date
    AND c.status = 'sent';
END;
$function$;

-- 3. Fix get_pipeline_metrics
CREATE OR REPLACE FUNCTION public.get_pipeline_metrics(start_date date, end_date date)
 RETURNS TABLE(stage_name text, deal_count integer, total_value numeric, avg_deal_size numeric, win_rate numeric)
 LANGUAGE plpgsql
 STABLE
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ds.name as stage_name,
    COUNT(d.id)::INTEGER as deal_count,
    COALESCE(SUM(d.value), 0) as total_value,
    CASE 
      WHEN COUNT(d.id) > 0 THEN ROUND(AVG(d.value), 2)
      ELSE 0
    END as avg_deal_size,
    CASE 
      WHEN COUNT(d.id) > 0 THEN 
        ROUND((COUNT(CASE WHEN d.status = 'won' THEN 1 END)::NUMERIC / COUNT(d.id)::NUMERIC) * 100, 2)
      ELSE 0
    END as win_rate
  FROM public.deal_stages ds
  LEFT JOIN public.deals d ON ds.id = d.stage_id 
    AND d.created_at::DATE BETWEEN start_date AND end_date
  WHERE ds.is_active = true
  GROUP BY ds.id, ds.name, ds.stage_order
  ORDER BY ds.stage_order;
END;
$function$;

-- 4. Fix update_search_index
CREATE OR REPLACE FUNCTION public.update_search_index()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  -- Update search index when leads are modified
  IF TG_TABLE_NAME = 'leads' THEN
    INSERT INTO public.search_index (entity_type, entity_id, title, content, metadata)
    VALUES (
      'lead',
      NEW.id,
      NEW.first_name || ' ' || NEW.last_name,
      COALESCE(NEW.first_name, '') || ' ' || 
      COALESCE(NEW.last_name, '') || ' ' || 
      COALESCE(NEW.email, '') || ' ' || 
      COALESCE(NEW.company_name, '') || ' ' || 
      COALESCE(NEW.notes, ''),
      json_build_object('status', NEW.status, 'source', NEW.source)
    )
    ON CONFLICT (entity_type, entity_id) 
    DO UPDATE SET 
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      metadata = EXCLUDED.metadata,
      updated_at = now();
  END IF;
  
  -- Update search index when deals are modified
  IF TG_TABLE_NAME = 'deals' THEN
    INSERT INTO public.search_index (entity_type, entity_id, title, content, metadata)
    VALUES (
      'deal',
      NEW.id,
      NEW.title,
      COALESCE(NEW.title, '') || ' ' || 
      COALESCE(NEW.company_name, '') || ' ' || 
      COALESCE(NEW.contact_name, '') || ' ' || 
      COALESCE(NEW.notes, ''),
      json_build_object('status', NEW.status, 'value', NEW.value)
    )
    ON CONFLICT (entity_type, entity_id) 
    DO UPDATE SET 
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      metadata = EXCLUDED.metadata,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 5. Fix trigger_automation_workflows
CREATE OR REPLACE FUNCTION public.trigger_automation_workflows()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  workflow_record RECORD;
  execution_id UUID;
BEGIN
  -- Find matching workflows for this trigger
  FOR workflow_record IN
    SELECT * FROM public.automation_workflows 
    WHERE is_active = true 
    AND trigger_type = TG_TABLE_NAME || '_' || TG_OP
  LOOP
    -- Create execution record
    INSERT INTO public.automation_executions (workflow_id, trigger_data, status)
    VALUES (
      workflow_record.id,
      row_to_json(NEW),
      'pending'
    ) RETURNING id INTO execution_id;
    
    -- Log the trigger
    RAISE NOTICE 'Automation workflow % triggered by % on %', 
      workflow_record.name, TG_OP, TG_TABLE_NAME;
  END LOOP;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 6. Fix is_easeworks_user
CREATE OR REPLACE FUNCTION public.is_easeworks_user(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = _user_id
      AND p.email ILIKE '%@easeworks.com'
  )
$function$;

-- 7. Fix has_crm_role
CREATE OR REPLACE FUNCTION public.has_crm_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON ur.user_id = p.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND p.email ILIKE '%@easeworks.com'
      AND _role IN ('sales_rep', 'super_admin')
  )
$function$;

-- 8. Fix validate_crm_role_assignment
CREATE OR REPLACE FUNCTION public.validate_crm_role_assignment()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  -- Check if the role is a CRM role (sales_rep or super_admin)
  IF NEW.role IN ('sales_rep', 'super_admin') THEN
    -- Check if user has @easeworks.com email
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = NEW.user_id 
      AND p.email ILIKE '%@easeworks.com'
    ) THEN
      RAISE EXCEPTION 'CRM roles (sales_rep, super_admin) can only be assigned to @easeworks.com users';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 9. Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 10. Fix has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- 11. Fix has_company_role
CREATE OR REPLACE FUNCTION public.has_company_role(_user_id uuid, _role app_role, _company_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (company_id = _company_id OR role = 'super_admin')
  )
$function$;

-- 12. Fix get_user_company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT company_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role IN ('company_admin', 'learner')
  LIMIT 1
$function$;