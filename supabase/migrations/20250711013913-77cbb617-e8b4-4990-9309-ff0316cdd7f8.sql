-- Insert additional clients from the second image
INSERT INTO public.clients (company_name, client_number, status, onboarding_status, date_won, contract_value, currency) VALUES
('JM Precision Golf Carts', '1026', 'active', 'completed', now(), 0, 'USD'),
('Kellys Demo', '1001', 'active', 'completed', now(), 0, 'USD'),
('Kern Economic Development Corporation', '1016', 'active', 'completed', now(), 0, 'USD'),
('Kern Livestock Grain, Inc', '1018', 'active', 'completed', now(), 0, 'USD'),
('Logan Dental Corporation', '1022', 'active', 'completed', now(), 0, 'USD'),
('LVL Fitness Fresno, LLC', '1122', 'active', 'completed', now(), 0, 'USD'),
('LVL Fitness, CLIMB by LVL Fitness', '1028', 'active', 'completed', now(), 0, 'USD'),
('Mancrafted, Inc', '1009', 'active', 'completed', now(), 0, 'USD'),
('March Consulting', '1010', 'active', 'completed', now(), 0, 'USD'),
('North Kern South Tulare Hospital District', '1014', 'active', 'completed', now(), 0, 'USD')
ON CONFLICT (client_number) DO NOTHING;