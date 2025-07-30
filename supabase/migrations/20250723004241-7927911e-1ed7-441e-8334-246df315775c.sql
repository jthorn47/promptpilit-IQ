-- Fix the onboarding_codes foreign key constraint to properly reference clients table
-- Drop the existing foreign key constraint
ALTER TABLE public.onboarding_codes DROP CONSTRAINT IF EXISTS onboarding_codes_company_id_fkey;

-- Add new foreign key constraint that references clients table instead
ALTER TABLE public.onboarding_codes ADD CONSTRAINT onboarding_codes_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.clients(id) ON DELETE CASCADE;