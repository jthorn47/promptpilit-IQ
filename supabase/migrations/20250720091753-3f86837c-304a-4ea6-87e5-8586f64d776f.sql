-- Continue with TestClient_2025 setup - Create employees and pay groups

-- First check if we have the employees table structure
-- Insert 20 Weekly Hourly Employees at $16/hour
INSERT INTO public.employees (
  id,
  company_id,
  employee_number,
  first_name,
  last_name,
  email,
  phone,
  hire_date,
  employment_status,
  employment_type,
  department,
  job_title,
  pay_rate,
  pay_type,
  pay_frequency,
  is_active,
  created_at,
  updated_at
) VALUES 
-- Weekly Employees (20 total) - All Hourly at $16.00/hour
('33333333-0001-0001-0001-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK001', 'John', 'WeeklyWorker', 'john.weekly@testclient2025.com', '(555) 001-0001', '2025-01-01', 'active', 'hourly', 'Production', 'Production Worker', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000002'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK002', 'Jane', 'WeeklySmith', 'jane.weekly@testclient2025.com', '(555) 001-0002', '2025-01-01', 'active', 'hourly', 'Production', 'Production Worker', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000003'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK003', 'Mike', 'WeeklyJones', 'mike.weekly@testclient2025.com', '(555) 001-0003', '2025-01-01', 'active', 'hourly', 'Warehouse', 'Warehouse Worker', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000004'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK004', 'Sarah', 'WeeklyBrown', 'sarah.weekly@testclient2025.com', '(555) 001-0004', '2025-01-01', 'active', 'hourly', 'Warehouse', 'Forklift Operator', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000005'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK005', 'David', 'WeeklyDavis', 'david.weekly@testclient2025.com', '(555) 001-0005', '2025-01-01', 'active', 'hourly', 'Production', 'Line Supervisor', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000006'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK006', 'Lisa', 'WeeklyWilson', 'lisa.weekly@testclient2025.com', '(555) 001-0006', '2025-01-01', 'active', 'hourly', 'Quality', 'Quality Inspector', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000007'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK007', 'Robert', 'WeeklyMiller', 'robert.weekly@testclient2025.com', '(555) 001-0007', '2025-01-01', 'active', 'hourly', 'Maintenance', 'Maintenance Tech', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000008'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK008', 'Jennifer', 'WeeklyTaylor', 'jennifer.weekly@testclient2025.com', '(555) 001-0008', '2025-01-01', 'active', 'hourly', 'Shipping', 'Shipping Clerk', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000009'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK009', 'William', 'WeeklyAnderson', 'william.weekly@testclient2025.com', '(555) 001-0009', '2025-01-01', 'active', 'hourly', 'Receiving', 'Receiving Clerk', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000010'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK010', 'Patricia', 'WeeklyThomas', 'patricia.weekly@testclient2025.com', '(555) 001-0010', '2025-01-01', 'active', 'hourly', 'Production', 'Assembly Worker', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now());