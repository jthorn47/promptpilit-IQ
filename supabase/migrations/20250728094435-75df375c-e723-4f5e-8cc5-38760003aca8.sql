-- Update existing cases with more realistic data and add closed cases for proper testing
UPDATE public.cases SET 
  estimated_hours = 8.0,
  actual_hours = 7.5,
  updated_at = '2024-12-15 17:00:00+00',
  status = 'closed'
WHERE title = 'Workplace Harassment Investigation';

UPDATE public.cases SET
  estimated_hours = 4.0,
  actual_hours = 2.5,
  type = 'compliance',
  updated_at = '2025-01-28 14:00:00+00'
WHERE title = 'Payroll Discrepancy Review';

UPDATE public.cases SET
  estimated_hours = 6.0,
  actual_hours = 8.0,
  updated_at = '2024-11-20 16:00:00+00',
  status = 'closed'
WHERE title = 'Technical System Issue';

-- Insert additional closed cases for meaningful resolution trends
INSERT INTO public.cases (
  id, company_id, title, description, type, status, priority,
  created_at, updated_at, estimated_hours, actual_hours
) VALUES 
('750e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440001', 
 'Discrimination Investigation', 'Age discrimination complaint requiring investigation', 
 'investigation', 'closed', 'high',
 '2024-10-01 09:00:00+00', '2024-10-08 17:00:00+00', 12.0, 10.5),

('750e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440002',
 'Safety Protocol Violation', 'Employee safety protocol compliance issue',
 'compliance', 'closed', 'medium',
 '2024-11-15 10:00:00+00', '2024-11-18 16:00:00+00', 6.0, 4.5),

('750e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440003',
 'Performance Improvement Plan', 'Employee performance consultation and planning',
 'consultation', 'closed', 'low',
 '2024-12-01 11:00:00+00', '2024-12-05 15:00:00+00', 3.0, 3.5),

('750e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440001',
 'Document Review Process', 'Compliance document review and approval',
 'compliance', 'closed', 'medium',
 '2024-09-20 08:00:00+00', '2024-09-25 17:00:00+00', 5.0, 6.0),

('750e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440002',
 'Training Requirement Assessment', 'Mandatory training compliance assessment',
 'consultation', 'closed', 'low',
 '2024-10-10 13:00:00+00', '2024-10-12 16:00:00+00', 2.0, 2.5)

ON CONFLICT (id) DO NOTHING;