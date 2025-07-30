-- First, create a default company for the clients if none exists  
INSERT INTO public.company_settings (
  id,
  company_name,
  subscription_status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Default Company',
  'active',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Get the company ID for association
WITH default_company AS (
  SELECT id FROM public.company_settings WHERE company_name = 'Default Company' LIMIT 1
)
-- Restore the client data with proper company association
INSERT INTO public.clients (company_name, client_number, status, onboarding_status, date_won, contract_value, currency, company_settings_id) 
SELECT company_name, client_number, status, onboarding_status, date_won, contract_value, currency, default_company.id
FROM (VALUES 
  ('420 Kingdom', '1005', 'active', 'completed', now(), 0, 'USD'),
  ('Alta Sierra Dairy', '1027', 'active', 'completed', now(), 0, 'USD'),
  ('Assume Safety LLC', '1015', 'active', 'completed', now(), 0, 'USD'),
  ('Central California Escrow Co.', '1011', 'active', 'completed', now(), 0, 'USD'),
  ('Demo Co', '1', 'active', 'completed', now(), 0, 'USD'),
  ('Dogtopia Bakersfield', '1025', 'active', 'completed', now(), 0, 'USD'),
  ('Easeworks, LLC', 'ease', 'active', 'completed', now(), 0, 'USD'),
  ('Evergreen', '1002', 'active', 'completed', now(), 0, 'USD'),
  ('F45 Training Riverlakes', '1019', 'active', 'completed', now(), 0, 'USD'),
  ('F45 Training Visalia', '1020', 'active', 'completed', now(), 0, 'USD'),
  ('JM Precision Golf Carts', '1026', 'active', 'completed', now(), 0, 'USD'),
  ('Kellys Demo', '1001', 'active', 'completed', now(), 0, 'USD'),
  ('Kern Economic Development Corporation', '1016', 'active', 'completed', now(), 0, 'USD'),
  ('Kern Livestock Grain, Inc', '1018', 'active', 'completed', now(), 0, 'USD'),
  ('Logan Dental Corporation', '1022', 'active', 'completed', now(), 0, 'USD'),
  ('LVL Fitness Fresno, LLC', '1122', 'active', 'completed', now(), 0, 'USD'),
  ('LVL Fitness, CLIMB by LVL Fitness', '1028', 'active', 'completed', now(), 0, 'USD'),
  ('Mancrafted, Inc', '1009', 'active', 'completed', now(), 0, 'USD'),
  ('March Consulting', '1010', 'active', 'completed', now(), 0, 'USD'),
  ('North Kern South Tulare Hospital District', '1014', 'active', 'completed', now(), 0, 'USD'),
  ('Palms Liquor', '1030', 'active', 'completed', now(), 0, 'USD')
) AS client_data(company_name, client_number, status, onboarding_status, date_won, contract_value, currency)
CROSS JOIN default_company
ON CONFLICT (client_number) DO NOTHING;