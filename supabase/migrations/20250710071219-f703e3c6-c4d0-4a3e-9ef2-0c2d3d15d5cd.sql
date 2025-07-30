
-- Add columns for HubSpot import to preserve all data
ALTER TABLE public.company_settings 
ADD COLUMN last_activity_date timestamp with time zone,
ADD COLUMN hubspot_record_id text;

-- Add index on hubspot_record_id for future lookups
CREATE INDEX IF NOT EXISTS idx_company_settings_hubspot_record_id 
ON public.company_settings(hubspot_record_id);
