-- Create TestClient_2025 as a proper client with all required fields

-- First, create the client record that references the company_settings
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
  '2025-01-01 00:00:00+00', -- date_won is required
  '2025-01-01 00:00:00+00',
  now(),
  'test_setup'
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