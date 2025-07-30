-- Complete TestClient_2025 employee setup with pay rates table and all employee data

-- First create the employee_pay_rates table
CREATE TABLE IF NOT EXISTS public.employee_pay_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  rate_type TEXT NOT NULL CHECK (rate_type IN ('hourly', 'salary', 'commission', 'piece_rate')),
  rate_amount NUMERIC(12,2) NOT NULL CHECK (rate_amount >= 0),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  overtime_rate_multiplier NUMERIC(4,2) DEFAULT 1.5,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, effective_date, rate_type)
);

-- Add RLS policies for employee_pay_rates
ALTER TABLE public.employee_pay_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can manage employee pay rates"
ON public.employee_pay_rates
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = employee_pay_rates.employee_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e 
    WHERE e.id = employee_pay_rates.employee_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, e.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_employee_pay_rates_updated_at
  BEFORE UPDATE ON public.employee_pay_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payroll_updated_at_column();

-- Add remaining 40 employees for TestClient_2025
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
-- Weekly Hourly Employees (15 more to make 20 total)
('33333333-0001-0001-0001-000000000006'::uuid, 'tom.weekly@testclient2025.com', 'Tom', 'WeeklyWilson', 'WK006', 'Production', 'Machine Operator', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000007'::uuid, 'lisa.weekly@testclient2025.com', 'Lisa', 'WeeklyMiller', 'WK007', 'Warehouse', 'Picker', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000008'::uuid, 'mark.weekly@testclient2025.com', 'Mark', 'WeeklyTaylor', 'WK008', 'Production', 'Quality Control', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000009'::uuid, 'amy.weekly@testclient2025.com', 'Amy', 'WeeklyAnderson', 'WK009', 'Warehouse', 'Shipping Clerk', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000010'::uuid, 'chris.weekly@testclient2025.com', 'Chris', 'WeeklyThomas', 'WK010', 'Production', 'Assembly Worker', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000011'::uuid, 'nina.weekly@testclient2025.com', 'Nina', 'WeeklyJackson', 'WK011', 'Warehouse', 'Inventory Clerk', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000012'::uuid, 'paul.weekly@testclient2025.com', 'Paul', 'WeeklyWhite', 'WK012', 'Production', 'Maintenance Tech', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000013'::uuid, 'sofia.weekly@testclient2025.com', 'Sofia', 'WeeklyHarris', 'WK013', 'Warehouse', 'Receiving Clerk', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000014'::uuid, 'ryan.weekly@testclient2025.com', 'Ryan', 'WeeklyMartin', 'WK014', 'Production', 'Line Worker', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000015'::uuid, 'kate.weekly@testclient2025.com', 'Kate', 'WeeklyGarcia', 'WK015', 'Warehouse', 'Loader', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000016'::uuid, 'jim.weekly@testclient2025.com', 'Jim', 'WeeklyRodriguez', 'WK016', 'Production', 'Packer', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000017'::uuid, 'emma.weekly@testclient2025.com', 'Emma', 'WeeklyLewis', 'WK017', 'Warehouse', 'Coordinator', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000018'::uuid, 'alex.weekly@testclient2025.com', 'Alex', 'WeeklyLee', 'WK018', 'Production', 'Operator', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000019'::uuid, 'maya.weekly@testclient2025.com', 'Maya', 'WeeklyWalker', 'WK019', 'Warehouse', 'Handler', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0001-0001-0001-000000000020'::uuid, 'luke.weekly@testclient2025.com', 'Luke', 'WeeklyHall', 'WK020', 'Production', 'Inspector', 'active', '11111111-1111-1111-1111-111111111111'::uuid),

-- Semi-Monthly Salaried Employees (12 more to make 15 total)
('33333333-0002-0002-0002-000000000004'::uuid, 'diana.salary@testclient2025.com', 'Diana', 'SalaryAnalyst', 'SM004', 'Finance', 'Financial Analyst', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000005'::uuid, 'eric.salary@testclient2025.com', 'Eric', 'SalarySpecialist', 'SM005', 'HR', 'HR Specialist', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000006'::uuid, 'grace.salary@testclient2025.com', 'Grace', 'SalaryLead', 'SM006', 'Operations', 'Team Lead', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000007'::uuid, 'henry.salary@testclient2025.com', 'Henry', 'SalaryController', 'SM007', 'Finance', 'Controller', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000008'::uuid, 'iris.salary@testclient2025.com', 'Iris', 'SalaryManager', 'SM008', 'Marketing', 'Marketing Manager', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000009'::uuid, 'jack.salary@testclient2025.com', 'Jack', 'SalaryDirector', 'SM009', 'Operations', 'Operations Director', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000010'::uuid, 'kim.salary@testclient2025.com', 'Kim', 'SalaryAdvisor', 'SM010', 'Legal', 'Legal Advisor', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000011'::uuid, 'leo.salary@testclient2025.com', 'Leo', 'SalaryPlanner', 'SM011', 'Strategy', 'Strategic Planner', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000012'::uuid, 'mia.salary@testclient2025.com', 'Mia', 'SalaryOfficer', 'SM012', 'Compliance', 'Compliance Officer', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000013'::uuid, 'noah.salary@testclient2025.com', 'Noah', 'SalaryArchitect', 'SM013', 'IT', 'Solutions Architect', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000014'::uuid, 'olivia.salary@testclient2025.com', 'Olivia', 'SalaryVP', 'SM014', 'Executive', 'Vice President', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0002-0002-0002-000000000015'::uuid, 'peter.salary@testclient2025.com', 'Peter', 'SalaryCEO', 'SM015', 'Executive', 'CEO', 'active', '11111111-1111-1111-1111-111111111111'::uuid),

-- Bi-Weekly Mixed Employees (13 more to make 15 total)
('33333333-0003-0003-0003-000000000003'::uuid, 'frank.biweekly@testclient2025.com', 'Frank', 'BiWeeklySupport', 'BW003', 'IT', 'Support Specialist', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000004'::uuid, 'helen.biweekly@testclient2025.com', 'Helen', 'BiWeeklyRep', 'BW004', 'Sales', 'Account Rep', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000005'::uuid, 'ivan.biweekly@testclient2025.com', 'Ivan', 'BiWeeklyDeveloper', 'BW005', 'IT', 'Software Developer', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000006'::uuid, 'judy.biweekly@testclient2025.com', 'Judy', 'BiWeeklyManager', 'BW006', 'Sales', 'Sales Manager', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000007'::uuid, 'kevin.biweekly@testclient2025.com', 'Kevin', 'BiWeeklyAdmin', 'BW007', 'IT', 'System Admin', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000008'::uuid, 'laura.biweekly@testclient2025.com', 'Laura', 'BiWeeklyAssociate', 'BW008', 'Customer Service', 'Service Associate', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000009'::uuid, 'matt.biweekly@testclient2025.com', 'Matt', 'BiWeeklyLead', 'BW009', 'Customer Service', 'Team Lead', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000010'::uuid, 'nancy.biweekly@testclient2025.com', 'Nancy', 'BiWeeklyAnalyst', 'BW010', 'Business Analytics', 'Data Analyst', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000011'::uuid, 'oscar.biweekly@testclient2025.com', 'Oscar', 'BiWeeklyCoordinator', 'BW011', 'Project Management', 'Project Coordinator', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000012'::uuid, 'penny.biweekly@testclient2025.com', 'Penny', 'BiWeeklyConsultant', 'BW012', 'Business Development', 'Business Consultant', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000013'::uuid, 'quinn.biweekly@testclient2025.com', 'Quinn', 'BiWeeklyDirector', 'BW013', 'Operations', 'Regional Director', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000014'::uuid, 'rachel.biweekly@testclient2025.com', 'Rachel', 'BiWeeklyExecutive', 'BW014', 'Executive', 'Executive Assistant', 'active', '11111111-1111-1111-1111-111111111111'::uuid),
('33333333-0003-0003-0003-000000000015'::uuid, 'steve.biweekly@testclient2025.com', 'Steve', 'BiWeeklyVP', 'BW015', 'Executive', 'VP of Sales', 'active', '11111111-1111-1111-1111-111111111111'::uuid);