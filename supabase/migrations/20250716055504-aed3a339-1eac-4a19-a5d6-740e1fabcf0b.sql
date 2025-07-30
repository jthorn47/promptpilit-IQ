-- First, create a default company for the clients if none exists
INSERT INTO public.company_settings (
  id,
  company_name,
  subscription_status,
  created_at,
  updated_at
) VALUES (
  'default-company-id-123',
  'Default Company',
  'active',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Restore the client data with proper company association
INSERT INTO public.clients (company_name, client_number, status, onboarding_status, date_won, contract_value, currency, company_settings_id) VALUES
('420 Kingdom', '1005', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Alta Sierra Dairy', '1027', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Assume Safety LLC', '1015', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Central California Escrow Co.', '1011', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Demo Co', '1', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Dogtopia Bakersfield', '1025', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Easeworks, LLC', 'ease', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Evergreen', '1002', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('F45 Training Riverlakes', '1019', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('F45 Training Visalia', '1020', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('JM Precision Golf Carts', '1026', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Kellys Demo', '1001', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Kern Economic Development Corporation', '1016', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Kern Livestock Grain, Inc', '1018', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Logan Dental Corporation', '1022', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('LVL Fitness Fresno, LLC', '1122', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('LVL Fitness, CLIMB by LVL Fitness', '1028', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Mancrafted, Inc', '1009', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('March Consulting', '1010', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('North Kern South Tulare Hospital District', '1014', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123'),
('Palms Liquor', '1030', 'active', 'completed', now(), 0, 'USD', 'default-company-id-123')
ON CONFLICT (client_number) DO NOTHING;