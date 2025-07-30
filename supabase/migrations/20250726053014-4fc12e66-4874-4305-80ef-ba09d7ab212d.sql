-- Add foreign key constraint between adaptive_quiz_sessions and employees
ALTER TABLE adaptive_quiz_sessions 
ADD CONSTRAINT fk_adaptive_quiz_sessions_employee 
FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;