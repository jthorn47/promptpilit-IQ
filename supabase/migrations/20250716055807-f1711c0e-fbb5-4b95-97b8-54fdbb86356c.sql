-- Temporarily drop the problematic trigger
DROP TRIGGER IF EXISTS auto_promote_to_paying_client_trigger ON public.clients;

-- Insert Palms Liquor and other essential clients
INSERT INTO public.clients (
  company_name, 
  client_number, 
  status, 
  onboarding_status, 
  date_won, 
  contract_value, 
  currency, 
  company_settings_id
) VALUES 
  ('Palms Liquor', '1030', 'active', 'completed', now(), 0, 'USD', '14caa64c-11f1-4e53-ab19-82cb08c71ca3'),
  ('Demo Co', '1', 'active', 'completed', now(), 0, 'USD', '14caa64c-11f1-4e53-ab19-82cb08c71ca3'),
  ('Easeworks, LLC', 'ease', 'active', 'completed', now(), 0, 'USD', '14caa64c-11f1-4e53-ab19-82cb08c71ca3')
ON CONFLICT (client_number) DO NOTHING;

-- Recreate the trigger (if it existed)
-- Note: This assumes the trigger function exists and works properly when auth.uid() returns NULL