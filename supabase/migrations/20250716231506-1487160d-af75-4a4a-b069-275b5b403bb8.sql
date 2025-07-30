-- Safer approach: Update foreign key references to point to the companies we want to keep
-- before deleting duplicates

-- Step 1: Create mapping of duplicate company IDs to the ID we want to keep
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

-- Step 2: Update audit_logs to point to the companies we're keeping
UPDATE audit_logs 
SET company_id = (
  SELECT new_id 
  FROM company_id_mapping 
  WHERE old_id = audit_logs.company_id
)
WHERE company_id IN (SELECT old_id FROM company_id_mapping);

-- Step 3: Update other tables that might reference company_settings
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

-- Continue with other tables...
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

-- Step 4: Now safely delete the duplicate companies
DELETE FROM company_settings 
WHERE id IN (SELECT old_id FROM company_id_mapping);

-- Step 5: Also delete any records with NULL company names
DELETE FROM company_settings 
WHERE company_name IS NULL OR company_name = '';

-- Show final results
SELECT 
  COUNT(*) as remaining_companies,
  COUNT(DISTINCT company_name) as unique_company_names,
  COUNT(*) - COUNT(DISTINCT company_name) as remaining_duplicates
FROM company_settings;