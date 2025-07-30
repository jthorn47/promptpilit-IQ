-- Fix the migration functions with correct enum values
CREATE OR REPLACE FUNCTION migrate_hubspot_companies()
RETURNS TABLE(
  companies_created INTEGER,
  companies_skipped INTEGER,
  total_unique_companies INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  created_count INTEGER := 0;
  skipped_count INTEGER := 0;
  total_count INTEGER;
BEGIN
  -- Get total unique companies from leads
  SELECT COUNT(DISTINCT company_name) INTO total_count
  FROM leads 
  WHERE company_name IS NOT NULL 
    AND company_name != '' 
    AND source = 'hubspot';
  
  -- Insert unique companies from leads into crm_companies
  WITH unique_companies AS (
    SELECT DISTINCT ON (LOWER(TRIM(company_name)))
      LOWER(TRIM(company_name)) as normalized_name,
      company_name,
      -- Extract website from leads if available
      (SELECT website FROM leads l2 
       WHERE LOWER(TRIM(l2.company_name)) = LOWER(TRIM(leads.company_name))
         AND l2.website IS NOT NULL 
         AND l2.website != ''
       LIMIT 1) as website,
      -- Get first contact for reference
      MIN(created_at) as first_contact_date,
      COUNT(*) as contact_count
    FROM leads 
    WHERE company_name IS NOT NULL 
      AND company_name != ''
      AND source = 'hubspot'
    GROUP BY LOWER(TRIM(company_name)), company_name
  ),
  inserted_companies AS (
    INSERT INTO crm_companies (
      name,
      website,
      status,
      type,
      lead_source,
      created_at,
      updated_at,
      notes,
      custom_fields
    )
    SELECT 
      uc.company_name,
      uc.website,
      'prospect'::company_status,
      'Other'::company_type,
      'hubspot_import',
      uc.first_contact_date,
      NOW(),
      'Migrated from HubSpot import on ' || NOW()::date || '. Contains ' || uc.contact_count || ' contacts.',
      jsonb_build_object(
        'hubspot_import', true,
        'migration_date', NOW(),
        'original_contact_count', uc.contact_count,
        'data_source', 'ConnectIQ_ContactImport_Reconciliation_v1'
      )
    FROM unique_companies uc
    WHERE NOT EXISTS (
      SELECT 1 FROM crm_companies cc 
      WHERE LOWER(TRIM(cc.name)) = uc.normalized_name
    )
    RETURNING id
  )
  SELECT COUNT(*) INTO created_count FROM inserted_companies;
  
  skipped_count := total_count - created_count;
  
  RETURN QUERY SELECT created_count, skipped_count, total_count;
END;
$$;

-- Fix the contacts migration function as well
CREATE OR REPLACE FUNCTION migrate_hubspot_contacts()
RETURNS TABLE(
  contacts_created INTEGER,
  contacts_linked INTEGER,
  contacts_orphaned INTEGER,
  total_leads INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  created_count INTEGER := 0;
  linked_count INTEGER := 0;
  orphaned_count INTEGER := 0;
  total_count INTEGER;
BEGIN
  -- Get total HubSpot leads count
  SELECT COUNT(*) INTO total_count
  FROM leads 
  WHERE source = 'hubspot';
  
  -- Migrate leads to crm_contacts with company linking
  WITH contact_company_mapping AS (
    SELECT 
      l.*,
      cc.id as company_id,
      ROW_NUMBER() OVER (
        PARTITION BY cc.id 
        ORDER BY l.created_at ASC
      ) as contact_rank
    FROM leads l
    LEFT JOIN crm_companies cc ON (
      LOWER(TRIM(cc.name)) = LOWER(TRIM(l.company_name))
      AND cc.custom_fields->>'hubspot_import' = 'true'
    )
    WHERE l.source = 'hubspot'
  ),
  inserted_contacts AS (
    INSERT INTO crm_contacts (
      company_id,
      first_name,
      last_name,
      email,
      phone,
      mobile_phone,
      title,
      is_primary_contact,
      is_active,
      preferred_contact_method,
      last_contacted_at,
      notes,
      tags,
      custom_fields,
      created_at,
      updated_at
    )
    SELECT 
      ccm.company_id,
      ccm.first_name,
      ccm.last_name,
      ccm.email,
      ccm.phone,
      ccm.phone, -- Also set as mobile_phone
      CASE 
        WHEN ccm.company_name IS NOT NULL AND ccm.company_name != '' 
        THEN 'Contact at ' || ccm.company_name
        ELSE 'HubSpot Contact'
      END,
      (ccm.contact_rank = 1), -- First contact per company is primary
      true,
      'email',
      ccm.last_contact_date,
      'Migrated from HubSpot leads on ' || NOW()::date || 
      CASE 
        WHEN ccm.notes IS NOT NULL AND ccm.notes != '' 
        THEN '. Original notes: ' || ccm.notes
        ELSE ''
      END,
      ARRAY['hubspot-import', 'migrated']::text[],
      jsonb_build_object(
        'hubspot_import', true,
        'migration_date', NOW(),
        'original_lead_id', ccm.id,
        'original_status', ccm.status,
        'original_source', ccm.source,
        'original_score', ccm.lead_score,
        'original_assigned_to', ccm.assigned_to,
        'data_source', 'ConnectIQ_ContactImport_Reconciliation_v1'
      ),
      ccm.created_at,
      NOW()
    FROM contact_company_mapping ccm
    WHERE ccm.company_id IS NOT NULL -- Only insert contacts with valid company links
    RETURNING id, company_id
  )
  SELECT COUNT(*) INTO created_count FROM inserted_contacts;
  
  -- Count successfully linked contacts
  linked_count := created_count;
  
  -- Count orphaned contacts (leads without company match)
  SELECT COUNT(*) INTO orphaned_count
  FROM leads l
  LEFT JOIN crm_companies cc ON (
    LOWER(TRIM(cc.name)) = LOWER(TRIM(l.company_name))
    AND cc.custom_fields->>'hubspot_import' = 'true'
  )
  WHERE l.source = 'hubspot' 
    AND cc.id IS NULL;
  
  RETURN QUERY SELECT created_count, linked_count, orphaned_count, total_count;
END;
$$;