-- Create sample company and tax data for client facf515f-96db-4c26-9833-a609df01d2e5

-- First, create the company record if it doesn't exist
INSERT INTO public.company_settings (
  id,
  company_name,
  address,
  city,
  state,
  postal_code,
  phone,
  website,
  lifecycle_stage,
  industry
) VALUES (
  'facf515f-96db-4c26-9833-a609df01d2e5',
  'Sample Tax Demo Company',
  '123 Main Street',
  'Los Angeles',
  'CA',
  '90210',
  '(555) 123-4567',
  'www.sampletaxcompany.com',
  'client',
  'technology'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample company locations (for jurisdictions calculation)
INSERT INTO public.company_locations (
  company_id, 
  location_name, 
  address, 
  city, 
  state, 
  zip_code, 
  is_primary
) VALUES 
(
  'facf515f-96db-4c26-9833-a609df01d2e5',
  'Corporate Headquarters',
  '123 Business Blvd',
  'Los Angeles',
  'CA',
  '90210',
  true
),
(
  'facf515f-96db-4c26-9833-a609df01d2e5',
  'East Coast Office',
  '456 Park Ave',
  'New York',
  'NY',
  '10001',
  false
),
(
  'facf515f-96db-4c26-9833-a609df01d2e5',
  'Texas Branch',
  '789 Main St',
  'Austin',
  'TX',
  '73301',
  false
);

-- Insert sample employees
INSERT INTO public.employees (
  id,
  company_id,
  email,
  first_name,
  last_name,
  employee_id,
  department,
  position,
  status
) VALUES 
(
  'e1111111-1111-1111-1111-111111111111',
  'facf515f-96db-4c26-9833-a609df01d2e5',
  'john.doe@company.com',
  'John',
  'Doe',
  'EMP001',
  'Engineering',
  'Software Engineer',
  'active'
),
(
  'e2222222-2222-2222-2222-222222222222',
  'facf515f-96db-4c26-9833-a609df01d2e5',
  'jane.smith@company.com',
  'Jane',
  'Smith',
  'EMP002',
  'Sales',
  'Sales Manager',
  'active'
),
(
  'e3333333-3333-3333-3333-333333333333',
  'facf515f-96db-4c26-9833-a609df01d2e5',
  'mike.johnson@company.com',
  'Mike',
  'Johnson',
  'EMP003',
  'Operations',
  'Operations Director',
  'active'
),
(
  'e4444444-4444-4444-4444-444444444444',
  'facf515f-96db-4c26-9833-a609df01d2e5',
  'sarah.williams@company.com',
  'Sarah',
  'Williams',
  'EMP004',
  'HR',
  'HR Specialist',
  'active'
);

-- Insert sample employee tax profiles (for multi-state employees calculation)
INSERT INTO public.employee_tax_profiles (
  employee_id,
  state_code,
  state_filing_status,
  state_allowances,
  additional_state_withholding,
  is_exempt_state,
  federal_filing_status,
  federal_allowances,
  additional_federal_withholding,
  is_exempt_federal
) VALUES 
-- John Doe - Multi-state (CA and NY)
(
  'e1111111-1111-1111-1111-111111111111',
  'CA',
  'single',
  1,
  0.00,
  false,
  'single',
  1,
  0.00,
  false
),
(
  'e1111111-1111-1111-1111-111111111111',
  'NY',
  'single',
  1,
  50.00,
  false,
  'single',
  1,
  0.00,
  false
),
-- Jane Smith - Multi-state (NY and TX)
(
  'e2222222-2222-2222-2222-222222222222',
  'NY',
  'married',
  2,
  0.00,
  false,
  'married',
  2,
  0.00,
  false
),
(
  'e2222222-2222-2222-2222-222222222222',
  'TX',
  'married',
  2,
  25.00,
  false,
  'married',
  2,
  0.00,
  false
),
-- Mike Johnson - Single state (TX only)
(
  'e3333333-3333-3333-3333-333333333333',
  'TX',
  'single',
  1,
  0.00,
  false,
  'single',
  1,
  0.00,
  false
),
-- Sarah Williams - Multi-state (CA and FL)
(
  'e4444444-4444-4444-4444-444444444444',
  'CA',
  'single',
  1,
  0.00,
  false,
  'single',
  1,
  0.00,
  false
),
(
  'e4444444-4444-4444-4444-444444444444',
  'FL',
  'single',
  1,
  0.00,
  false,
  'single',
  1,
  0.00,
  false
);

-- Insert sample tax profiles (for active nexus states calculation)
INSERT INTO public.tax_profiles (
  company_id,
  federal_ein,
  state_tax_ids,
  state_deposit_frequencies,
  unemployment_settings,
  workers_comp_settings,
  created_by
) VALUES 
(
  'facf515f-96db-4c26-9833-a609df01d2e5',
  '12-3456789',
  '{"CA": "1234567890", "NY": "0987654321", "TX": "5555555555", "FL": "1111111111"}'::jsonb,
  '{"CA": "monthly", "NY": "semi-weekly", "TX": "monthly", "FL": "quarterly"}'::jsonb,
  '{"suta_rate": 2.5, "futa_rate": 0.6}'::jsonb,
  '{"rate": 1.2, "class_codes": ["8810", "8742"]}'::jsonb,
  'e1111111-1111-1111-1111-111111111111'
);

-- Insert sample payroll runs
INSERT INTO public.payroll_runs (
  id,
  company_id,
  run_name,
  pay_period_start,
  pay_period_end,
  pay_date,
  payroll_frequency,
  service_type,
  status,
  total_gross,
  total_net,
  employee_count,
  created_by
) VALUES 
(
  'pr111111-1111-1111-1111-111111111111',
  'facf515f-96db-4c26-9833-a609df01d2e5',
  '2024 Pay Period 1',
  '2024-01-01',
  '2024-01-15',
  '2024-01-20',
  'bi-weekly',
  'full_service',
  'completed',
  25000.00,
  18750.00,
  4,
  'e1111111-1111-1111-1111-111111111111'
),
(
  'pr222222-2222-2222-2222-222222222222',
  'facf515f-96db-4c26-9833-a609df01d2e5',
  '2024 Pay Period 2',
  '2024-01-16',
  '2024-01-31',
  '2024-02-05',
  'bi-weekly',
  'full_service',
  'completed',
  26500.00,
  19875.00,
  4,
  'e1111111-1111-1111-1111-111111111111'
),
(
  'pr333333-3333-3333-3333-333333333333',
  'facf515f-96db-4c26-9833-a609df01d2e5',
  '2024 Pay Period 3',
  '2024-02-01',
  '2024-02-15',
  '2024-02-20',
  'bi-weekly',
  'full_service',
  'completed',
  27200.00,
  20400.00,
  4,
  'e1111111-1111-1111-1111-111111111111'
);

-- Insert sample payroll tax withholdings (for YTD tax calculation)
INSERT INTO public.payroll_tax_withholdings (
  id,
  payroll_record_id,
  employee_id,
  payroll_period_id,
  federal_income_tax,
  state_income_tax,
  social_security_employee,
  medicare_employee,
  medicare_additional,
  state_disability_insurance,
  state_unemployment_employee,
  other_withholdings,
  total_withholdings
) VALUES 
-- Pay Period 1 withholdings
(
  'pt111111-1111-1111-1111-111111111111',
  'pr111111-1111-1111-1111-111111111111',
  'e1111111-1111-1111-1111-111111111111',
  'pr111111-1111-1111-1111-111111111111',
  890.00,
  425.00,
  387.50,
  90.62,
  0.00,
  62.50,
  0.00,
  0.00,
  1855.62
),
(
  'pt111112-1111-1111-1111-111111111111',
  'pr111111-1111-1111-1111-111111111111',
  'e2222222-2222-2222-2222-222222222222',
  'pr111111-1111-1111-1111-111111111111',
  825.00,
  390.00,
  362.50,
  84.84,
  0.00,
  58.50,
  0.00,
  0.00,
  1720.84
),
(
  'pt111113-1111-1111-1111-111111111111',
  'pr111111-1111-1111-1111-111111111111',
  'e3333333-3333-3333-3333-333333333333',
  'pr111111-1111-1111-1111-111111111111',
  920.00,
  0.00,
  400.00,
  93.75,
  0.00,
  0.00,
  0.00,
  0.00,
  1413.75
),
(
  'pt111114-1111-1111-1111-111111111111',
  'pr111111-1111-1111-1111-111111111111',
  'e4444444-4444-4444-4444-444444444444',
  'pr111111-1111-1111-1111-111111111111',
  765.00,
  365.00,
  325.00,
  76.25,
  0.00,
  52.50,
  0.00,
  0.00,
  1583.75
),
-- Pay Period 2 withholdings
(
  'pt222221-2222-2222-2222-222222222222',
  'pr222222-2222-2222-2222-222222222222',
  'e1111111-1111-1111-1111-111111111111',
  'pr222222-2222-2222-2222-222222222222',
  945.00,
  450.00,
  412.50,
  96.56,
  0.00,
  66.50,
  0.00,
  0.00,
  1970.56
),
(
  'pt222222-2222-2222-2222-222222222222',
  'pr222222-2222-2222-2222-222222222222',
  'e2222222-2222-2222-2222-222222222222',
  'pr222222-2222-2222-2222-222222222222',
  875.00,
  415.00,
  385.00,
  90.31,
  0.00,
  62.25,
  0.00,
  0.00,
  1827.56
),
(
  'pt222223-2222-2222-2222-222222222222',
  'pr222222-2222-2222-2222-222222222222',
  'e3333333-3333-3333-3333-333333333333',
  'pr222222-2222-2222-2222-222222222222',
  975.00,
  0.00,
  425.00,
  99.69,
  0.00,
  0.00,
  0.00,
  0.00,
  1499.69
),
(
  'pt222224-2222-2222-2222-222222222222',
  'pr222222-2222-2222-2222-222222222222',
  'e4444444-4444-4444-4444-444444444444',
  'pr222222-2222-2222-2222-222222222222',
  815.00,
  390.00,
  347.50,
  81.25,
  0.00,
  55.75,
  0.00,
  0.00,
  1689.50
),
-- Pay Period 3 withholdings
(
  'pt333331-3333-3333-3333-333333333333',
  'pr333333-3333-3333-3333-333333333333',
  'e1111111-1111-1111-1111-111111111111',
  'pr333333-3333-3333-3333-333333333333',
  985.00,
  470.00,
  430.00,
  100.50,
  0.00,
  69.00,
  0.00,
  0.00,
  2054.50
),
(
  'pt333332-3333-3333-3333-333333333333',
  'pr333333-3333-3333-3333-333333333333',
  'e2222222-2222-2222-2222-222222222222',
  'pr333333-3333-3333-3333-333333333333',
  910.00,
  435.00,
  400.00,
  93.75,
  0.00,
  64.75,
  0.00,
  0.00,
  1903.50
),
(
  'pt333333-3333-3333-3333-333333333333',
  'pr333333-3333-3333-3333-333333333333',
  'e3333333-3333-3333-3333-333333333333',
  'pr333333-3333-3333-3333-333333333333',
  1015.00,
  0.00,
  442.50,
  103.75,
  0.00,
  0.00,
  0.00,
  0.00,
  1561.25
),
(
  'pt333334-3333-3333-3333-333333333333',
  'pr333333-3333-3333-3333-333333333333',
  'e4444444-4444-4444-4444-444444444444',
  'pr333333-3333-3333-3333-333333333333',
  850.00,
  410.00,
  362.50,
  84.50,
  0.00,
  58.00,
  0.00,
  0.00,
  1765.00
);