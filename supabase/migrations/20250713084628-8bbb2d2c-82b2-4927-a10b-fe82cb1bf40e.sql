-- Add company_logo_url column to client_onboarding_profiles table
ALTER TABLE public.client_onboarding_profiles 
ADD COLUMN company_logo_url TEXT;