-- Add missing columns to tables
ALTER TABLE employees ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_settings(id);
ALTER TABLE training_modules ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES company_settings(id);

-- Add sample data for testing
INSERT INTO training_modules (id, title, description, company_id) VALUES 
(gen_random_uuid(), 'Workplace Safety', 'Basic workplace safety training', NULL),
(gen_random_uuid(), 'HR Compliance', 'Human resources compliance training', NULL)
ON CONFLICT DO NOTHING;