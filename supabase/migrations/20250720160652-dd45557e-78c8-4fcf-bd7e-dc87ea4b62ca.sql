-- Insert sample payroll runs for the last few weeks with required fields
INSERT INTO public.payroll_runs (id, company_id, run_name, pay_period_start, pay_period_end, pay_date, status, created_by, created_at, updated_at) VALUES
(gen_random_uuid(), (SELECT id FROM company_settings LIMIT 1), 'Weekly Payroll - Jan 19, 2025', '2025-01-13', '2025-01-19', '2025-01-24', 'completed', (SELECT id FROM employees LIMIT 1), now(), now()),
(gen_random_uuid(), (SELECT id FROM company_settings LIMIT 1), 'Weekly Payroll - Jan 12, 2025', '2025-01-06', '2025-01-12', '2025-01-17', 'completed', (SELECT id FROM employees LIMIT 1), now(), now()),
(gen_random_uuid(), (SELECT id FROM company_settings LIMIT 1), 'Weekly Payroll - Jan 5, 2025', '2024-12-30', '2025-01-05', '2025-01-10', 'completed', (SELECT id FROM employees LIMIT 1), now(), now());

-- Insert sample pay stubs for the last week (using existing employee data)
WITH employee_data AS (
  SELECT 
    id,
    first_name,
    last_name,
    department,
    ROW_NUMBER() OVER (ORDER BY id) as rn
  FROM employees 
  WHERE status = 'active'
  LIMIT 50
),
pay_stub_data AS (
  SELECT 
    gen_random_uuid() as id,
    id as employee_id,
    first_name || ' ' || last_name as employee_name,
    '2025-01-17'::date as pay_date,
    CASE department
      WHEN 'Production' THEN 4000 + (rn * 100)
      WHEN 'Warehouse' THEN 3500 + (rn * 80)
      WHEN 'Management' THEN 6000 + (rn * 150)
      WHEN 'Sales' THEN 4500 + (rn * 120)
      ELSE 3800 + (rn * 90)
    END as gross_pay,
    CASE department
      WHEN 'Production' THEN (4000 + (rn * 100)) * 0.75
      WHEN 'Warehouse' THEN (3500 + (rn * 80)) * 0.75
      WHEN 'Management' THEN (6000 + (rn * 150)) * 0.72
      WHEN 'Sales' THEN (4500 + (rn * 120)) * 0.74
      ELSE (3800 + (rn * 90)) * 0.75
    END as net_pay,
    '2025-01-13'::date as pay_period_start,
    '2025-01-19'::date as pay_period_end,
    80 as hours_worked,
    CASE department
      WHEN 'Production' THEN 50 + (rn * 1.25)
      WHEN 'Warehouse' THEN 43.75 + (rn * 1)
      WHEN 'Management' THEN 75 + (rn * 1.875)
      WHEN 'Sales' THEN 56.25 + (rn * 1.5)
      ELSE 47.5 + (rn * 1.125)
    END as hourly_rate,
    now() as created_at,
    now() as updated_at,
    (SELECT id FROM company_settings LIMIT 1) as company_id
  FROM employee_data
)
INSERT INTO public.pay_stubs (
  id, employee_id, employee_name, pay_date, gross_pay, net_pay, 
  pay_period_start, pay_period_end, hours_worked, hourly_rate, 
  created_at, updated_at, company_id
)
SELECT 
  id, employee_id, employee_name, pay_date, gross_pay, net_pay,
  pay_period_start, pay_period_end, hours_worked, hourly_rate,
  created_at, updated_at, company_id
FROM pay_stub_data;

-- Insert additional pay stubs for previous week for comparison
WITH employee_data AS (
  SELECT 
    id,
    first_name,
    last_name,
    department,
    ROW_NUMBER() OVER (ORDER BY id) as rn
  FROM employees 
  WHERE status = 'active'
  LIMIT 50
),
prev_pay_stub_data AS (
  SELECT 
    gen_random_uuid() as id,
    id as employee_id,
    first_name || ' ' || last_name as employee_name,
    '2025-01-10'::date as pay_date,
    CASE department
      WHEN 'Production' THEN 3900 + (rn * 95)
      WHEN 'Warehouse' THEN 3400 + (rn * 75)
      WHEN 'Management' THEN 5900 + (rn * 140)
      WHEN 'Sales' THEN 4400 + (rn * 110)
      ELSE 3700 + (rn * 85)
    END as gross_pay,
    CASE department
      WHEN 'Production' THEN (3900 + (rn * 95)) * 0.75
      WHEN 'Warehouse' THEN (3400 + (rn * 75)) * 0.75
      WHEN 'Management' THEN (5900 + (rn * 140)) * 0.72
      WHEN 'Sales' THEN (4400 + (rn * 110)) * 0.74
      ELSE (3700 + (rn * 85)) * 0.75
    END as net_pay,
    '2025-01-06'::date as pay_period_start,
    '2025-01-12'::date as pay_period_end,
    78 as hours_worked,
    CASE department
      WHEN 'Production' THEN 50 + (rn * 1.22)
      WHEN 'Warehouse' THEN 43.59 + (rn * 0.96)
      WHEN 'Management' THEN 75.64 + (rn * 1.79)
      WHEN 'Sales' THEN 56.41 + (rn * 1.41)
      ELSE 47.44 + (rn * 1.09)
    END as hourly_rate,
    now() as created_at,
    now() as updated_at,
    (SELECT id FROM company_settings LIMIT 1) as company_id
  FROM employee_data
)
INSERT INTO public.pay_stubs (
  id, employee_id, employee_name, pay_date, gross_pay, net_pay, 
  pay_period_start, pay_period_end, hours_worked, hourly_rate, 
  created_at, updated_at, company_id
)
SELECT 
  id, employee_id, employee_name, pay_date, gross_pay, net_pay,
  pay_period_start, pay_period_end, hours_worked, hourly_rate,
  created_at, updated_at, company_id
FROM prev_pay_stub_data;