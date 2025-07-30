-- Create client-specific payroll settings and configurations for TestClient_2025

-- Create client payroll settings
INSERT INTO public.client_payroll_settings (
  client_id,
  pay_frequency,
  pay_period_calendar,
  direct_deposit_enabled,
  pay_stub_delivery_method,
  auto_calculate_overtime,
  overtime_threshold_hours,
  overtime_calculation_method,
  holiday_pay_enabled,
  sick_pay_enabled,
  vacation_accrual_enabled,
  workers_comp_enabled,
  state_tax_enabled,
  federal_tax_enabled,
  fica_enabled,
  suta_enabled,
  futa_enabled,
  approval_workflow_enabled,
  multi_state_payroll,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'multiple', -- Supports multiple frequencies
  '{"weekly": true, "bi_weekly": true, "semi_monthly": true}',
  true,
  'email_and_portal',
  true,
  40.0,
  'california_rules',
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  false, -- Single state for now
  '2025-01-01 00:00:00+00',
  now()
) ON CONFLICT (client_id) DO UPDATE SET
  pay_frequency = EXCLUDED.pay_frequency,
  updated_at = now();

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
  updated_by = EXCLUDED.updated_by;