-- STAGE 1.2: Clean slate - Archive old data and add leads/prospects to sidebar

-- Archive old leads table data (keep for reference)
CREATE TABLE public.leads_archive AS SELECT * FROM public.leads;

-- Clear current data for fresh start
TRUNCATE TABLE public.leads CASCADE;
TRUNCATE TABLE public.deals CASCADE;
TRUNCATE TABLE public.activities CASCADE;

-- Add sample contacts to demonstrate new structure
INSERT INTO public.company_contacts (company_id, first_name, last_name, email, phone, job_title, is_primary, created_by)
SELECT 
  cs.id as company_id,
  'John' as first_name,
  'Doe' as last_name,
  'john.doe@' || LOWER(REPLACE(cs.company_name, ' ', '')) || '.com' as email,
  '+1-555-' || LPAD((RANDOM() * 9999)::INTEGER::TEXT, 4, '0') as phone,
  'CEO' as job_title,
  true as is_primary,
  (SELECT id FROM auth.users LIMIT 1) as created_by
FROM public.company_settings cs
WHERE cs.id IN (
  SELECT id FROM public.company_settings 
  ORDER BY created_at DESC 
  LIMIT 5
);

-- Clean up old client JSONB contacts
UPDATE public.clients SET key_contacts = '[]'::jsonb WHERE key_contacts IS NOT NULL;