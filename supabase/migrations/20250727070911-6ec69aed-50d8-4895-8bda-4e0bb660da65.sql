-- Clean up duplicate companies and consolidate contacts
-- Step 1: Identify and remove duplicate companies, keeping the first created one
WITH duplicate_companies AS (
  SELECT 
    name,
    MIN(id) as keep_id,
    array_agg(id) FILTER (WHERE id != MIN(id)) as remove_ids
  FROM crm_companies 
  WHERE custom_fields->>'hubspot_import' = 'true'
  GROUP BY name 
  HAVING COUNT(*) > 1
),
contact_updates AS (
  -- Update contacts to point to the kept company
  UPDATE crm_contacts 
  SET company_id = dc.keep_id
  FROM duplicate_companies dc
  WHERE crm_contacts.company_id = ANY(dc.remove_ids)
  RETURNING crm_contacts.id, crm_contacts.company_id
),
-- Remove duplicate contacts that now point to the same company with same email
duplicate_contacts AS (
  SELECT 
    c1.id as keep_id,
    array_agg(c2.id) as remove_ids
  FROM crm_contacts c1
  JOIN crm_contacts c2 ON (
    c1.company_id = c2.company_id 
    AND c1.email = c2.email 
    AND c1.id < c2.id
    AND c1.custom_fields->>'hubspot_import' = 'true'
    AND c2.custom_fields->>'hubspot_import' = 'true'
  )
  GROUP BY c1.id
)
-- Delete duplicate contacts
DELETE FROM crm_contacts 
WHERE id IN (
  SELECT unnest(remove_ids) 
  FROM duplicate_contacts
);

-- Delete duplicate companies
DELETE FROM crm_companies 
WHERE id IN (
  SELECT unnest(remove_ids) 
  FROM (
    SELECT 
      name,
      array_agg(id) FILTER (WHERE id != MIN(id)) as remove_ids
    FROM crm_companies 
    WHERE custom_fields->>'hubspot_import' = 'true'
    GROUP BY name 
    HAVING COUNT(*) > 1
  ) dc
);

-- Update primary contact flags to ensure only one per company
WITH primary_updates AS (
  SELECT 
    company_id,
    MIN(id) as primary_contact_id
  FROM crm_contacts 
  WHERE custom_fields->>'hubspot_import' = 'true'
  GROUP BY company_id
)
UPDATE crm_contacts 
SET is_primary_contact = (id = pu.primary_contact_id)
FROM primary_updates pu
WHERE crm_contacts.company_id = pu.company_id
AND crm_contacts.custom_fields->>'hubspot_import' = 'true';