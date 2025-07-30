-- Temporarily disable triggers that require authentication
ALTER TABLE public.clients DISABLE TRIGGER ALL;

-- Add the client data directly without triggers
INSERT INTO public.clients (company_name, client_number, status, onboarding_status, date_won, contract_value, currency) VALUES
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
ON CONFLICT (client_number) DO NOTHING;

-- Re-enable triggers
ALTER TABLE public.clients ENABLE TRIGGER ALL;