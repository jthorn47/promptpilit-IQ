-- Update clients table policies to use internal_staff instead of sales_rep

-- Drop old policies
DROP POLICY IF EXISTS "Sales reps and account managers can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Sales reps and account managers can view clients" ON public.clients;

-- Create new policies using internal_staff
CREATE POLICY "Internal staff and account managers can view clients" 
ON public.clients 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'internal_staff') OR has_crm_role(auth.uid(), 'super_admin'));

CREATE POLICY "Internal staff and account managers can manage clients" 
ON public.clients 
FOR ALL 
USING (has_crm_role(auth.uid(), 'internal_staff') OR has_crm_role(auth.uid(), 'super_admin'));

-- Also check and update any other tables that might still reference sales_rep
DROP POLICY IF EXISTS "Sales reps can view published training modules" ON public.training_modules;
DROP POLICY IF EXISTS "Sales reps can view training completions" ON public.training_completions;
DROP POLICY IF EXISTS "Sales reps can view training assignments" ON public.training_assignments;

-- Update training module policies if they exist
CREATE POLICY "Internal staff can view published training modules" 
ON public.training_modules 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'internal_staff') OR has_crm_role(auth.uid(), 'super_admin')) 
WHERE status = 'published';

-- Update training completion policies if they exist
CREATE POLICY "Internal staff can view training completions" 
ON public.training_completions 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'internal_staff') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update training assignment policies if they exist  
CREATE POLICY "Internal staff can view training assignments" 
ON public.training_assignments 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'internal_staff') OR has_crm_role(auth.uid(), 'super_admin'));