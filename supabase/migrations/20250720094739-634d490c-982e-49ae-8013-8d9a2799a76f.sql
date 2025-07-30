-- Create TestClient_2025 payroll configurations without conflicts

-- Create client payroll settings with bi_weekly as default
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
  'bi_weekly',
  (SELECT id FROM public.pay_groups WHERE name = 'Bi-Weekly Payroll' LIMIT 1),
  ARRAY(SELECT id FROM public.earnings_types WHERE is_active = true LIMIT 6),
  ARRAY(SELECT id FROM public.deduction_types WHERE is_active = true LIMIT 6),
  '12-3456789',
  false,
  'both',
  '{"state": "CA", "city": "Test City", "state_sdi": true}',
  '{"overtime_threshold": 40.0, "california_rules": true}',
  '2025-01-01 00:00:00+00',
  now(),
  auth.uid(),
  auth.uid()
);

-- Create client pay configurations for multiple pay frequencies
INSERT INTO public.client_pay_configurations (
  client_id,
  pay_frequency,
  pay_group_ids,
  is_active,
  created_by,
  updated_by
) VALUES 
('22222222-2222-2222-2222-222222222222'::uuid, 'weekly', ARRAY[(SELECT id FROM public.pay_groups WHERE name = 'Weekly Payroll' LIMIT 1)], true, auth.uid(), auth.uid()),
('22222222-2222-2222-2222-222222222222'::uuid, 'bi_weekly', ARRAY[(SELECT id FROM public.pay_groups WHERE name = 'Bi-Weekly Payroll' LIMIT 1)], true, auth.uid(), auth.uid()),
('22222222-2222-2222-2222-222222222222'::uuid, 'semi_monthly', ARRAY[(SELECT id FROM public.pay_groups WHERE name = 'Monthly Payroll' LIMIT 1)], true, auth.uid(), auth.uid());