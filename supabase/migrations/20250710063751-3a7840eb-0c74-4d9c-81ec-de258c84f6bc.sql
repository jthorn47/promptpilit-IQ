-- Add industry field to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN industry TEXT;