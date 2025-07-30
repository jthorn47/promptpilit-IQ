-- Simple client creation for TestClient_2025
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