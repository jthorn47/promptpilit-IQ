
-- First, let's back up the existing tables before making changes
CREATE TABLE IF NOT EXISTS public.leads_backup_before_migration AS SELECT * FROM public.leads;
CREATE TABLE IF NOT EXISTS public.company_contacts_backup_before_migration AS SELECT * FROM public.company_contacts;

-- Create a temporary table to store the mapping between company names and IDs
CREATE TEMP TABLE company_name_to_id AS
SELECT id, LOWER(company_name) as lower_company_name
FROM public.company_settings
WHERE company_name IS NOT NULL;

-- Create an index on the temporary table for better performance
CREATE INDEX temp_company_name_idx ON company_name_to_id (lower_company_name);

-- Move contacts from leads to company_contacts and link them to companies
INSERT INTO public.company_contacts (
  first_name,
  last_name,
  email,
  phone,
  job_title,
  company_id,
  is_primary,
  status,
  notes,
  created_at,
  updated_at,
  created_by
)
SELECT 
  l.first_name,
  l.last_name,
  l.email,
  l.phone,
  l.title as job_title,
  c.id as company_id,
  false as is_primary,
  'active' as status,
  CASE 
    WHEN l.notes IS NOT NULL THEN l.notes 
    ELSE 'Imported from HubSpot via leads table migration'
  END as notes,
  l.created_at,
  NOW() as updated_at,
  '00000000-0000-0000-0000-000000000000'::uuid as created_by
FROM 
  public.leads l
LEFT JOIN 
  company_name_to_id c ON LOWER(l.company_name) = c.lower_company_name
WHERE 
  l.source = 'hubspot_import'
  AND l.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.company_contacts cc 
    WHERE cc.email = l.email
  )
ON CONFLICT (email) DO NOTHING;

-- Calculate statistics for reporting purposes
DO $$
DECLARE
  total_contacts INT;
  contacts_with_company INT;
  contacts_without_company INT;
  contacts_migrated INT;
BEGIN
  SELECT COUNT(*) INTO total_contacts FROM public.leads WHERE source = 'hubspot_import';
  
  SELECT COUNT(*) INTO contacts_with_company 
  FROM public.leads l
  JOIN company_name_to_id c ON LOWER(l.company_name) = c.lower_company_name
  WHERE l.source = 'hubspot_import';
  
  SELECT COUNT(*) INTO contacts_without_company 
  FROM public.leads l
  LEFT JOIN company_name_to_id c ON LOWER(l.company_name) = c.lower_company_name
  WHERE l.source = 'hubspot_import' AND c.id IS NULL;
  
  SELECT COUNT(*) INTO contacts_migrated FROM public.company_contacts 
  WHERE created_by = '00000000-0000-0000-0000-000000000000'::uuid;
  
  RAISE NOTICE 'Migration summary: % total contacts, % with company match, % without company match, % migrated', 
    total_contacts, contacts_with_company, contacts_without_company, contacts_migrated;
END $$;

-- Update the company_contacts table to set the primary contact for each company
-- We'll set the first contact (alphabetically by email) as primary for each company
WITH primary_contacts AS (
  SELECT DISTINCT ON (company_id) 
    id, 
    company_id
  FROM 
    public.company_contacts
  WHERE 
    company_id IS NOT NULL
  ORDER BY 
    company_id, 
    email
)
UPDATE public.company_contacts cc
SET is_primary = true
FROM primary_contacts pc
WHERE cc.id = pc.id;

-- Create a table to track which leads should be kept vs removed
CREATE TEMP TABLE leads_to_keep AS 
SELECT l.id 
FROM public.leads l
WHERE l.source != 'hubspot_import' 
   OR l.status IN ('qualified', 'proposal', 'negotiation');

-- Remove the contacts that have been migrated from the leads table
DELETE FROM public.leads l
WHERE l.source = 'hubspot_import'
  AND NOT EXISTS (SELECT 1 FROM leads_to_keep ltk WHERE ltk.id = l.id);

-- Drop the temporary tables
DROP TABLE company_name_to_id;
DROP TABLE leads_to_keep;

-- Create a migration log for auditing purposes
CREATE TABLE IF NOT EXISTS public.migration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  affected_tables TEXT[] NOT NULL,
  rows_affected JSONB NOT NULL,
  notes TEXT
);

-- Insert a log entry for this migration
INSERT INTO public.migration_logs (
  migration_name,
  affected_tables,
  rows_affected,
  notes
)
VALUES (
  'hubspot_contacts_migration',
  ARRAY['leads', 'company_contacts'],
  jsonb_build_object(
    'contacts_migrated', (SELECT COUNT(*) FROM public.company_contacts WHERE created_by = '00000000-0000-0000-0000-000000000000'::uuid),
    'leads_before', (SELECT COUNT(*) FROM public.leads_backup_before_migration),
    'leads_after', (SELECT COUNT(*) FROM public.leads),
    'company_contacts_before', (SELECT COUNT(*) FROM public.company_contacts_backup_before_migration),
    'company_contacts_after', (SELECT COUNT(*) FROM public.company_contacts)
  ),
  'Migrated HubSpot contacts from leads table to company_contacts table with company linkage'
);
