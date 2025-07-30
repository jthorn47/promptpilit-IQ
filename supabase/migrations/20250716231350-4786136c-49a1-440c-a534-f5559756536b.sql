-- Clean up duplicate companies by keeping only the most recent record for each company name
-- This will remove 16,664 duplicate records and keep 12,506 unique companies

-- First, create a temporary table with the IDs to keep (most recent record for each company name)
CREATE TEMP TABLE companies_to_keep AS
SELECT DISTINCT ON (company_name) id
FROM company_settings 
WHERE company_name IS NOT NULL
ORDER BY company_name, created_at DESC;

-- Delete all records that are NOT in the companies_to_keep list
DELETE FROM company_settings 
WHERE company_name IS NOT NULL 
AND id NOT IN (SELECT id FROM companies_to_keep);

-- Also delete any records with NULL company names as they're not useful
DELETE FROM company_settings 
WHERE company_name IS NULL OR company_name = '';

-- Show final count
SELECT 
  COUNT(*) as remaining_companies,
  COUNT(DISTINCT company_name) as unique_company_names
FROM company_settings;