-- Add SCORM file columns to training_modules table
ALTER TABLE public.training_modules 
ADD COLUMN scorm_file_path TEXT,
ADD COLUMN scorm_file_name TEXT;