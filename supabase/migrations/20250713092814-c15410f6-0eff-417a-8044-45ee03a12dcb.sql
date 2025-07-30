-- Insert sample deal stages if they don't exist (probability is integer, so use whole numbers)
INSERT INTO deal_stages (name, stage_order, probability, color, is_active) 
SELECT 'Discovery', 1, 25, '#3B82F6', true
WHERE NOT EXISTS (SELECT 1 FROM deal_stages WHERE name = 'Discovery');

INSERT INTO deal_stages (name, stage_order, probability, color, is_active) 
SELECT 'Demo', 2, 50, '#10B981', true
WHERE NOT EXISTS (SELECT 1 FROM deal_stages WHERE name = 'Demo');

INSERT INTO deal_stages (name, stage_order, probability, color, is_active) 
SELECT 'Proposal', 3, 75, '#F59E0B', true
WHERE NOT EXISTS (SELECT 1 FROM deal_stages WHERE name = 'Proposal');

INSERT INTO deal_stages (name, stage_order, probability, color, is_active) 
SELECT 'Contract', 4, 90, '#8B5CF6', true
WHERE NOT EXISTS (SELECT 1 FROM deal_stages WHERE name = 'Contract');

-- Insert sample deals only if table is empty (using correct column names)
INSERT INTO deals (
    title, company_name, contact_name, contact_email, value, currency, 
    stage_id, probability, expected_close_date, status
) 
SELECT 
    'Enterprise LMS Solution', 'TechCorp Solutions', 'John Smith', 'john@techcorp.com', 50000, 'USD', 
    (SELECT id FROM deal_stages WHERE name = 'Demo' LIMIT 1), 50, '2025-08-15', 'open'
WHERE NOT EXISTS (SELECT 1 FROM deals LIMIT 1);

INSERT INTO deals (
    title, company_name, contact_name, contact_email, value, currency, 
    stage_id, probability, expected_close_date, status
) 
SELECT 
    'HR Training Package', 'Manufacturing Plus', 'Sarah Johnson', 'sarah@mfgplus.com', 25000, 'USD', 
    (SELECT id FROM deal_stages WHERE name = 'Proposal' LIMIT 1), 75, '2025-07-30', 'open'
WHERE NOT EXISTS (SELECT 1 FROM deals WHERE title = 'HR Training Package');

INSERT INTO deals (
    title, company_name, contact_name, contact_email, value, currency, 
    stage_id, probability, expected_close_date, status
) 
SELECT 
    'Safety Compliance Training', 'BuildCorp Inc', 'Mike Wilson', 'mike@buildcorp.com', 15000, 'USD', 
    (SELECT id FROM deal_stages WHERE name = 'Discovery' LIMIT 1), 25, '2025-09-01', 'open'
WHERE NOT EXISTS (SELECT 1 FROM deals WHERE title = 'Safety Compliance Training');

INSERT INTO deals (
    title, company_name, contact_name, contact_email, value, currency, 
    stage_id, probability, expected_close_date, status, actual_close_date
) 
SELECT 
    'Training Platform', 'RetailCorp', 'David Brown', 'david@retailcorp.com', 20000, 'USD', 
    (SELECT id FROM deal_stages WHERE name = 'Demo' LIMIT 1), 100, '2025-01-15', 'won', '2025-01-15'
WHERE NOT EXISTS (SELECT 1 FROM deals WHERE title = 'Training Platform');