-- Insert simple sample pay stubs for testing
WITH employee_data AS (
  SELECT 
    id,
    first_name,
    last_name,
    department,
    ROW_NUMBER() OVER (ORDER BY id) as rn
  FROM employees 
  WHERE status = 'active'
  LIMIT 10  -- Start with just 10 employees for testing
),
company_data AS (
  SELECT id as company_id FROM company_settings LIMIT 1
)
INSERT INTO public.pay_stubs (
  id, employee_id, payroll_period_id, payroll_calculation_id, company_id, stub_number,
  pay_period_start, pay_period_end, pay_date, gross_pay, net_pay, total_deductions, 
  total_taxes, ytd_gross_pay, ytd_net_pay, ytd_taxes, earnings_breakdown,
  deductions_breakdown, taxes_breakdown, status, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  e.id,
  gen_random_uuid(),
  gen_random_uuid(),
  c.company_id,
  'PS-2025-' || LPAD(e.rn::text, 4, '0'),
  '2025-01-13'::date,
  '2025-01-19'::date,
  '2025-01-17'::date,
  4000.00,
  3000.00,
  600.00,
  400.00,
  48000.00,
  36000.00,
  4800.00,
  '{"salary": 4000, "hours": 80}'::jsonb,
  '{"health": 200, "dental": 50, "retirement": 350}'::jsonb,
  '{"federal": 280, "state": 120}'::jsonb,
  'processed',
  now(),
  now()
FROM employee_data e
CROSS JOIN company_data c;