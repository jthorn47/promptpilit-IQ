-- Add custom SCORM configuration columns to client_sbw9237_modules table
ALTER TABLE public.client_sbw9237_modules 
ADD COLUMN use_custom_scorm BOOLEAN DEFAULT false,
ADD COLUMN custom_scorm_package_url TEXT,
ADD COLUMN custom_scorm_generation_id UUID,
ADD COLUMN custom_scorm_script TEXT;

-- Add foreign key constraint to colossyan_generations table
ALTER TABLE public.client_sbw9237_modules
ADD CONSTRAINT fk_custom_scorm_generation 
FOREIGN KEY (custom_scorm_generation_id) 
REFERENCES public.colossyan_generations(id);

-- Add comment for documentation
COMMENT ON COLUMN public.client_sbw9237_modules.use_custom_scorm IS 'Toggle for using custom AI-generated SCORM vs default SBW-9237 package';
COMMENT ON COLUMN public.client_sbw9237_modules.custom_scorm_package_url IS 'URL to custom AI-generated SCORM package';
COMMENT ON COLUMN public.client_sbw9237_modules.custom_scorm_generation_id IS 'Reference to Colossyan generation that created the custom SCORM';
COMMENT ON COLUMN public.client_sbw9237_modules.custom_scorm_script IS 'Custom script content used for AI SCORM generation';