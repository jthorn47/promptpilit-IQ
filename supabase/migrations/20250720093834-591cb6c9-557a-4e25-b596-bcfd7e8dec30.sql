-- Create TestClient_2025 as a proper client with module access and payroll configuration

-- First, create the client record that references the company_settings
INSERT INTO public.clients (
  id,
  company_name,
  industry,
  employee_count,
  status,
  lifecycle_stage,
  plan_type,
  onboarding_stage,
  company_settings_id,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'TestClient_2025',
  'Manufacturing',
  50,
  'active',
  'client',
  'enterprise',
  'completed',
  '11111111-1111-1111-1111-111111111111'::uuid,
  '2025-01-01 00:00:00+00',
  now()
);

-- Create client module access for payroll and related modules
INSERT INTO public.client_module_access (
  client_id,
  module_id,
  module_type,
  is_enabled,
  settings,
  enabled_by,
  enabled_at
) VALUES 
-- Core payroll modules
('22222222-2222-2222-2222-222222222222'::uuid, 'payroll', 'platform', true, '{"full_access": true}', auth.uid(), now()),
('22222222-2222-2222-2222-222222222222'::uuid, 'time_attendance', 'platform', true, '{"tracking_enabled": true}', auth.uid(), now()),
('22222222-2222-2222-2222-222222222222'::uuid, 'benefits', 'platform', true, '{"medical": true, "dental": true, "vision": true}', auth.uid(), now()),
('22222222-2222-2222-2222-222222222222'::uuid, 'hr_management', 'platform', true, '{"employee_self_service": true}', auth.uid(), now()),
('22222222-2222-2222-2222-222222222222'::uuid, 'workers_comp', 'platform', true, '{"reporting_enabled": true}', auth.uid(), now()),
('22222222-2222-2222-2222-222222222222'::uuid, 'reports', 'platform', true, '{"payroll_reports": true, "tax_reports": true}', auth.uid(), now()),
-- Supporting modules  
('22222222-2222-2222-2222-222222222222'::uuid, 'onboarding', 'platform', true, '{"automated_workflows": true}', auth.uid(), now()),
('22222222-2222-2222-2222-222222222222'::uuid, 'compliance', 'platform', true, '{"audit_trails": true}', auth.uid(), now());

-- Create client payroll settings/configuration
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
);