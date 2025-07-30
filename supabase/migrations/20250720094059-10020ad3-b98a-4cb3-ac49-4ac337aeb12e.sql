-- Create TestClient_2025 client record only (basic setup)

INSERT INTO public.clients (
  id,
  company_name,
  status,
  plan_type,
  subscription_status,
  onboarding_status,
  company_settings_id,
  contract_start_date,
  contract_end_date,
  date_won,
  created_at,
  updated_at,
  source
) VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'TestClient_2025',
  'active',
  'enterprise',
  'active',
  'completed',
  '11111111-1111-1111-1111-111111111111'::uuid,
  '2025-01-01',
  '2025-12-31',
  '2025-01-01 00:00:00+00',
  '2025-01-01 00:00:00+00',
  now(),
  'test_setup'
);

-- Create client-specific pay types for TestClient_2025
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
WHERE is_active = true;

-- Create client-specific deduction configurations for TestClient_2025
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
    ELSE 0.00
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
WHERE is_active = true;