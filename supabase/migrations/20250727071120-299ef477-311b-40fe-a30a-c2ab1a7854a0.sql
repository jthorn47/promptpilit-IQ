-- Clean up duplicate companies and consolidate contacts - Simple approach
-- Step 1: Create temporary table with companies to keep
CREATE TEMP TABLE companies_to_keep AS
SELECT DISTINCT ON (name) 
  id as keep_id,
  name
FROM crm_companies 
WHERE custom_fields->>'hubspot_import' = 'true'
ORDER BY name, created_at ASC;

-- Step 2: Update contacts to point to the kept companies
UPDATE crm_contacts 
SET company_id = ctk.keep_id
FROM companies_to_keep ctk
JOIN crm_companies cc ON cc.name = ctk.name
WHERE crm_contacts.company_id = cc.id
AND cc.id != ctk.keep_id
AND cc.custom_fields->>'hubspot_import' = 'true';

-- Step 3: Delete duplicate companies
DELETE FROM crm_companies 
WHERE custom_fields->>'hubspot_import' = 'true'
AND id NOT IN (SELECT keep_id FROM companies_to_keep);

-- Step 4: Create temp table for contacts to keep (one per company/email combo)
CREATE TEMP TABLE contacts_to_keep AS
SELECT DISTINCT ON (company_id, email) 
  id as keep_id,
  company_id,
  email
FROM crm_contacts 
WHERE custom_fields->>'hubspot_import' = 'true'
AND email IS NOT NULL
ORDER BY company_id, email, created_at ASC;

-- Step 5: Delete duplicate contacts
DELETE FROM crm_contacts 
WHERE custom_fields->>'hubspot_import' = 'true'
AND email IS NOT NULL
AND id NOT IN (SELECT keep_id FROM contacts_to_keep);

-- Step 6: Reset all primary contact flags
UPDATE crm_contacts 
SET is_primary_contact = false
WHERE custom_fields->>'hubspot_import' = 'true';

-- Step 7: Set one primary contact per company
CREATE TEMP TABLE primary_contacts AS
SELECT DISTINCT ON (company_id) 
  id as primary_id,
  company_id
FROM crm_contacts 
WHERE custom_fields->>'hubspot_import' = 'true'
ORDER BY company_id, created_at ASC;

UPDATE crm_contacts 
SET is_primary_contact = true
FROM primary_contacts pc
WHERE crm_contacts.id = pc.primary_id;