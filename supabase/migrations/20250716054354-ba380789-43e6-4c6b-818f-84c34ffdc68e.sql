-- Insert test companies with different lifecycle stages for testing
INSERT INTO public.company_settings (
  company_name,
  sales_lifecycle_stage,
  contract_value,
  currency,
  subscription_status,
  created_at,
  updated_at
) 
SELECT * FROM (
  VALUES 
    ('TechCorp Solutions', 'lead_new', 75000, 'USD', 'trial', NOW() - INTERVAL '5 days', NOW()),
    ('Global Manufacturing Inc', 'prospect_qualified', 120000, 'USD', 'trial', NOW() - INTERVAL '12 days', NOW()),
    ('StartupHub LLC', 'proposal_sent', 85000, 'USD', 'trial', NOW() - INTERVAL '8 days', NOW()),
    ('Enterprise Systems Corp', 'client_active', 200000, 'USD', 'active', NOW() - INTERVAL '2 days', NOW()),
    ('Innovation Labs', 'lead_new', 60000, 'USD', 'trial', NOW() - INTERVAL '3 days', NOW()),
    ('DataFlow Analytics', 'prospect_qualified', 95000, 'USD', 'trial', NOW() - INTERVAL '7 days', NOW())
) AS new_companies(company_name, sales_lifecycle_stage, contract_value, currency, subscription_status, created_at, updated_at)
WHERE NOT EXISTS (
  SELECT 1 FROM public.company_settings cs 
  WHERE cs.company_name = new_companies.company_name
);