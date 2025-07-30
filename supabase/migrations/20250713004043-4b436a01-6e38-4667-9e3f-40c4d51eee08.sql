-- Update the SB 553 Core Training Video metadata
UPDATE training_modules 
SET 
  title = 'SB 553 Workplace Violence Prevention – Core Training Video (SCORM Format)',
  public_title = 'SB 553 Workplace Violence Prevention – Core Training Video (SCORM Format)',
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
  language = 'en',
  estimated_completion_time = 10,
  difficulty_level = 'beginner',
  scorm_compatible = true,
  scorm_version = '1.2',
  completion_method = 'scene_based',
  metadata = jsonb_set(
    COALESCE(metadata, '{}'),
    '{learning_objectives}',
    '[
      "Understand the requirements of California Labor Code §6401.9 (SB 553) and how they apply to your workplace.",
      "Identify behaviors, threats, and warning signs associated with workplace violence.",
      "Learn how to respond appropriately to violent incidents or threats, including reporting protocols.",
      "Understand the components of your company''s Workplace Violence Prevention Plan (WVPP), including emergency procedures, alert systems, and access controls."
    ]'::jsonb
  ),
  metadata = jsonb_set(
    metadata,
    '{prerequisites}',
    '["None. This course is designed for all employees regardless of prior training or position."]'::jsonb
  ),
  metadata = jsonb_set(
    metadata,
    '{format}',
    '"SCORM 1.2 or 2004 (ensure LMS compatibility)"'::jsonb
  ),
  metadata = jsonb_set(
    metadata,
    '{duration}',
    '"8–10 minutes"'::jsonb
  ),
  metadata = jsonb_set(
    metadata,
    '{certificate}',
    '"Yes – generate on completion"'::jsonb
  ),
  metadata = jsonb_set(
    metadata,
    '{course_description}',
    '"This core training video provides a comprehensive overview of California''s SB 553 Workplace Violence Prevention requirements. Learners will understand how to recognize, respond to, and report workplace violence, as well as their responsibilities under Labor Code §6401.9. The course is SCORM-compliant, video-based, and designed for deployment within your organization''s LMS or through EaseLearn''s platform. It includes real-world scenarios, interactive knowledge checks, and a certificate of completion to support regulatory compliance."'::jsonb
  ),
  updated_at = now()
WHERE title ILIKE '%SB 553%' OR title ILIKE '%Core Training Video%';