-- ConnectIQ_ContactImport_Reconciliation_v1: Complete HubSpot Data Migration
-- This migration transforms the flat HubSpot leads import into structured CRM data

-- Phase 1: Create Companies from HubSpot Leads Data
CREATE OR REPLACE FUNCTION migrate_hubspot_companies()
RETURNS TABLE(
  companies_created INTEGER,
  companies_skipped INTEGER,
  total_unique_companies INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
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
      'prospect'::company_type,
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

-- Phase 2: Migrate Leads to CRM Contacts with Company Linking
CREATE OR REPLACE FUNCTION migrate_hubspot_contacts()
RETURNS TABLE(
  contacts_created INTEGER,
  contacts_linked INTEGER,
  contacts_orphaned INTEGER,
  total_leads INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Phase 3: Generate Migration Report and Statistics
CREATE OR REPLACE FUNCTION generate_migration_report()
RETURNS TABLE(
  metric_name TEXT,
  metric_value TEXT,
  details TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Phase 4: Create Migration Validation Functions
CREATE OR REPLACE FUNCTION validate_migration_integrity()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  details TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Check 1: All companies have at least one contact
  SELECT 
    'Companies without Contacts'::TEXT,
    CASE 
      WHEN COUNT(*) = 0 THEN 'PASS'::TEXT 
      ELSE 'WARNING'::TEXT 
    END,
    COUNT(*)::TEXT || ' companies found without contacts'
  FROM crm_companies cc
  LEFT JOIN crm_contacts con ON con.company_id = cc.id
  WHERE cc.custom_fields->>'hubspot_import' = 'true'
    AND con.id IS NULL
  GROUP BY ()
  
  UNION ALL
  
  -- Check 2: All contacts have valid company links
  SELECT 
    'Orphaned Contacts'::TEXT,
    CASE 
      WHEN COUNT(*) = 0 THEN 'PASS'::TEXT 
      ELSE 'FAIL'::TEXT 
    END,
    COUNT(*)::TEXT || ' contacts without valid company links'
  FROM crm_contacts con
  WHERE con.custom_fields->>'hubspot_import' = 'true'
    AND con.company_id IS NULL
  GROUP BY ()
  
  UNION ALL
  
  -- Check 3: Primary contact assignment
  SELECT 
    'Companies without Primary Contact'::TEXT,
    CASE 
      WHEN COUNT(*) = 0 THEN 'PASS'::TEXT 
      ELSE 'WARNING'::TEXT 
    END,
    COUNT(*)::TEXT || ' companies missing primary contact designation'
  FROM crm_companies cc
  LEFT JOIN crm_contacts con ON (con.company_id = cc.id AND con.is_primary_contact = true)
  WHERE cc.custom_fields->>'hubspot_import' = 'true'
    AND con.id IS NULL
  GROUP BY ()
  
  UNION ALL
  
  -- Check 4: Data preservation verification
  SELECT 
    'HubSpot Metadata Preserved'::TEXT,
    CASE 
      WHEN COUNT(*) > 0 THEN 'PASS'::TEXT 
      ELSE 'FAIL'::TEXT 
    END,
    COUNT(*)::TEXT || ' records contain original HubSpot data'
  FROM (
    SELECT id FROM crm_companies WHERE custom_fields->>'hubspot_import' = 'true'
    UNION ALL
    SELECT id FROM crm_contacts WHERE custom_fields->>'hubspot_import' = 'true'
  ) combined
  GROUP BY ();
END;
$$;