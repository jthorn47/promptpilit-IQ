-- Create TestClient_2025 employee records using existing payroll system

-- First, create the base employee records in the employees table
INSERT INTO public.employees (
  id,
  email,
  first_name,
  last_name,
  employee_id,
  department,
  position,
  status,
  company_id
) VALUES 
-- Weekly Hourly Employees (20 total)
('33333333-0001-0001-0001-000000000001'::uuid, 'john.weekly@testclient2025.com', 'John', 'WeeklyWorker', 'WK001', 'Production', 'Production Worker', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000002'::uuid, 'jane.weekly@testclient2025.com', 'Jane', 'WeeklySmith', 'WK002', 'Production', 'Production Worker', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000003'::uuid, 'mike.weekly@testclient2025.com', 'Mike', 'WeeklyJones', 'WK003', 'Warehouse', 'Warehouse Worker', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000004'::uuid, 'sarah.weekly@testclient2025.com', 'Sarah', 'WeeklyBrown', 'WK004', 'Warehouse', 'Forklift Operator', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000005'::uuid, 'david.weekly@testclient2025.com', 'David', 'WeeklyDavis', 'WK005', 'Production', 'Line Supervisor', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
-- Semi-Monthly Salaried Employees (15 total)
('33333333-0002-0002-0002-000000000001'::uuid, 'alice.salary@testclient2025.com', 'Alice', 'SalaryManager', 'SM001', 'Management', 'Operations Manager', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000002'::uuid, 'bob.salary@testclient2025.com', 'Bob', 'SalaryDirector', 'SM002', 'Finance', 'Finance Director', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000003'::uuid, 'carol.salary@testclient2025.com', 'Carol', 'SalaryCoordinator', 'SM003', 'HR', 'HR Coordinator', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
-- Bi-Weekly Mixed Employees (15 total - 7 hourly, 8 salary)
('33333333-0003-0003-0003-000000000001'::uuid, 'dan.biweekly@testclient2025.com', 'Dan', 'BiWeeklyTech', 'BW001', 'IT', 'IT Technician', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000002'::uuid, 'eve.biweekly@testclient2025.com', 'Eve', 'BiWeeklySales', 'BW002', 'Sales', 'Sales Representative', 'active', '11111111-1111-1111-1111-111111111111'::uuid);