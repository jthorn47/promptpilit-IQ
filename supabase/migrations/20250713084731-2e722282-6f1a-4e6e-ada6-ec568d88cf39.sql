-- Add missing columns to client_onboarding_profiles table
ALTER TABLE public.client_onboarding_profiles 
ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;