-- Add a new column for employee ID text display
ALTER TABLE payroll_employees ADD COLUMN employee_id_display TEXT;

-- Update all employees with test employee IDs
WITH numbered_employees AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM payroll_employees 
  WHERE employee_id_display IS NULL
)
UPDATE payroll_employees 
SET employee_id_display = 'EMP' || LPAD(numbered_employees.row_num::text, 4, '0')
FROM numbered_employees 
WHERE payroll_employees.id = numbered_employees.id;