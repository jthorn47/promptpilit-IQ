-- Create RLS policies for sales reps
-- Sales reps can view all assessments
CREATE POLICY "Sales reps can view all assessments" 
ON public.assessments 
FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role));

-- Sales reps can view all company settings
CREATE POLICY "Sales reps can view all company settings" 
ON public.company_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role));

-- Sales reps can view all employees
CREATE POLICY "Sales reps can view all employees" 
ON public.employees 
FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role));

-- Sales reps can create and manage invitations
CREATE POLICY "Sales reps can manage invitations" 
ON public.invitations 
FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role))
WITH CHECK (has_role(auth.uid(), 'sales_rep'::app_role));

-- Sales reps can view training modules (published ones)
CREATE POLICY "Sales reps can view published training modules" 
ON public.training_modules 
FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role) AND status = 'published');

-- Sales reps can view training completions and assignments for reporting
CREATE POLICY "Sales reps can view training completions" 
ON public.training_completions 
FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role));

CREATE POLICY "Sales reps can view training assignments" 
ON public.training_assignments 
FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role));