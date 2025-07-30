-- Add HubSpot company fields to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN website TEXT,
ADD COLUMN description TEXT,
ADD COLUMN founded_year INTEGER,
ADD COLUMN employee_count INTEGER,
ADD COLUMN annual_revenue NUMERIC,
ADD COLUMN phone TEXT,
ADD COLUMN address TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN country TEXT DEFAULT 'United States',
ADD COLUMN postal_code TEXT,
ADD COLUMN timezone TEXT,
ADD COLUMN company_type TEXT,
ADD COLUMN lifecycle_stage TEXT DEFAULT 'lead',
ADD COLUMN linkedin_company_page TEXT,
ADD COLUMN facebook_company_page TEXT,
ADD COLUMN twitter_handle TEXT;