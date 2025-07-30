-- Insert sample cases for task linking with valid case types only
INSERT INTO public.cases (title, description, status, priority, type, source) VALUES 
('Workplace Harassment Investigation', 'Investigation into reported harassment incident between team members', 'open', 'high', 'hr', 'manual'),
('Payroll Discrepancy Review', 'Review and resolve payroll calculation discrepancies for Q4', 'in_progress', 'medium', 'payroll', 'manual'),
('Employee Benefits Inquiry', 'Employee asking about dental coverage options and enrollment period', 'open', 'low', 'benefits', 'manual'),
('General Support Request', 'General employee support request for workplace guidance', 'open', 'medium', 'general', 'manual'),
('Technical System Issue', 'Resolve technical issues with HR system access', 'in_progress', 'high', 'technical', 'manual');