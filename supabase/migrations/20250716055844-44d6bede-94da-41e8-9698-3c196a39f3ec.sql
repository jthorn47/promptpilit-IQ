-- Drop the problematic function that requires auth context
DROP FUNCTION IF EXISTS auto_promote_to_paying_client() CASCADE;

-- Insert Palms Liquor directly
INSERT INTO public.clients (
  company_name, 
  client_number, 
  status, 
  onboarding_status, 
  date_won, 
  contract_value, 
  currency, 
  company_settings_id
) VALUES (
  'Palms Liquor', 
  '1030', 
  'active', 
  'completed', 
  now(), 
  0, 
  'USD', 
  '14caa64c-11f1-4e53-ab19-82cb08c71ca3'
)
ON CONFLICT (client_number) DO NOTHING;