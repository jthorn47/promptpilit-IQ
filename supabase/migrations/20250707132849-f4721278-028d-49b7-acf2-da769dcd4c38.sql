-- First, let's ensure all existing employees have a company_id
-- For any orphaned employees, we'll need to handle them
UPDATE employees 
SET company_id = (
  SELECT id FROM company_settings 
  WHERE company_name = 'Demo Corporation' 
  LIMIT 1
) 
WHERE company_id IS NULL;

-- Now make company_id required for employees (learners)
ALTER TABLE employees 
ALTER COLUMN company_id SET NOT NULL;

-- Add a foreign key constraint if it doesn't exist
ALTER TABLE employees 
DROP CONSTRAINT IF EXISTS employees_company_id_fkey;

ALTER TABLE employees 
ADD CONSTRAINT employees_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES company_settings(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_employee_id ON training_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_completions_employee_id ON training_completions(employee_id);