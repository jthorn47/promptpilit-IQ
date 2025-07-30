-- Direct migration of HubSpot companies to CRM
-- Step 1: Create companies from unique company names in leads
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
SELECT DISTINCT ON (LOWER(TRIM(company_name)))
  company_name,
  (SELECT website FROM leads l2 
   WHERE LOWER(TRIM(l2.company_name)) = LOWER(TRIM(leads.company_name))
     AND l2.website IS NOT NULL 
     AND l2.website != ''
   LIMIT 1) as website,
  'prospect'::company_status,
  'Other'::company_type,
  'hubspot_import',
  MIN(created_at) as first_contact_date,
  NOW(),
  'Migrated from HubSpot import on ' || NOW()::date || '. Contains ' || COUNT(*) || ' contacts.',
  jsonb_build_object(
    'hubspot_import', true,
    'migration_date', NOW(),
    'original_contact_count', COUNT(*),
    'data_source', 'ConnectIQ_ContactImport_Reconciliation_v1'
  )
FROM leads 
WHERE company_name IS NOT NULL 
  AND company_name != ''
  AND source = 'hubspot'
  AND NOT EXISTS (
    SELECT 1 FROM crm_companies cc 
    WHERE LOWER(TRIM(cc.name)) = LOWER(TRIM(leads.company_name))
  )
GROUP BY LOWER(TRIM(company_name)), company_name;