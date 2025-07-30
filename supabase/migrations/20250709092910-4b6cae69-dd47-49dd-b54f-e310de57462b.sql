-- Add thumbnail_url field to training_modules table
ALTER TABLE public.training_modules 
ADD COLUMN thumbnail_url TEXT;

COMMENT ON COLUMN public.training_modules.thumbnail_url IS 'URL to the training module thumbnail image for visual preview';