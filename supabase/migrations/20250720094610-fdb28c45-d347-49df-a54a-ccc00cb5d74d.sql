-- Create client-specific payroll settings with correct schema for TestClient_2025

-- Create client payroll settings with actual table structure
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
  'multiple', -- Supports multiple frequencies
  (SELECT id FROM public.pay_groups WHERE name = 'Bi-Weekly Payroll' LIMIT 1), -- Default to bi-weekly
  ARRAY(SELECT id FROM public.earnings_types WHERE is_active = true LIMIT 6), -- Include standard earnings
  ARRAY(SELECT id FROM public.deduction_types WHERE is_active = true LIMIT 6), -- Include standard deductions
  '12-3456789', -- Test EIN
  false, -- Allow paper checks for testing
  'email_and_portal',
  '{"state": "CA", "city": "Test City", "state_sdi": true}',
  '{"overtime_threshold": 40.0, "california_rules": true, "multi_frequency_support": true}',
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