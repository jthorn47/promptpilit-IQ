-- Add published status to training modules
ALTER TABLE training_modules 
ADD COLUMN is_published boolean NOT NULL DEFAULT true;

-- Add index for better performance when filtering by published status
CREATE INDEX idx_training_modules_published ON training_modules(is_published);

-- Update existing modules to be published by default
UPDATE training_modules SET is_published = true WHERE is_published IS NULL;