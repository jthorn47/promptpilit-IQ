
-- Insert sample pay groups
INSERT INTO public.pay_groups (name, description, company_id, is_active) VALUES
('Weekly Payroll', 'Standard weekly payroll processing', null, true),
('Bi-Weekly Payroll', 'Standard bi-weekly payroll processing', null, true),
('Monthly Payroll', 'Standard monthly payroll processing', null, true),
('Executive Payroll', 'Executive level payroll processing', null, true);

-- Insert sample earnings types
INSERT INTO public.earnings_types (name, code, description, is_taxable, is_overtime, company_id, is_active) VALUES
('Regular Hours', 'REG', 'Regular hourly wages', true, false, null, true),
('Overtime Hours', 'OT', 'Overtime hourly wages', true, true, null, true),
('Salary', 'SAL', 'Salary payments', true, false, null, true),
('Bonus', 'BON', 'Performance bonuses', true, false, null, true),
('Commission', 'COM', 'Sales commissions', true, false, null, true),
('Holiday Pay', 'HOL', 'Holiday pay', true, false, null, true);

-- Insert sample deduction types
INSERT INTO public.deduction_types (name, code, description, is_pre_tax, company_id, is_active) VALUES
('Health Insurance', 'HEALTH', 'Health insurance premium', true, null, true),
('Dental Insurance', 'DENTAL', 'Dental insurance premium', true, null, true),
('401(k)', '401K', '401(k) retirement contribution', true, null, true),
('Life Insurance', 'LIFE', 'Life insurance premium', true, null, true),
('Union Dues', 'UNION', 'Union membership dues', false, null, true),
('Parking', 'PARK', 'Parking fee deduction', false, null, true);

-- Insert sample workers comp codes
INSERT INTO public.workers_comp_codes (code, description, rate, company_id, is_active) VALUES
('8810', 'Clerical Office Employees', 0.0012, null, true),
('8742', 'Outside Sales Representatives', 0.0089, null, true),
('8720', 'Accounting', 0.0015, null, true),
('8871', 'Computer Programming', 0.0018, null, true),
('7380', 'Drivers - Commercial', 0.0245, null, true),
('5645', 'Carpentry', 0.0567, null, true);

-- Insert sample PTO policies
INSERT INTO public.pto_policies (name, description, accrual_rate, max_carryover, company_id, is_active) VALUES
('Standard PTO', 'Standard paid time off policy', 4.62, 80.00, null, true),
('Executive PTO', 'Executive level PTO policy', 6.15, 120.00, null, true),
('Probationary PTO', 'PTO policy for probationary employees', 2.31, 40.00, null, true),
('Unlimited PTO', 'Unlimited PTO policy', 0.00, 0.00, null, true);
