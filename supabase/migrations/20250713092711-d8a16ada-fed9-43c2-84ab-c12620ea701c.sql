-- Insert sample deal stages if they don't exist
INSERT INTO deal_stages (id, name, stage_order, probability, color, is_active) 
VALUES 
  (gen_random_uuid(), 'Discovery', 1, 0.25, '#3B82F6', true),
  (gen_random_uuid(), 'Demo', 2, 0.50, '#10B981', true),
  (gen_random_uuid(), 'Proposal', 3, 0.75, '#F59E0B', true),
  (gen_random_uuid(), 'Contract', 4, 0.90, '#8B5CF6', true)
ON CONFLICT (name) DO NOTHING;

-- Get or create stage IDs  
DO $$
DECLARE
    discovery_id UUID;
    demo_id UUID;
    proposal_id UUID;
    contract_id UUID;
    company_id UUID;
    user_id UUID;
BEGIN
    -- Get user ID
    SELECT auth.uid() INTO user_id;
    
    -- Get or create deal stages
    SELECT id INTO discovery_id FROM deal_stages WHERE name = 'Discovery' LIMIT 1;
    SELECT id INTO demo_id FROM deal_stages WHERE name = 'Demo' LIMIT 1;  
    SELECT id INTO proposal_id FROM deal_stages WHERE name = 'Proposal' LIMIT 1;
    SELECT id INTO contract_id FROM deal_stages WHERE name = 'Contract' LIMIT 1;
    
    -- Get a company ID
    SELECT id INTO company_id FROM company_settings LIMIT 1;
    
    -- Insert sample deals only if table is empty
    IF NOT EXISTS (SELECT 1 FROM deals LIMIT 1) THEN
        INSERT INTO deals (
            title, company_name, contact_name, contact_email, value, currency, 
            stage_id, probability, expected_close_date, status, source, 
            assigned_to, created_by, company_id
        ) VALUES 
            ('Enterprise LMS Solution', 'TechCorp Solutions', 'John Smith', 'john@techcorp.com', 50000, 'USD', demo_id, 50, '2025-08-15', 'open', 'website', user_id, user_id, company_id),
            ('HR Training Package', 'Manufacturing Plus', 'Sarah Johnson', 'sarah@mfgplus.com', 25000, 'USD', proposal_id, 75, '2025-07-30', 'open', 'referral', user_id, user_id, company_id),
            ('Safety Compliance Training', 'BuildCorp Inc', 'Mike Wilson', 'mike@buildcorp.com', 15000, 'USD', discovery_id, 25, '2025-09-01', 'open', 'website', user_id, user_id, company_id),
            ('Complete HR Solution', 'StartupXYZ', 'Lisa Chen', 'lisa@startupxyz.com', 35000, 'USD', contract_id, 90, '2025-07-20', 'open', 'sales_call', user_id, user_id, company_id),
            ('Training Platform', 'RetailCorp', 'David Brown', 'david@retailcorp.com', 20000, 'USD', demo_id, 50, '2025-01-15', 'won', 'website', user_id, user_id, company_id);
    END IF;
END $$;