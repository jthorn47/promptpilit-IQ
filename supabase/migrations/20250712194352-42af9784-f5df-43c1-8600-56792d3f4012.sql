-- First, let's see what the current constraint looks like and fix it
-- Drop the problematic constraint
ALTER TABLE public.training_modules DROP CONSTRAINT IF EXISTS check_scorm_version;

-- Add a more flexible constraint that allows common SCORM versions and NULL values
ALTER TABLE public.training_modules 
ADD CONSTRAINT check_scorm_version 
CHECK (scorm_version IS NULL OR scorm_version IN ('1.2', '2004', 'SCORM 1.2', 'SCORM 2004', 'SCORM 1.2.0', 'SCORM 2004 3rd Edition', 'SCORM 2004 4th Edition'));

-- Also ensure the scorm_version column can be NULL for non-SCORM modules
ALTER TABLE public.training_modules ALTER COLUMN scorm_version DROP NOT NULL;