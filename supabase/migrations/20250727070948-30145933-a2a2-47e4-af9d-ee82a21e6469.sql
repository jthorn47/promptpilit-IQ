-- Clean up duplicate companies and consolidate contacts
-- Step 1: Identify and remove duplicate companies, keeping the first created one
WITH duplicate_companies AS (
  SELECT 
    name,
    (array_agg(id ORDER BY created_at ASC))[1] as keep_id,
    array_agg(id ORDER BY created_at ASC) as all_ids
  FROM crm_companies 
  WHERE custom_fields->>'hubspot_import' = 'true'
  GROUP BY name 
  HAVING COUNT(*) > 1
),
remove_companies AS (
  SELECT 
    name,
    keep_id,
    unnest(all_ids[2:]) as remove_id
  FROM duplicate_companies
)
-- First, update contacts to point to the kept company
UPDATE crm_contacts 
SET company_id = dc.keep_id
FROM remove_companies dc
WHERE crm_contacts.company_id = dc.remove_id;

-- Delete duplicate companies
DELETE FROM crm_companies 
WHERE id IN (
  SELECT remove_id FROM (
    SELECT 
      name,
      (array_agg(id ORDER BY created_at ASC))[1] as keep_id,
      unnest(array_agg(id ORDER BY created_at ASC)[2:]) as remove_id
    FROM crm_companies 
    WHERE custom_fields->>'hubspot_import' = 'true'
    GROUP BY name 
    HAVING COUNT(*) > 1
  ) dc
);

-- Remove duplicate contacts that now have same email at same company
WITH duplicate_contacts AS (
  SELECT 
    company_id,
    email,
    (array_agg(id ORDER BY created_at ASC))[1] as keep_id,
    array_agg(id ORDER BY created_at ASC) as all_ids
  FROM crm_contacts 
  WHERE custom_fields->>'hubspot_import' = 'true'
  AND email IS NOT NULL
  GROUP BY company_id, email 
  HAVING COUNT(*) > 1
)
DELETE FROM crm_contacts 
WHERE id IN (
  SELECT unnest(all_ids[2:])
  FROM duplicate_contacts
);

-- Update primary contact flags to ensure only one per company
UPDATE crm_contacts 
SET is_primary_contact = false
WHERE custom_fields->>'hubspot_import' = 'true';

WITH primary_contacts AS (
  SELECT 
    company_id,
    (array_agg(id ORDER BY created_at ASC))[1] as primary_contact_id
  FROM crm_contacts 
  WHERE custom_fields->>'hubspot_import' = 'true'
  GROUP BY company_id
)
UPDATE crm_contacts 
SET is_primary_contact = true
FROM primary_contacts pc
WHERE crm_contacts.id = pc.primary_contact_id;