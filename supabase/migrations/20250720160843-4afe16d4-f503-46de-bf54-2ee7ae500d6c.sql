-- Insert sample pay stubs using the correct schema
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
company_data AS (
  SELECT id as company_id FROM company_settings LIMIT 1
),
pay_stub_data AS (
  SELECT 
    gen_random_uuid() as id,
    e.id as employee_id,
    gen_random_uuid() as payroll_period_id,
    gen_random_uuid() as payroll_calculation_id,
    c.company_id,
    'PS-2025-' || LPAD(e.rn::text, 4, '0') as stub_number,
    '2025-01-13'::date as pay_period_start,
    '2025-01-19'::date as pay_period_end,
    '2025-01-17'::date as pay_date,
    CASE e.department
      WHEN 'Production' THEN 4000 + (e.rn * 100)
      WHEN 'Warehouse' THEN 3500 + (e.rn * 80)
      WHEN 'Management' THEN 6000 + (e.rn * 150)
      WHEN 'Sales' THEN 4500 + (e.rn * 120)
      ELSE 3800 + (e.rn * 90)
    END as gross_pay,
    CASE e.department
      WHEN 'Production' THEN (4000 + (e.rn * 100)) * 0.75
      WHEN 'Warehouse' THEN (3500 + (e.rn * 80)) * 0.75
      WHEN 'Management' THEN (6000 + (e.rn * 150)) * 0.72
      WHEN 'Sales' THEN (4500 + (e.rn * 120)) * 0.74
      ELSE (3800 + (e.rn * 90)) * 0.75
    END as net_pay,
    CASE e.department
      WHEN 'Production' THEN (4000 + (e.rn * 100)) * 0.15
      WHEN 'Warehouse' THEN (3500 + (e.rn * 80)) * 0.15
      WHEN 'Management' THEN (6000 + (e.rn * 150)) * 0.18
      WHEN 'Sales' THEN (4500 + (e.rn * 120)) * 0.16
      ELSE (3800 + (e.rn * 90)) * 0.15
    END as total_deductions,
    CASE e.department
      WHEN 'Production' THEN (4000 + (e.rn * 100)) * 0.10
      WHEN 'Warehouse' THEN (3500 + (e.rn * 80)) * 0.10
      WHEN 'Management' THEN (6000 + (e.rn * 150)) * 0.10
      WHEN 'Sales' THEN (4500 + (e.rn * 120)) * 0.10
      ELSE (3800 + (e.rn * 90)) * 0.10
    END as total_taxes,
    CASE e.department
      WHEN 'Production' THEN (4000 + (e.rn * 100)) * 12  -- YTD estimate
      WHEN 'Warehouse' THEN (3500 + (e.rn * 80)) * 12
      WHEN 'Management' THEN (6000 + (e.rn * 150)) * 12
      WHEN 'Sales' THEN (4500 + (e.rn * 120)) * 12
      ELSE (3800 + (e.rn * 90)) * 12
    END as ytd_gross_pay,
    CASE e.department
      WHEN 'Production' THEN (4000 + (e.rn * 100)) * 0.75 * 12
      WHEN 'Warehouse' THEN (3500 + (e.rn * 80)) * 0.75 * 12
      WHEN 'Management' THEN (6000 + (e.rn * 150)) * 0.72 * 12
      WHEN 'Sales' THEN (4500 + (e.rn * 120)) * 0.74 * 12
      ELSE (3800 + (e.rn * 90)) * 0.75 * 12
    END as ytd_net_pay,
    CASE e.department
      WHEN 'Production' THEN (4000 + (e.rn * 100)) * 0.10 * 12
      WHEN 'Warehouse' THEN (3500 + (e.rn * 80)) * 0.10 * 12
      WHEN 'Management' THEN (6000 + (e.rn * 150)) * 0.10 * 12
      WHEN 'Sales' THEN (4500 + (e.rn * 120)) * 0.10 * 12
      ELSE (3800 + (e.rn * 90)) * 0.10 * 12
    END as ytd_taxes,
    '{"salary": "' || 
      CASE e.department
        WHEN 'Production' THEN 4000 + (e.rn * 100)
        WHEN 'Warehouse' THEN 3500 + (e.rn * 80)
        WHEN 'Management' THEN 6000 + (e.rn * 150)
        WHEN 'Sales' THEN 4500 + (e.rn * 120)
        ELSE 3800 + (e.rn * 90)
      END || '", "hours": "80"}'::jsonb as earnings_breakdown,
    '{"health_insurance": "200", "dental": "50", "401k": "300"}'::jsonb as deductions_breakdown,
    '{"federal": "' || ((CASE e.department WHEN 'Production' THEN 4000 + (e.rn * 100) WHEN 'Warehouse' THEN 3500 + (e.rn * 80) WHEN 'Management' THEN 6000 + (e.rn * 150) WHEN 'Sales' THEN 4500 + (e.rn * 120) ELSE 3800 + (e.rn * 90) END) * 0.07)::text || '", "state": "' || ((CASE e.department WHEN 'Production' THEN 4000 + (e.rn * 100) WHEN 'Warehouse' THEN 3500 + (e.rn * 80) WHEN 'Management' THEN 6000 + (e.rn * 150) WHEN 'Sales' THEN 4500 + (e.rn * 120) ELSE 3800 + (e.rn * 90) END) * 0.03)::text || '"}'::jsonb as taxes_breakdown,
    'processed'::text as status,
    now() as created_at,
    now() as updated_at
  FROM employee_data e
  CROSS JOIN company_data c
)
INSERT INTO public.pay_stubs (
  id, employee_id, payroll_period_id, payroll_calculation_id, company_id, stub_number,
  pay_period_start, pay_period_end, pay_date, gross_pay, net_pay, total_deductions, 
  total_taxes, ytd_gross_pay, ytd_net_pay, ytd_taxes, earnings_breakdown,
  deductions_breakdown, taxes_breakdown, status, created_at, updated_at
)
SELECT * FROM pay_stub_data;