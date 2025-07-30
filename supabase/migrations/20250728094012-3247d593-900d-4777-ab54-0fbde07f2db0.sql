-- Find valid case types and create appropriate seed data
-- Let's use basic types that should be valid

-- Insert sample companies
INSERT INTO public.company_settings (id, company_name, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Westland Farms', '2024-01-01 00:00:00+00'),
('550e8400-e29b-41d4-a716-446655440002', 'Omega Logistics', '2024-01-01 00:00:00+00'),
('550e8400-e29b-41d4-a716-446655440003', 'Vista Retail Group', '2024-01-01 00:00:00+00')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

-- Insert cases using only simple case types
INSERT INTO public.cases (
    id, company_id, title, description, type, status, priority,
    created_at, updated_at, estimated_hours, actual_hours
) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 
 'Harassment Complaint - Sales Dept', 'Employee reported inappropriate comments from supervisor', 
 'investigation', 'closed', 'high',
 '2024-10-15 09:00:00+00', '2024-10-22 17:00:00+00', 8.0, 7.5),

('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002',
 'ADA Accommodation Request', 'Employee requesting ergonomic workspace modifications',
 'consultation', 'in_progress', 'medium',
 '2025-01-10 10:00:00+00', '2025-01-28 14:00:00+00', 4.0, 2.5),

('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003',
 'Workplace Violence Investigation', 'Threats made during team meeting',
 'investigation', 'closed', 'critical',
 '2025-02-01 08:00:00+00', '2025-02-20 16:00:00+00', 12.0, 15.0),

('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001',
 'FMLA Leave Request', 'Medical leave for surgery recovery',
 'consultation', 'open', 'medium',
 '2025-01-25 11:00:00+00', '2025-01-28 11:00:00+00', 3.0, 1.0),

('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002',
 'Age Discrimination Complaint', 'Employee alleges bias in promotion decisions',
 'investigation', 'closed', 'high',
 '2024-12-05 13:00:00+00', '2024-12-12 15:00:00+00', 6.0, 5.5),

('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003',
 'Safety Protocol Violation', 'Employee not following PPE requirements',
 'compliance', 'in_progress', 'medium',
 '2025-01-20 14:00:00+00', '2025-01-28 14:00:00+00', 4.0, 2.0),

('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001',
 'Overtime Pay Dispute', 'Employee claims unpaid overtime hours',
 'investigation', 'closed', 'high',
 '2024-11-10 09:30:00+00', '2024-12-01 17:00:00+00', 10.0, 12.5),

('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002',
 'Performance Improvement Plan', 'Employee performance below standards',
 'consultation', 'open', 'low',
 '2025-01-15 10:00:00+00', '2025-01-28 10:00:00+00', 6.0, 3.0),

('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003',
 'Retaliation Investigation', 'Employee claims retaliation after whistleblowing',
 'investigation', 'closed', 'critical',
 '2024-09-20 11:00:00+00', '2024-10-15 16:00:00+00', 16.0, 18.5),

('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001',
 'Data Privacy Breach', 'Employee accessed unauthorized customer data',
 'investigation', 'in_progress', 'critical',
 '2025-01-28 08:00:00+00', '2025-01-28 16:00:00+00', 8.0, 4.0),

('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002',
 'Sexual Harassment Report', 'Inappropriate behavior reported by multiple employees',
 'investigation', 'closed', 'critical',
 '2024-08-15 12:00:00+00', '2024-08-25 17:00:00+00', 14.0, 13.0),

('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003',
 'Union Organizing Activity', 'Employees discussing unionization efforts',
 'compliance', 'open', 'medium',
 '2025-01-22 15:00:00+00', '2025-01-28 15:00:00+00', 5.0, 2.5),

('750e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001',
 'Wrongful Termination Claim', 'Former employee claims improper dismissal',
 'investigation', 'closed', 'high',
 '2024-06-10 09:00:00+00', '2024-07-20 17:00:00+00', 20.0, 25.0),

('750e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002',
 'Mental Health Accommodation', 'Employee requesting schedule flexibility for therapy',
 'consultation', 'in_progress', 'medium',
 '2025-01-18 13:30:00+00', '2025-01-28 13:30:00+00', 3.0, 1.5),

('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003',
 'Workplace Injury Investigation', 'Employee injured during equipment operation',
 'compliance', 'closed', 'medium',
 '2024-12-20 10:00:00+00', '2024-12-28 15:00:00+00', 7.0, 6.0)
ON CONFLICT (id) DO NOTHING;