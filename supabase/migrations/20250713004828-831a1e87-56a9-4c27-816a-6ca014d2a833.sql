-- Update the video code from CAS-0936 to CAS-0946 and ensure all tags are applied
UPDATE training_modules 
SET 
  video_code = 'CAS-0946',
  tags = ARRAY[
    'Workplace Violence',
    'SB 553', 
    'California',
    'Compliance',
    'Mandatory',
    'Employee',
    'Supervisor',
    'Annual',
    'SCORM',
    'Video-Based',
    'English',
    'WVPP'
  ],
  target_roles = ARRAY[
    'All Employees (California)',
    'Supervisors (California)', 
    'Workplace Violence Coordinators',
    'Field Workers / On-Site Staff'
  ],
  metadata = jsonb_set(
    metadata,
    '{video_code}',
    '"CAS-0946"'
  ),
  updated_at = now()
WHERE title = 'SB 553 Workplace Violence Prevention – Core Training Video (SCORM Format)' 
   OR video_code = 'CAS-0936';