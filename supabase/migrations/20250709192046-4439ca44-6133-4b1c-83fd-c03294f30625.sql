-- Add unique constraint to payroll_calculations table
ALTER TABLE payroll_calculations 
ADD CONSTRAINT unique_payroll_period_employee 
UNIQUE (payroll_period_id, payroll_employee_id);