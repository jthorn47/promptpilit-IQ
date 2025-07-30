-- Remove duplicate leads, keeping the most recent record for each email
WITH duplicate_leads AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM leads
  WHERE email IS NOT NULL AND email != ''
)
DELETE FROM leads 
WHERE id IN (
  SELECT id FROM duplicate_leads WHERE rn > 1
);

-- Remove duplicate companies, keeping the most recent record for each company name
WITH duplicate_companies AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY company_name ORDER BY created_at DESC) as rn
  FROM company_settings
)
DELETE FROM company_settings 
WHERE id IN (
  SELECT id FROM duplicate_companies WHERE rn > 1
);

-- Remove duplicate deals, keeping the most recent record for each title+company combination
WITH duplicate_deals AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY title, company_name ORDER BY created_at DESC) as rn
  FROM deals
)
DELETE FROM deals 
WHERE id IN (
  SELECT id FROM duplicate_deals WHERE rn > 1
);

-- Clean up any orphaned activities that may reference deleted deals/leads
DELETE FROM activities 
WHERE lead_id IS NOT NULL 
AND lead_id NOT IN (SELECT id FROM leads);

DELETE FROM activities 
WHERE deal_id IS NOT NULL 
AND deal_id NOT IN (SELECT id FROM deals);