-- Insert the clients from the image
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
('F45 Training Visalia', '1020', 'active', 'completed', now(), 0, 'USD')
ON CONFLICT (client_number) DO NOTHING;