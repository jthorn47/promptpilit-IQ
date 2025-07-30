-- Insert sample deal stages if they don't exist
INSERT INTO deal_stages (id, name, stage_order, probability, color, is_active) 
VALUES 
  ('discovery', 'Discovery', 1, 0.25, '#3B82F6', true),
  ('demo', 'Demo', 2, 0.50, '#10B981', true),
  ('proposal', 'Proposal', 3, 0.75, '#F59E0B', true),
  ('contract', 'Contract', 4, 0.90, '#8B5CF6', true)
ON CONFLICT (id) DO NOTHING;

-- Insert some sample deals to populate the Command Center
INSERT INTO deals (
  title, 
  company_name, 
  contact_name, 
  contact_email, 
  value, 
  currency, 
  stage_id, 
  probability, 
  expected_close_date, 
  status, 
  source, 
  assigned_to, 
  created_by, 
  company_id
) VALUES 
  ('Enterprise LMS Solution', 'TechCorp Solutions', 'John Smith', 'john@techcorp.com', 50000, 'USD', 'demo', 50, '2025-08-15', 'open', 'website', auth.uid(), auth.uid(), (SELECT id FROM company_settings LIMIT 1)),
  ('HR Training Package', 'Manufacturing Plus', 'Sarah Johnson', 'sarah@mfgplus.com', 25000, 'USD', 'proposal', 75, '2025-07-30', 'open', 'referral', auth.uid(), auth.uid(), (SELECT id FROM company_settings LIMIT 1)),
  ('Safety Compliance Training', 'BuildCorp Inc', 'Mike Wilson', 'mike@buildcorp.com', 15000, 'USD', 'discovery', 25, '2025-09-01', 'open', 'website', auth.uid(), auth.uid(), (SELECT id FROM company_settings LIMIT 1)),
  ('Complete HR Solution', 'StartupXYZ', 'Lisa Chen', 'lisa@startupxyz.com', 35000, 'USD', 'contract', 90, '2025-07-20', 'open', 'sales_call', auth.uid(), auth.uid(), (SELECT id FROM company_settings LIMIT 1)),
  ('Training Platform', 'RetailCorp', 'David Brown', 'david@retailcorp.com', 20000, 'USD', 'demo', 50, '2025-01-15', 'won', 'website', auth.uid(), auth.uid(), (SELECT id FROM company_settings LIMIT 1))
WHERE NOT EXISTS (SELECT 1 FROM deals LIMIT 1);