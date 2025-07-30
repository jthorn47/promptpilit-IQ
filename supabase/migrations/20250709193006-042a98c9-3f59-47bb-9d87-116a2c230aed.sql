-- Add location_id to payroll_employees table
ALTER TABLE payroll_employees 
ADD COLUMN location_id uuid REFERENCES company_locations(id);

-- Update existing employees to be assigned to Riverlakes (primary location)
UPDATE payroll_employees 
SET location_id = (
  SELECT id FROM company_locations 
  WHERE company_id = 'de9f4dc9-d2b4-48b8-bf7f-291dabb64704' 
  AND is_primary = true
)
WHERE company_id = 'de9f4dc9-d2b4-48b8-bf7f-291dabb64704';