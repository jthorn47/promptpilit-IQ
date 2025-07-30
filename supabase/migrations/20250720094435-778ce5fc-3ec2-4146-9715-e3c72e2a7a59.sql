-- Create TestClient_2025 with proper module setup and payroll configuration

-- Create the client record
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
) ON CONFLICT (id) DO NOTHING;

-- Enable payroll and related modules for TestClient_2025
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
('22222222-2222-2222-2222-222222222222'::uuid, 'payroll', 'platform', true, '{"full_access": true, "pay_frequency": ["weekly", "bi_weekly", "semi_monthly"]}', auth.uid(), now()),
('22222222-2222-2222-2222-222222222222'::uuid, 'time_attendance', 'platform', true, '{"tracking_enabled": true, "overtime_calculation": true}', auth.uid(), now()),
('22222222-2222-2222-2222-222222222222'::uuid, 'benefits', 'platform', true, '{"medical": true, "dental": true, "vision": true, "401k": true}', auth.uid(), now()),
('22222222-2222-2222-2222-222222222222'::uuid, 'hr_management', 'platform', true, '{"employee_self_service": true, "onboarding": true}', auth.uid(), now()),
('22222222-2222-2222-2222-222222222222'::uuid, 'workers_comp', 'platform', true, '{"reporting_enabled": true, "claims_management": true}', auth.uid(), now()),
('22222222-2222-2222-2222-222222222222'::uuid, 'reports', 'platform', true, '{"payroll_reports": true, "tax_reports": true, "compliance_reports": true}', auth.uid(), now()),
('22222222-2222-2222-2222-222222222222'::uuid, 'compliance', 'platform', true, '{"audit_trails": true, "policy_management": true}', auth.uid(), now())
ON CONFLICT (client_id, module_id, module_type) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  settings = EXCLUDED.settings,
  enabled_by = EXCLUDED.enabled_by,
  enabled_at = EXCLUDED.enabled_at;