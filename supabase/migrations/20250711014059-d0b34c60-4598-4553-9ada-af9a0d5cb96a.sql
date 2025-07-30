-- Insert additional clients from the third image (excluding test entries)
INSERT INTO public.clients (company_name, client_number, status, onboarding_status, date_won, contract_value, currency) VALUES
('Palms Liquor Store', '1007', 'active', 'completed', now(), 0, 'USD'),
('Relief One Solutions', '1006', 'active', 'completed', now(), 0, 'USD'),
('Reveal Medical Aesthetics, Inc', '1121', 'active', 'completed', now(), 0, 'USD'),
('San Joaquin Valley Mortgage', '1017', 'active', 'completed', now(), 0, 'USD'),
('Watson Realty Services, Inc', '1012', 'active', 'completed', now(), 0, 'USD'),
('WLIP Licensing, LLC', '1004', 'active', 'completed', now(), 0, 'USD'),
('Wounded Heroes Fund Kern County', '1008', 'active', 'completed', now(), 0, 'USD')
ON CONFLICT (client_number) DO NOTHING;