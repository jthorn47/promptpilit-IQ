-- Add video_code field to training_modules table and update SB 553 module with CAS-0936
ALTER TABLE training_modules 
ADD COLUMN IF NOT EXISTS video_code text;

-- Create index for video_code for better performance
CREATE INDEX IF NOT EXISTS idx_training_modules_video_code ON training_modules(video_code);

-- Update the SB 553 module with the correct video code
UPDATE training_modules 
SET 
  video_code = 'CAS-0936',
  metadata = jsonb_set(
    metadata,
    '{video_code}',
    '"CAS-0936"'
  ),
  updated_at = now()
WHERE title = 'SB 553 Workplace Violence Prevention – Core Training Video (SCORM Format)';