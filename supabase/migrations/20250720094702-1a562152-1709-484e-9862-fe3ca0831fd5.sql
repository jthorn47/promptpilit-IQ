-- Create client-specific payroll settings with valid values for TestClient_2025

-- Create client payroll settings with bi_weekly as default (most common)
INSERT INTO public.client_payroll_settings (
  client_id,
  pay_frequency,
  pay_group_id,
  default_earnings_ids,
  default_deductions_ids,
  fein,
  direct_deposit_required,
  pay_stub_delivery_method,
  local_tax_config,
  custom_overrides,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'bi_weekly', -- Use valid pay frequency
  (SELECT id FROM public.pay_groups WHERE name = 'Bi-Weekly Payroll' LIMIT 1),
  ARRAY(SELECT id FROM public.earnings_types WHERE is_active = true LIMIT 6),
  ARRAY(SELECT id FROM public.deduction_types WHERE is_active = true LIMIT 6),
  '12-3456789',
  false,
  'both', -- Valid value: email and print
  '{"state": "CA", "city": "Test City", "state_sdi": true}',
  '{"overtime_threshold": 40.0, "california_rules": true, "supports_multiple_frequencies": true}',
  '2025-01-01 00:00:00+00',
  now(),
  auth.uid(),
  auth.uid()
) ON CONFLICT (client_id) DO UPDATE SET
  pay_frequency = EXCLUDED.pay_frequency,
  updated_at = now(),
  updated_by = EXCLUDED.updated_by;

-- Create client pay configurations for multiple pay frequencies
INSERT INTO public.client_pay_configurations (
  client_id,
  pay_frequency,
  pay_group_ids,
  is_active,
  created_by,
  updated_by
) VALUES 
-- Weekly configuration
(
  '22222222-2222-2222-2222-222222222222'::uuid,
  'weekly',
  ARRAY[(SELECT id FROM public.pay_groups WHERE name = 'Weekly Payroll' LIMIT 1)],
  true,
  auth.uid(),
  auth.uid()
),
-- Bi-weekly configuration  
(
  '22222222-2222-2222-2222-222222222222'::uuid,
  'bi_weekly',
  ARRAY[(SELECT id FROM public.pay_groups WHERE name = 'Bi-Weekly Payroll' LIMIT 1)],
  true,
  auth.uid(),
  auth.uid()
),
-- Semi-monthly configuration (using monthly as closest match)
(
  '22222222-2222-2222-2222-222222222222'::uuid,
  'semi_monthly',
  ARRAY[(SELECT id FROM public.pay_groups WHERE name = 'Monthly Payroll' LIMIT 1)],
  true,
  auth.uid(),
  auth.uid()
)
ON CONFLICT (client_id, pay_frequency) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  updated_by = EXCLUDED.updated_by,
  updated_at = now();

-- Create client-specific earnings configuration
INSERT INTO public.client_earnings_config (
  client_id,
  pay_type_id,
  is_enabled,
  default_amount,
  calculation_method,
  settings,
  created_by
) 
SELECT 
  '22222222-2222-2222-2222-222222222222'::uuid,
  id,
  true,
  null,
  'hourly',
  '{"taxable": true, "show_on_paystub": true}',
  auth.uid()
FROM public.earnings_types 
WHERE is_active = true
ON CONFLICT (client_id, pay_type_id) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  settings = EXCLUDED.settings;

-- Create client-specific deduction configurations  
INSERT INTO public.client_deductions_config (
  client_id,
  deduction_definition_id,
  is_enabled,
  employee_default_amount,
  employer_contribution_amount,
  calculation_settings,
  created_by
)
SELECT 
  '22222222-2222-2222-2222-222222222222'::uuid,
  id,
  true,
  CASE 
    WHEN code = 'HEALTH' THEN 150.00
    WHEN code = 'DENTAL' THEN 25.00
    WHEN code = '401K' THEN null -- Will be percentage-based
    WHEN code = 'LIFE' THEN 15.00
    ELSE 50.00
  END,
  CASE 
    WHEN code = 'HEALTH' THEN 300.00 -- Employer contributes more
    WHEN code = 'DENTAL' THEN 15.00
    WHEN code = '401K' THEN null -- Will match percentage
    ELSE 0.00
  END,
  CASE 
    WHEN code = '401K' THEN '{"employee_percentage": 5.0, "employer_match_percentage": 3.0, "max_employer_match": 3.0}'
    WHEN code = 'HEALTH' THEN '{"per_pay_period": true, "annual_max": 1800.00}'
    WHEN code = 'DENTAL' THEN '{"per_pay_period": true, "annual_max": 300.00}'
    ELSE '{}'
  END::jsonb,
  auth.uid()
FROM public.deduction_types 
WHERE is_active = true
ON CONFLICT (client_id, deduction_definition_id) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  employee_default_amount = EXCLUDED.employee_default_amount,
  calculation_settings = EXCLUDED.calculation_settings;