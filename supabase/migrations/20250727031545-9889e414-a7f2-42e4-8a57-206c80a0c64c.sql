-- Create seed data for HRO IQ demo
-- This migration adds sample data for testing all HRO IQ modules

-- Insert sample employees
INSERT INTO employees (
  first_name, 
  last_name, 
  email, 
  job_title, 
  department, 
  location, 
  status,
  hire_date,
  phone,
  company_id
) VALUES 
('John', 'Smith', 'john.smith@company.com', 'Software Engineer', 'Engineering', 'San Francisco, CA', 'active', '2024-01-15', '(555) 123-4567', (SELECT id FROM company_settings LIMIT 1)),
('Sarah', 'Johnson', 'sarah.johnson@company.com', 'Marketing Manager', 'Marketing', 'San Francisco, CA', 'active', '2024-02-01', '(555) 234-5678', (SELECT id FROM company_settings LIMIT 1)),
('Mike', 'Wilson', 'mike.wilson@company.com', 'Sales Representative', 'Sales', 'San Francisco, CA', 'active', '2024-02-15', '(555) 345-6789', (SELECT id FROM company_settings LIMIT 1))
ON CONFLICT (email) DO NOTHING;

-- Insert sample service requests  
INSERT INTO hroiq_service_requests (
  retainer_id,
  priority,
  description,
  status,
  company_id,
  created_at
) VALUES 
((SELECT id FROM hroiq_client_retainers LIMIT 1), 'high', 'Need guidance on employee termination procedures for California', 'pending', (SELECT id FROM company_settings LIMIT 1), NOW() - INTERVAL '2 days'),
((SELECT id FROM hroiq_client_retainers LIMIT 1), 'medium', 'Questions about remote work policy development', 'in_progress', (SELECT id FROM company_settings LIMIT 1), NOW() - INTERVAL '1 day'),
((SELECT id FROM hroiq_client_retainers LIMIT 1), 'high', 'Need immediate help with harassment complaint procedure', 'pending', (SELECT id FROM company_settings LIMIT 1), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample service logs
INSERT INTO hroiq_service_logs (
  company_id,
  retainer_id, 
  service_type,
  log_date,
  hours_logged,
  description,
  billable,
  consultant_name,
  notes
) VALUES 
((SELECT id FROM company_settings LIMIT 1), (SELECT id FROM hroiq_client_retainers LIMIT 1), 'consultation', '2024-01-15', 2.5, 'Employee handbook review and policy updates', true, 'Sarah Johnson, SHRM-CP', 'Client consultation on policy updates'),
((SELECT id FROM company_settings LIMIT 1), (SELECT id FROM hroiq_client_retainers LIMIT 1), 'compliance', '2024-01-14', 4.0, 'Quarterly compliance audit and documentation review', true, 'Mike Chen, PHR', 'Comprehensive compliance review'),
((SELECT id FROM company_settings LIMIT 1), (SELECT id FROM hroiq_client_retainers LIMIT 1), 'consultation', '2024-01-12', 1.5, 'Employee relations consultation and guidance', false, 'Sarah Johnson, SHRM-CP', 'Goodwill consultation - waived')
ON CONFLICT DO NOTHING;

-- Insert sample onboarding packets
INSERT INTO hroiq_onboarding_packets (
  company_id,
  retainer_id,
  employee_name,
  employee_email,
  position,
  department,
  start_date,
  status,
  language
) VALUES 
((SELECT id FROM company_settings LIMIT 1), (SELECT id FROM hroiq_client_retainers LIMIT 1), 'John Smith', 'john.smith@company.com', 'Software Engineer', 'Engineering', '2024-01-15', 'completed', 'english'),
((SELECT id FROM company_settings LIMIT 1), (SELECT id FROM hroiq_client_retainers LIMIT 1), 'Maria Garcia', 'maria.garcia@company.com', 'Marketing Coordinator', 'Marketing', '2024-02-01', 'in_progress', 'spanish'),
((SELECT id FROM company_settings LIMIT 1), (SELECT id FROM hroiq_client_retainers LIMIT 1), 'David Lee', 'david.lee@company.com', 'Sales Associate', 'Sales', '2024-02-15', 'pending', 'english')
ON CONFLICT DO NOTHING;

-- Insert sample policies
INSERT INTO hroiq_policies (
  company_id,
  title,
  body,
  category,
  status,
  version,
  created_by,
  last_updated_by
) VALUES 
((SELECT id FROM company_settings LIMIT 1), 'Remote Work Policy', 'This policy outlines the guidelines and procedures for remote work arrangements...', 'workplace', 'published', 1, auth.uid(), auth.uid()),
((SELECT id FROM company_settings LIMIT 1), 'Anti-Harassment Policy', 'This policy demonstrates our commitment to maintaining a workplace free from harassment...', 'conduct', 'published', 2, auth.uid(), auth.uid())
ON CONFLICT DO NOTHING;

-- Insert sample LMS credits
INSERT INTO hroiq_lms_credits (
  company_id,
  employee_id,
  training_type,
  credits_issued,
  credits_used,
  notes,
  created_by
) VALUES 
((SELECT id FROM company_settings LIMIT 1), (SELECT id FROM employees WHERE email = 'john.smith@company.com' LIMIT 1), 'Harassment', 10, 5, 'Initial credit allocation for harassment training', auth.uid()),
((SELECT id FROM company_settings LIMIT 1), (SELECT id FROM employees WHERE email = 'sarah.johnson@company.com' LIMIT 1), 'Manager_Training', 15, 8, 'Manager training credits for department head', auth.uid()),
((SELECT id FROM company_settings LIMIT 1), (SELECT id FROM employees WHERE email = 'mike.wilson@company.com' LIMIT 1), 'Compliance', 8, 2, 'Compliance training for sales team', auth.uid())
ON CONFLICT DO NOTHING;