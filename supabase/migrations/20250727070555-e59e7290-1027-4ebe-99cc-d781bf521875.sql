-- Step 2: Migrate HubSpot leads to CRM contacts with company linking
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
  cc.id as company_id,
  l.first_name,
  l.last_name,
  l.email,
  l.phone,
  l.phone, -- Also set as mobile_phone
  CASE 
    WHEN l.company_name IS NOT NULL AND l.company_name != '' 
    THEN 'Contact at ' || l.company_name
    ELSE 'HubSpot Contact'
  END as title,
  ROW_NUMBER() OVER (PARTITION BY cc.id ORDER BY l.created_at ASC) = 1 as is_primary_contact,
  true as is_active,
  'email' as preferred_contact_method,
  l.last_contact_date,
  'Migrated from HubSpot leads on ' || NOW()::date || 
  CASE 
    WHEN l.notes IS NOT NULL AND l.notes != '' 
    THEN '. Original notes: ' || l.notes
    ELSE ''
  END as notes,
  ARRAY['hubspot-import', 'migrated']::text[] as tags,
  jsonb_build_object(
    'hubspot_import', true,
    'migration_date', NOW(),
    'original_lead_id', l.id,
    'original_status', l.status,
    'original_source', l.source,
    'original_score', l.lead_score,
    'original_assigned_to', l.assigned_to,
    'data_source', 'ConnectIQ_ContactImport_Reconciliation_v1'
  ) as custom_fields,
  l.created_at,
  NOW() as updated_at
FROM leads l
INNER JOIN crm_companies cc ON (
  LOWER(TRIM(cc.name)) = LOWER(TRIM(l.company_name))
  AND cc.custom_fields->>'hubspot_import' = 'true'
)
WHERE l.source = 'hubspot';