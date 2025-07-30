-- Complete cleanup including company_contacts
CREATE TEMP TABLE company_id_mapping AS
WITH companies_to_keep AS (
  SELECT DISTINCT ON (company_name) 
    id as keep_id,
    company_name
  FROM company_settings 
  WHERE company_name IS NOT NULL
  ORDER BY company_name, created_at DESC
),
all_companies AS (
  SELECT id, company_name
  FROM company_settings 
  WHERE company_name IS NOT NULL
)
SELECT 
  ac.id as old_id,
  ctk.keep_id as new_id,
  ac.company_name
FROM all_companies ac
JOIN companies_to_keep ctk ON ac.company_name = ctk.company_name
WHERE ac.id != ctk.keep_id;

-- Update company_contacts table
UPDATE company_contacts 
SET company_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = company_contacts.company_id
)
WHERE company_id IN (SELECT old_id FROM company_id_mapping);

-- Update all other tables
UPDATE clients 
SET company_settings_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = clients.company_settings_id
)
WHERE company_settings_id IN (SELECT old_id FROM company_id_mapping);

UPDATE audit_logs 
SET company_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = audit_logs.company_id
)
WHERE company_id IN (SELECT old_id FROM company_id_mapping);

UPDATE ach_audit_logs 
SET company_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = ach_audit_logs.company_id
)
WHERE company_id IN (SELECT old_id FROM company_id_mapping);

UPDATE ach_batches 
SET company_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = ach_batches.company_id
)
WHERE company_id IN (SELECT old_id FROM company_id_mapping);

UPDATE analytics_alerts 
SET company_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = analytics_alerts.company_id
)
WHERE company_id IN (SELECT old_id FROM company_id_mapping);

UPDATE analytics_dashboards 
SET company_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = analytics_dashboards.company_id
)
WHERE company_id IN (SELECT old_id FROM company_id_mapping);

UPDATE analytics_metrics 
SET company_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = analytics_metrics.company_id
)
WHERE company_id IN (SELECT old_id FROM company_id_mapping);

UPDATE activities 
SET company_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = activities.company_id
)
WHERE company_id IN (SELECT old_id FROM company_id_mapping);

UPDATE bulk_operations 
SET company_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = bulk_operations.company_id
)
WHERE company_id IN (SELECT old_id FROM company_id_mapping);

UPDATE certificate_templates 
SET company_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = certificate_templates.company_id
)
WHERE company_id IN (SELECT old_id FROM company_id_mapping);

UPDATE certificates 
SET company_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = certificates.company_id
)
WHERE company_id IN (SELECT old_id FROM company_id_mapping);

-- Now safely delete the duplicate companies
DELETE FROM company_settings 
WHERE id IN (SELECT old_id FROM company_id_mapping);

-- Also delete any records with NULL company names
DELETE FROM company_settings 
WHERE company_name IS NULL OR company_name = '';

-- Show final results
SELECT 
  COUNT(*) as remaining_companies,
  COUNT(DISTINCT company_name) as unique_company_names,
  COUNT(*) - COUNT(DISTINCT company_name) as remaining_duplicates
FROM company_settings;