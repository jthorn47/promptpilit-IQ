-- Add company_owner field to track internal person who brought the company in
ALTER TABLE public.company_settings 
ADD COLUMN company_owner UUID REFERENCES auth.users(id),
ADD COLUMN company_owner_name TEXT;