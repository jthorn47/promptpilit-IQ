-- Insert sample cases for task linking with valid case types
INSERT INTO public.cases (title, description, status, priority, type, source) VALUES 
('Workplace Harassment Investigation', 'Investigation into reported harassment incident between team members', 'open', 'high', 'hr', 'manual'),
('Payroll Discrepancy Review', 'Review and resolve payroll calculation discrepancies for Q4', 'in_progress', 'medium', 'payroll', 'manual'),
('Employee Benefits Inquiry', 'Employee asking about dental coverage options and enrollment period', 'open', 'low', 'benefits', 'manual'),
('New Hire Onboarding Setup', 'Setup onboarding process for new employee starting next week', 'open', 'medium', 'onboarding', 'manual'),
('Compliance Audit Preparation', 'Prepare documentation for upcoming compliance audit', 'in_progress', 'high', 'compliance', 'manual');