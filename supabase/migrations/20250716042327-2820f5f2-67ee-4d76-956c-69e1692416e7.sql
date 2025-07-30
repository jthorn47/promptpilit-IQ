-- Add client_type field to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS client_type TEXT CHECK (client_type IN ('easeworks', 'easelearn', 'both')) DEFAULT 'easeworks';

-- Create index for filtering performance
CREATE INDEX IF NOT EXISTS idx_company_settings_client_type ON public.company_settings(client_type);

-- Add comment for documentation
COMMENT ON COLUMN public.company_settings.client_type IS 'Distinguishes between Easeworks (HR/ASO), EaseLearn (LMS), or Both business units';