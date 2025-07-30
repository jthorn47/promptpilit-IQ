-- Pulse CMS Seed Data Migration
-- This migration creates sample data for testing all Pulse CMS reports

-- First, insert sample companies/clients
INSERT INTO public.company_settings (id, company_name, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Westland Farms', '2024-01-01 00:00:00+00'),
('550e8400-e29b-41d4-a716-446655440002', 'Omega Logistics', '2024-01-01 00:00:00+00'),
('550e8400-e29b-41d4-a716-446655440003', 'Vista Retail Group', '2024-01-01 00:00:00+00')
ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

-- Insert sample users/employees
INSERT INTO public.employees (id, company_id, user_id, first_name, last_name, job_title, department, employment_status, created_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', null, 'Sandra', 'Lee', 'HR Manager', 'Human Resources', 'active', '2024-01-01 00:00:00+00'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', null, 'Carlos', 'Vega', 'Compliance Officer', 'Legal', 'active', '2024-01-01 00:00:00+00'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', null, 'Mina', 'Zhao', 'Case Coordinator', 'Human Resources', 'active', '2024-01-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Insert 15 sample cases with varied scenarios
INSERT INTO public.cases (
    id, company_id, title, description, case_type, status, priority, assigned_to, 
    created_at, updated_at, closed_at, due_date, estimated_hours, actual_hours, 
    risk_score, template_used, documents_required, documents_uploaded, 
    sla_met, policy_tags, compliance_status
) VALUES
-- Case 1: Harassment - Closed, SLA Met, High Risk
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 
 'Harassment Complaint - Sales Dept', 'Employee reported inappropriate comments from supervisor', 
 'harassment', 'closed', 'high', '650e8400-e29b-41d4-a716-446655440001',
 '2024-10-15 09:00:00+00', '2024-10-22 17:00:00+00', '2024-10-22 17:00:00+00', '2024-10-29 17:00:00+00',
 8.0, 7.5, 78, 'Harassment Investigation', 3, 3, true, 
 ARRAY['harassment', 'workplace_conduct'], 'compliant'),

-- Case 2: ADA - In Progress, Overdue, Missing Docs
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002',
 'ADA Accommodation Request', 'Employee requesting ergonomic workspace modifications',
 'ada_accommodation', 'in_progress', 'medium', '650e8400-e29b-41d4-a716-446655440003',
 '2025-01-10 10:00:00+00', '2025-01-28 14:00:00+00', null, '2025-01-24 17:00:00+00',
 4.0, 2.5, 85, 'ADA Accommodation Request', 2, 0, false,
 ARRAY['ada', 'accommodation'], 'non_compliant'),

-- Case 3: Workplace Violence - Closed, SLA Missed, High Risk
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003',
 'Workplace Violence Investigation', 'Threats made during team meeting',
 'workplace_violence', 'closed', 'critical', '650e8400-e29b-41d4-a716-446655440002',
 '2025-02-01 08:00:00+00', '2025-02-20 16:00:00+00', '2025-02-20 16:00:00+00', '2025-02-15 17:00:00+00',
 12.0, 15.0, 92, 'Workplace Investigation', 4, 2, false,
 ARRAY['sb_553', 'workplace_violence'], 'non_compliant'),

-- Case 4: FMLA - Open, On Track
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001',
 'FMLA Leave Request', 'Medical leave for surgery recovery',
 'fmla_violation', 'open', 'medium', '650e8400-e29b-41d4-a716-446655440001',
 '2025-01-25 11:00:00+00', '2025-01-28 11:00:00+00', null, '2025-02-10 17:00:00+00',
 3.0, 1.0, 45, 'FMLA Processing', 3, 2, true,
 ARRAY['fmla', 'medical_leave'], 'compliant'),

-- Case 5: Discrimination - Closed, Low Risk, Fast Resolution
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002',
 'Age Discrimination Complaint', 'Employee alleges bias in promotion decisions',
 'discrimination', 'closed', 'high', '650e8400-e29b-41d4-a716-446655440002',
 '2024-12-05 13:00:00+00', '2024-12-12 15:00:00+00', '2024-12-12 15:00:00+00', '2024-12-19 17:00:00+00',
 6.0, 5.5, 62, 'Discrimination Investigation', 2, 2, true,
 ARRAY['discrimination', 'age'], 'compliant'),

-- Case 6: Safety Violation - In Progress, Medium Risk
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003',
 'Safety Protocol Violation', 'Employee not following PPE requirements',
 'safety', 'in_progress', 'medium', '650e8400-e29b-41d4-a716-446655440003',
 '2025-01-20 14:00:00+00', '2025-01-28 14:00:00+00', null, '2025-02-05 17:00:00+00',
 4.0, 2.0, 55, 'Safety Investigation', 2, 1, true,
 ARRAY['safety', 'ppe'], 'compliant'),

-- Case 7: Wage Complaint - Closed, Overdue, High Risk
('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001',
 'Overtime Pay Dispute', 'Employee claims unpaid overtime hours',
 'wage_hour', 'closed', 'high', '650e8400-e29b-41d4-a716-446655440001',
 '2024-11-10 09:30:00+00', '2024-12-01 17:00:00+00', '2024-12-01 17:00:00+00', '2024-11-24 17:00:00+00',
 10.0, 12.5, 88, 'Wage Investigation', 3, 2, false,
 ARRAY['wage_hour', 'overtime'], 'non_compliant'),

-- Case 8: Performance Issue - Open, Low Priority
('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002',
 'Performance Improvement Plan', 'Employee performance below standards',
 'performance', 'open', 'low', '650e8400-e29b-41d4-a716-446655440002',
 '2025-01-15 10:00:00+00', '2025-01-28 10:00:00+00', null, '2025-02-15 17:00:00+00',
 6.0, 3.0, 35, 'Performance Management', 1, 1, true,
 ARRAY['performance'], 'compliant'),

-- Case 9: Retaliation - Closed, High Risk, All Docs
('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003',
 'Retaliation Investigation', 'Employee claims retaliation after whistleblowing',
 'retaliation', 'closed', 'critical', '650e8400-e29b-41d4-a716-446655440003',
 '2024-09-20 11:00:00+00', '2024-10-15 16:00:00+00', '2024-10-15 16:00:00+00', '2024-10-10 17:00:00+00',
 16.0, 18.5, 95, 'Retaliation Investigation', 5, 5, false,
 ARRAY['retaliation', 'whistleblower'], 'non_compliant'),

-- Case 10: Data Breach - In Progress, Critical
('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001',
 'Data Privacy Breach', 'Employee accessed unauthorized customer data',
 'data_breach', 'in_progress', 'critical', '650e8400-e29b-41d4-a716-446655440002',
 '2025-01-28 08:00:00+00', '2025-01-28 16:00:00+00', null, '2025-02-04 17:00:00+00',
 8.0, 4.0, 90, 'Data Breach Protocol', 4, 2, true,
 ARRAY['data_privacy', 'security'], 'compliant'),

-- Case 11: Sexual Harassment - Closed, Fast Resolution
('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002',
 'Sexual Harassment Report', 'Inappropriate behavior reported by multiple employees',
 'harassment', 'closed', 'critical', '650e8400-e29b-41d4-a716-446655440001',
 '2024-08-15 12:00:00+00', '2024-08-25 17:00:00+00', '2024-08-25 17:00:00+00', '2024-09-01 17:00:00+00',
 14.0, 13.0, 96, 'Harassment Investigation', 4, 4, true,
 ARRAY['harassment', 'sexual_harassment'], 'compliant'),

-- Case 12: Union Activity - Open, Medium Priority
('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003',
 'Union Organizing Activity', 'Employees discussing unionization efforts',
 'union_activity', 'open', 'medium', '650e8400-e29b-41d4-a716-446655440003',
 '2025-01-22 15:00:00+00', '2025-01-28 15:00:00+00', null, '2025-02-12 17:00:00+00',
 5.0, 2.5, 50, 'Union Activity Monitor', 2, 1, true,
 ARRAY['union', 'organizing'], 'compliant'),

-- Case 13: Termination Review - Closed, Documentation Issues
('750e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001',
 'Wrongful Termination Claim', 'Former employee claims improper dismissal',
 'termination', 'closed', 'high', '650e8400-e29b-41d4-a716-446655440002',
 '2024-06-10 09:00:00+00', '2024-07-20 17:00:00+00', '2024-07-20 17:00:00+00', '2024-07-01 17:00:00+00',
 20.0, 25.0, 82, 'Termination Review', 6, 4, false,
 ARRAY['termination', 'wrongful_dismissal'], 'non_compliant'),

-- Case 14: Mental Health Accommodation - In Progress
('750e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002',
 'Mental Health Accommodation', 'Employee requesting schedule flexibility for therapy',
 'ada_accommodation', 'in_progress', 'medium', '650e8400-e29b-41d4-a716-446655440001',
 '2025-01-18 13:30:00+00', '2025-01-28 13:30:00+00', null, '2025-02-08 17:00:00+00',
 3.0, 1.5, 40, 'ADA Accommodation Request', 2, 2, true,
 ARRAY['ada', 'mental_health'], 'compliant'),

-- Case 15: Workplace Injury - Closed, Quick Resolution
('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003',
 'Workplace Injury Investigation', 'Employee injured during equipment operation',
 'safety', 'closed', 'medium', '650e8400-e29b-41d4-a716-446655440003',
 '2024-12-20 10:00:00+00', '2024-12-28 15:00:00+00', '2024-12-28 15:00:00+00', '2025-01-03 17:00:00+00',
 7.0, 6.0, 58, 'Safety Investigation', 3, 3, true,
 ARRAY['safety', 'injury'], 'compliant')
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks for each case
INSERT INTO public.tasks (
    id, case_id, title, description, assigned_to, status, priority,
    due_date, completed_at, estimated_hours, actual_hours, created_at, updated_at
) VALUES
-- Tasks for Case 1 (Harassment - Closed)
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001',
 'Interview Complainant', 'Conduct detailed interview with reporting employee',
 '650e8400-e29b-41d4-a716-446655440002', 'completed', 'high',
 '2024-10-18 17:00:00+00', '2024-10-17 14:00:00+00', 1.0, 1.5,
 '2024-10-15 09:00:00+00', '2024-10-17 14:00:00+00'),

('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001',
 'Final Investigation Report', 'Compile findings and recommendations',
 '650e8400-e29b-41d4-a716-446655440001', 'completed', 'high',
 '2024-10-21 17:00:00+00', '2024-10-22 16:00:00+00', 2.0, 2.5,
 '2024-10-18 09:00:00+00', '2024-10-22 16:00:00+00'),

-- Tasks for Case 2 (ADA - In Progress, Overdue)
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002',
 'Request Medical Documentation', 'Obtain required medical documentation from employee',
 '650e8400-e29b-41d4-a716-446655440003', 'overdue', 'medium',
 '2025-01-15 17:00:00+00', null, 0.5, 1.0,
 '2025-01-10 10:00:00+00', '2025-01-28 14:00:00+00'),

-- Tasks for Case 3 (Workplace Violence - Closed, Overdue)
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440003',
 'Site Interview and Assessment', 'Conduct on-site interviews with witnesses',
 '650e8400-e29b-41d4-a716-446655440002', 'completed', 'critical',
 '2025-02-05 17:00:00+00', '2025-02-06 15:00:00+00', 3.0, 4.0,
 '2025-02-01 08:00:00+00', '2025-02-06 15:00:00+00'),

('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440003',
 'Case Closure Memo', 'Document findings and closure recommendations',
 '650e8400-e29b-41d4-a716-446655440001', 'completed', 'high',
 '2025-02-18 17:00:00+00', '2025-02-19 16:00:00+00', 1.5, 2.0,
 '2025-02-12 08:00:00+00', '2025-02-19 16:00:00+00'),

-- Tasks for Case 4 (FMLA - Open)
('850e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440004',
 'Process FMLA Paperwork', 'Review and process medical certification',
 '650e8400-e29b-41d4-a716-446655440001', 'in_progress', 'medium',
 '2025-02-05 17:00:00+00', null, 1.5, 0.5,
 '2025-01-25 11:00:00+00', '2025-01-28 11:00:00+00'),

-- Tasks for Case 7 (Wage Complaint - Closed, Overdue)
('850e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440007',
 'Payroll Record Analysis', 'Review timesheets and payroll records',
 '650e8400-e29b-41d4-a716-446655440001', 'completed', 'high',
 '2024-11-20 17:00:00+00', '2024-11-25 14:00:00+00', 4.0, 5.5,
 '2024-11-10 09:30:00+00', '2024-11-25 14:00:00+00'),

-- Tasks for Case 9 (Retaliation - Closed, High Risk)
('850e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440009',
 'Timeline Documentation', 'Create detailed timeline of events',
 '650e8400-e29b-41d4-a716-446655440003', 'completed', 'critical',
 '2024-10-01 17:00:00+00', '2024-10-02 16:00:00+00', 6.0, 8.0,
 '2024-09-20 11:00:00+00', '2024-10-02 16:00:00+00'),

-- Tasks for Case 10 (Data Breach - In Progress)
('850e8400-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440010',
 'Security Assessment', 'Evaluate data access controls and security measures',
 '650e8400-e29b-41d4-a716-446655440002', 'in_progress', 'critical',
 '2025-02-01 17:00:00+00', null, 4.0, 2.0,
 '2025-01-28 08:00:00+00', '2025-01-28 16:00:00+00'),

-- Tasks for Case 11 (Sexual Harassment - Closed)
('850e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440011',
 'Multiple Witness Interviews', 'Interview all reporting parties',
 '650e8400-e29b-41d4-a716-446655440001', 'completed', 'critical',
 '2024-08-22 17:00:00+00', '2024-08-21 15:00:00+00', 8.0, 7.5,
 '2024-08-15 12:00:00+00', '2024-08-21 15:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Update any existing cases table structure if needed
-- This ensures our seed data aligns with current schema
ALTER TABLE public.cases 
ADD COLUMN IF NOT EXISTS template_used TEXT,
ADD COLUMN IF NOT EXISTS documents_required INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS documents_uploaded INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sla_met BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS policy_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'compliant';

-- Create indexes for better report performance
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_type ON public.cases(case_type);
CREATE INDEX IF NOT EXISTS idx_cases_risk_score ON public.cases(risk_score);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON public.cases(created_at);
CREATE INDEX IF NOT EXISTS idx_cases_company_id ON public.cases(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);