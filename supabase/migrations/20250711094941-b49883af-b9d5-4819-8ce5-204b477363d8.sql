-- Add modules_enabled column to company_settings for modular feature management
ALTER TABLE public.company_settings 
ADD COLUMN modules_enabled TEXT[] DEFAULT ARRAY['lms', 'assessments']::TEXT[];

-- Add module setup status tracking
ALTER TABLE public.company_settings 
ADD COLUMN module_setup_status JSONB DEFAULT '{}'::JSONB;

-- Add comments for clarity
COMMENT ON COLUMN public.company_settings.modules_enabled IS 'Array of enabled module names for this company';
COMMENT ON COLUMN public.company_settings.module_setup_status IS 'JSON object tracking setup completion status for each module';