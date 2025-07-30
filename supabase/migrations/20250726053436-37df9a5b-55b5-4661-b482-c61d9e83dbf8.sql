-- Add RLS policies for adaptive quiz tables

-- Policies for employees table
CREATE POLICY "Users can view employees from their company" ON employees
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.company_id = employees.company_id)
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'super_admin')
);

-- Policies for training_modules table  
CREATE POLICY "Users can view training modules" ON training_modules
FOR SELECT USING (
  company_id IS NULL -- Global modules
  OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.company_id = training_modules.company_id)
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'super_admin')
);

-- Policies for quiz_questions table
CREATE POLICY "Users can view quiz questions" ON quiz_questions
FOR SELECT USING (true);

-- Policies for quiz_responses table
CREATE POLICY "Users can view their quiz responses" ON quiz_responses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM adaptive_quiz_sessions aqs
    JOIN employees e ON aqs.employee_id = e.id
    WHERE aqs.id = quiz_responses.session_id
    AND (e.user_id = auth.uid() OR EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'super_admin'))
  )
);

CREATE POLICY "Users can create quiz responses" ON quiz_responses
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM adaptive_quiz_sessions aqs
    JOIN employees e ON aqs.employee_id = e.id
    WHERE aqs.id = quiz_responses.session_id
    AND e.user_id = auth.uid()
  )
);