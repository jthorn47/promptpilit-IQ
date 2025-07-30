-- Simple Pulse CMS Seed Data (avoiding trigger conflicts)
-- First, let's work with existing table structure

-- Insert sample companies/clients
INSERT INTO public.company_settings (id, company_name, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Westland Farms', '2024-01-01 00:00:00+00'),
('550e8400-e29b-41d4-a716-446655440002', 'Omega Logistics', '2024-01-01 00:00:00+00'),
('550e8400-e29b-41d4-a716-446655440003', 'Vista Retail Group', '2024-01-01 00:00:00+00')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

-- Add necessary columns to cases table first (if they don't exist)
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS template_used TEXT,
ADD COLUMN IF NOT EXISTS documents_required INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS documents_uploaded INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sla_met BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS policy_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'compliant',
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 50;

-- Insert 15 sample cases with varied scenarios (using minimal approach)
INSERT INTO public.cases (
    id, company_id, title, description, type, status, priority,
    created_at, updated_at, closed_at, due_date, estimated_hours, actual_hours, 
    risk_score, template_used, documents_required, documents_uploaded, 
    sla_met, policy_tags, compliance_status
) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 
 'Harassment Complaint - Sales Dept', 'Employee reported inappropriate comments from supervisor', 
 'harassment', 'closed', 'high',
 '2024-10-15 09:00:00+00', '2024-10-22 17:00:00+00', '2024-10-22 17:00:00+00', '2024-10-29 17:00:00+00',
 8.0, 7.5, 78, 'Harassment Investigation', 3, 3, true, 
 ARRAY['harassment', 'workplace_conduct'], 'compliant'),

('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002',
 'ADA Accommodation Request', 'Employee requesting ergonomic workspace modifications',
 'ada_accommodation', 'in_progress', 'medium',
 '2025-01-10 10:00:00+00', '2025-01-28 14:00:00+00', null, '2025-01-24 17:00:00+00',
 4.0, 2.5, 85, 'ADA Accommodation Request', 2, 0, false,
 ARRAY['ada', 'accommodation'], 'non_compliant'),

('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003',
 'Workplace Violence Investigation', 'Threats made during team meeting',
 'workplace_violence', 'closed', 'critical',
 '2025-02-01 08:00:00+00', '2025-02-20 16:00:00+00', '2025-02-20 16:00:00+00', '2025-02-15 17:00:00+00',
 12.0, 15.0, 92, 'Workplace Investigation', 4, 2, false,
 ARRAY['sb_553', 'workplace_violence'], 'non_compliant'),

('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001',
 'FMLA Leave Request', 'Medical leave for surgery recovery',
 'fmla_violation', 'open', 'medium',
 '2025-01-25 11:00:00+00', '2025-01-28 11:00:00+00', null, '2025-02-10 17:00:00+00',
 3.0, 1.0, 45, 'FMLA Processing', 3, 2, true,
 ARRAY['fmla', 'medical_leave'], 'compliant'),

('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002',
 'Age Discrimination Complaint', 'Employee alleges bias in promotion decisions',
 'discrimination', 'closed', 'high',
 '2024-12-05 13:00:00+00', '2024-12-12 15:00:00+00', '2024-12-12 15:00:00+00', '2024-12-19 17:00:00+00',
 6.0, 5.5, 62, 'Discrimination Investigation', 2, 2, true,
 ARRAY['discrimination', 'age'], 'compliant'),

('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003',
 'Safety Protocol Violation', 'Employee not following PPE requirements',
 'safety', 'in_progress', 'medium',
 '2025-01-20 14:00:00+00', '2025-01-28 14:00:00+00', null, '2025-02-05 17:00:00+00',
 4.0, 2.0, 55, 'Safety Investigation', 2, 1, true,
 ARRAY['safety', 'ppe'], 'compliant'),

('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001',
 'Overtime Pay Dispute', 'Employee claims unpaid overtime hours',
 'wage_hour', 'closed', 'high',
 '2024-11-10 09:30:00+00', '2024-12-01 17:00:00+00', '2024-12-01 17:00:00+00', '2024-11-24 17:00:00+00',
 10.0, 12.5, 88, 'Wage Investigation', 3, 2, false,
 ARRAY['wage_hour', 'overtime'], 'non_compliant'),

('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002',
 'Performance Improvement Plan', 'Employee performance below standards',
 'performance', 'open', 'low',
 '2025-01-15 10:00:00+00', '2025-01-28 10:00:00+00', null, '2025-02-15 17:00:00+00',
 6.0, 3.0, 35, 'Performance Management', 1, 1, true,
 ARRAY['performance'], 'compliant'),

('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003',
 'Retaliation Investigation', 'Employee claims retaliation after whistleblowing',
 'retaliation', 'closed', 'critical',
 '2024-09-20 11:00:00+00', '2024-10-15 16:00:00+00', '2024-10-15 16:00:00+00', '2024-10-10 17:00:00+00',
 16.0, 18.5, 95, 'Retaliation Investigation', 5, 5, false,
 ARRAY['retaliation', 'whistleblower'], 'non_compliant'),

('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001',
 'Data Privacy Breach', 'Employee accessed unauthorized customer data',
 'data_breach', 'in_progress', 'critical',
 '2025-01-28 08:00:00+00', '2025-01-28 16:00:00+00', null, '2025-02-04 17:00:00+00',
 8.0, 4.0, 90, 'Data Breach Protocol', 4, 2, true,
 ARRAY['data_privacy', 'security'], 'compliant'),

('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002',
 'Sexual Harassment Report', 'Inappropriate behavior reported by multiple employees',
 'harassment', 'closed', 'critical',
 '2024-08-15 12:00:00+00', '2024-08-25 17:00:00+00', '2024-08-25 17:00:00+00', '2024-09-01 17:00:00+00',
 14.0, 13.0, 96, 'Harassment Investigation', 4, 4, true,
 ARRAY['harassment', 'sexual_harassment'], 'compliant'),

('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003',
 'Union Organizing Activity', 'Employees discussing unionization efforts',
 'union_activity', 'open', 'medium',
 '2025-01-22 15:00:00+00', '2025-01-28 15:00:00+00', null, '2025-02-12 17:00:00+00',
 5.0, 2.5, 50, 'Union Activity Monitor', 2, 1, true,
 ARRAY['union', 'organizing'], 'compliant'),

('750e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001',
 'Wrongful Termination Claim', 'Former employee claims improper dismissal',
 'termination', 'closed', 'high',
 '2024-06-10 09:00:00+00', '2024-07-20 17:00:00+00', '2024-07-20 17:00:00+00', '2024-07-01 17:00:00+00',
 20.0, 25.0, 82, 'Termination Review', 6, 4, false,
 ARRAY['termination', 'wrongful_dismissal'], 'non_compliant'),

('750e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002',
 'Mental Health Accommodation', 'Employee requesting schedule flexibility for therapy',
 'ada_accommodation', 'in_progress', 'medium',
 '2025-01-18 13:30:00+00', '2025-01-28 13:30:00+00', null, '2025-02-08 17:00:00+00',
 3.0, 1.5, 40, 'ADA Accommodation Request', 2, 2, true,
 ARRAY['ada', 'mental_health'], 'compliant'),

('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003',
 'Workplace Injury Investigation', 'Employee injured during equipment operation',
 'safety', 'closed', 'medium',
 '2024-12-20 10:00:00+00', '2024-12-28 15:00:00+00', '2024-12-28 15:00:00+00', '2025-01-03 17:00:00+00',
 7.0, 6.0, 58, 'Safety Investigation', 3, 3, true,
 ARRAY['safety', 'injury'], 'compliant')
ON CONFLICT (id) DO NOTHING;