-- Create profiles and roles for the test users
INSERT INTO profiles (user_id, email, company_id) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@testcompany.com', (SELECT id FROM company_settings WHERE company_name = 'Test Company')),
  ('a0000000-0000-0000-0000-000000000002', 'learner@testcompany.com', (SELECT id FROM company_settings WHERE company_name = 'Test Company')),
  ('a0000000-0000-0000-0000-000000000003', 'sales@easeworks.com', NULL),
  ('a0000000-0000-0000-0000-000000000004', 'staffing@easeworks.com', NULL);

INSERT INTO user_roles (user_id, role, company_id) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'company_admin', (SELECT id FROM company_settings WHERE company_name = 'Test Company')),
  ('a0000000-0000-0000-0000-000000000002', 'learner', (SELECT id FROM company_settings WHERE company_name = 'Test Company')),
  ('a0000000-0000-0000-0000-000000000003', 'internal_staff', NULL),
  ('a0000000-0000-0000-0000-000000000004', 'admin', NULL);