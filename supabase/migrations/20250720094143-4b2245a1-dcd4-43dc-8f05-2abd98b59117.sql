-- Temporarily disable the trigger, create client, then restore
ALTER TABLE public.clients DISABLE TRIGGER create_default_client_modules;

-- Create TestClient_2025 client record
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

-- Re-enable the trigger
ALTER TABLE public.clients ENABLE TRIGGER create_default_client_modules;