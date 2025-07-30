-- Insert 10 sample assessments with diverse data
INSERT INTO public.assessments (
  company_name,
  company_email,
  company_size,
  industry,
  responses,
  risk_score,
  risk_level,
  ai_report,
  created_at
) VALUES 
(
  'TechFlow Solutions',
  'hr@techflowsolutions.com',
  '51-200 employees',
  'Technology',
  '[{"questionId":"q1","selectedOption":2,"score":3},{"questionId":"q2","selectedOption":1,"score":2}]'::jsonb,
  78,
  'Low Risk',
  '"Comprehensive HR risk assessment shows strong compliance foundation with minor areas for improvement."'::jsonb,
  NOW() - INTERVAL '2 days'
),
(
  'Green Valley Manufacturing',
  'admin@greenvalleymfg.com',
  '201-500 employees',
  'Manufacturing',
  '[{"questionId":"q1","selectedOption":0,"score":1},{"questionId":"q2","selectedOption":0,"score":1}]'::jsonb,
  42,
  'High Risk',
  '"Critical compliance gaps identified requiring immediate attention in safety protocols and documentation."'::jsonb,
  NOW() - INTERVAL '5 days'
),
(
  'Coastal Healthcare Group',
  'compliance@coastalhealthcare.org',
  '500+ employees',
  'Healthcare',
  '[{"questionId":"q1","selectedOption":1,"score":2},{"questionId":"q2","selectedOption":2,"score":3}]'::jsonb,
  65,
  'Moderate Risk',
  '"Healthcare-specific compliance review shows good foundation with opportunities for enhanced training programs."'::jsonb,
  NOW() - INTERVAL '1 day'
),
(
  'Sunrise Retail Corp',
  'hr@sunriseretail.com',
  '11-50 employees',
  'Retail',
  '[{"questionId":"q1","selectedOption":2,"score":3},{"questionId":"q2","selectedOption":2,"score":3}]'::jsonb,
  82,
  'Low Risk',
  NULL,
  NOW() - INTERVAL '3 days'
),
(
  'Metro Construction LLC',
  'safety@metroconstruction.net',
  '51-200 employees',
  'Construction',
  '[{"questionId":"q1","selectedOption":0,"score":1},{"questionId":"q2","selectedOption":1,"score":2}]'::jsonb,
  38,
  'High Risk',
  '"Construction industry assessment reveals significant safety compliance issues requiring immediate remediation."'::jsonb,
  NOW() - INTERVAL '1 week'
),
(
  'Financial Advisory Partners',
  'admin@finadvpartners.com',
  '11-50 employees',
  'Financial Services',
  '[{"questionId":"q1","selectedOption":1,"score":2},{"questionId":"q2","selectedOption":1,"score":2}]'::jsonb,
  58,
  'Moderate Risk',
  NULL,
  NOW() - INTERVAL '4 days'
),
(
  'EduTech Innovations',
  'hr@edutechinnovations.edu',
  '1-10 employees',
  'Education',
  '[{"questionId":"q1","selectedOption":2,"score":3},{"questionId":"q2","selectedOption":1,"score":2}]'::jsonb,
  71,
  'Moderate Risk',
  '"Small education technology company shows promise with room for policy standardization."'::jsonb,
  NOW() - INTERVAL '6 days'
),
(
  'Premier Professional Services',
  'contact@premierpro.com',
  '201-500 employees',
  'Professional Services',
  '[{"questionId":"q1","selectedOption":2,"score":3},{"questionId":"q2","selectedOption":2,"score":3}]'::jsonb,
  85,
  'Low Risk',
  '"Excellent compliance foundation across all HR domains with best-in-class practices."'::jsonb,
  NOW() - INTERVAL '8 hours'
),
(
  'Community Care Non-Profit',
  'director@communitycare.org',
  '51-200 employees',
  'Non-profit',
  '[{"questionId":"q1","selectedOption":1,"score":2},{"questionId":"q2","selectedOption":0,"score":1}]'::jsonb,
  45,
  'High Risk',
  NULL,
  NOW() - INTERVAL '2 weeks'
),
(
  'Innovation Labs Inc',
  'people@innovationlabs.co',
  '11-50 employees',
  'Technology',
  '[{"questionId":"q1","selectedOption":1,"score":2},{"questionId":"q2","selectedOption":2,"score":3}]'::jsonb,
  67,
  'Moderate Risk',
  '"Technology startup with solid fundamentals requiring enhanced documentation and training protocols."'::jsonb,
  NOW() - INTERVAL '12 hours'
);