-- Create TestClient_2025 with comprehensive payroll test data
-- This migration sets up a complete test environment for 2025 payroll processing

-- Insert test client company
INSERT INTO public.company_settings (
  id,
  company_name,
  address_line_1,
  city,
  state,
  zip_code,
  phone,
  email,
  website,
  ein,
  business_type,
  incorporation_date,
  lifecycle_stage,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'TestClient_2025',
  '123 Test Street',
  'Test City',
  'CA',
  '90210',
  '(555) 123-4567',
  'test@testclient2025.com',
  'https://testclient2025.com',
  '12-3456789',
  'LLC',
  '2025-01-01',
  'client',
  '2025-01-01 00:00:00+00',
  now()
);

-- Create pay groups for different schedules
INSERT INTO public.pay_groups (
  id,
  company_id,
  name,
  description,
  pay_frequency,
  pay_schedule_config,
  is_active,
  created_at,
  updated_at
) VALUES 
-- Weekly Pay Group (Fridays)
(
  '22222222-1111-1111-1111-111111111111'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Weekly_Hourly',
  'Weekly pay schedule - Every Friday for hourly employees',
  'weekly',
  '{"day_of_week": 5, "start_date": "2025-01-03"}'::jsonb,
  true,
  '2025-01-01 00:00:00+00',
  now()
),
-- Bi-Weekly Pay Group (Every other Friday)
(
  '22222222-2222-2222-2222-222222222222'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'BiWeekly_Mixed',
  'Bi-weekly pay schedule - Every other Friday for mixed employees',
  'bi_weekly',
  '{"day_of_week": 5, "start_date": "2025-01-03"}'::jsonb,
  true,
  '2025-01-01 00:00:00+00',
  now()
),
-- Semi-Monthly Pay Group (15th and last day)
(
  '22222222-3333-3333-3333-333333333333'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'SemiMonthly_Salary',
  'Semi-monthly pay schedule - 15th and last day for salaried employees',
  'semi_monthly',
  '{"pay_dates": [15, -1]}'::jsonb,
  true,
  '2025-01-01 00:00:00+00',
  now()
);

-- Insert 20 Weekly Hourly Employees
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
('33333333-0001-0001-0001-000000000010'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK010', 'Patricia', 'WeeklyThomas', 'patricia.weekly@testclient2025.com', '(555) 001-0010', '2025-01-01', 'active', 'hourly', 'Production', 'Assembly Worker', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000011'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK011', 'Christopher', 'WeeklyJackson', 'christopher.weekly@testclient2025.com', '(555) 001-0011', '2025-01-01', 'active', 'hourly', 'Warehouse', 'Inventory Clerk', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000012'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK012', 'Linda', 'WeeklyWhite', 'linda.weekly@testclient2025.com', '(555) 001-0012', '2025-01-01', 'active', 'hourly', 'Quality', 'QA Technician', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000013'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK013', 'Mark', 'WeeklyHarris', 'mark.weekly@testclient2025.com', '(555) 001-0013', '2025-01-01', 'active', 'hourly', 'Maintenance', 'Electrician', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000014'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK014', 'Barbara', 'WeeklyMartin', 'barbara.weekly@testclient2025.com', '(555) 001-0014', '2025-01-01', 'active', 'hourly', 'Shipping', 'Package Handler', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000015'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK015', 'Daniel', 'WeeklyGarcia', 'daniel.weekly@testclient2025.com', '(555) 001-0015', '2025-01-01', 'active', 'hourly', 'Production', 'Machine Operator', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000016'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK016', 'Michelle', 'WeeklyRodriguez', 'michelle.weekly@testclient2025.com', '(555) 001-0016', '2025-01-01', 'active', 'hourly', 'Warehouse', 'Material Handler', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000017'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK017', 'Kevin', 'WeeklyLewis', 'kevin.weekly@testclient2025.com', '(555) 001-0017', '2025-01-01', 'active', 'hourly', 'Security', 'Security Guard', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000018'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK018', 'Sandra', 'WeeklyLee', 'sandra.weekly@testclient2025.com', '(555) 001-0018', '2025-01-01', 'active', 'hourly', 'Janitorial', 'Custodian', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000019'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK019', 'Anthony', 'WeeklyWalker', 'anthony.weekly@testclient2025.com', '(555) 001-0019', '2025-01-01', 'active', 'hourly', 'Grounds', 'Groundskeeper', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now()),
('33333333-0001-0001-0001-000000000020'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'WK020', 'Donna', 'WeeklyHall', 'donna.weekly@testclient2025.com', '(555) 001-0020', '2025-01-01', 'active', 'hourly', 'Cafeteria', 'Food Service', 16.00, 'hourly', 'weekly', true, '2025-01-01 00:00:00+00', now());