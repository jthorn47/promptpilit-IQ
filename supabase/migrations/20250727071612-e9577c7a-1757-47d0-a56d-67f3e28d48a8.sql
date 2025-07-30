-- Migrate CRM contacts to company_contacts for company profile integration
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
  cc.company_id,
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
WHERE cc.custom_fields->>'hubspot_import' = 'true'
ON CONFLICT (company_id, email) DO NOTHING;