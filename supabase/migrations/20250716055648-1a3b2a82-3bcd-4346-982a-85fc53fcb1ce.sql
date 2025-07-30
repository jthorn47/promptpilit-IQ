-- Simple restore without complex constraints
INSERT INTO public.clients (company_name, client_number, status, onboarding_status, date_won, contract_value, currency) VALUES
('Palms Liquor', '1030', 'active', 'completed', now(), 0, 'USD')
ON CONFLICT (client_number) DO NOTHING;