-- Migrate CRM contacts to company_contacts using company name matching
INSERT INTO company_contacts (
  company_id,
  first_name,
  last_name,
  email,
  phone,
  job_title,
  is_primary,
  notes,
  status,
  created_at,
  updated_at
)
SELECT 
  cs.id as company_id,  -- Use company_settings ID
  cc.first_name,
  cc.last_name,
  cc.email,
  COALESCE(cc.phone, cc.mobile_phone, cc.direct_line) as phone,
  cc.title as job_title,
  COALESCE(cc.is_primary_contact, false) as is_primary,
  CASE 
    WHEN cc.notes IS NOT NULL 
    THEN cc.notes || ' (Migrated from CRM)'
    ELSE 'Migrated from CRM contacts'
  END as notes,
  CASE 
    WHEN cc.is_active = true THEN 'active'
    ELSE 'inactive'
  END as status,
  cc.created_at,
  cc.updated_at
FROM crm_contacts cc
JOIN crm_companies comp ON cc.company_id = comp.id
JOIN company_settings cs ON LOWER(TRIM(comp.name)) = LOWER(TRIM(cs.company_name))
WHERE comp.custom_fields->>'hubspot_import' = 'true'
AND NOT EXISTS (
  SELECT 1 FROM company_contacts existing 
  WHERE existing.company_id = cs.id 
  AND existing.email = cc.email
);