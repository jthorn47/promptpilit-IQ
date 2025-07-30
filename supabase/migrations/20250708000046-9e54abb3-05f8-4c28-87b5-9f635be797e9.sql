-- Drop existing policies
DROP POLICY "Company admins can manage their training modules" ON public.training_modules;
DROP POLICY "Super admins can manage all training modules" ON public.training_modules;

-- Recreate policies with proper WITH CHECK clauses for INSERT operations
CREATE POLICY "Company admins can manage their training modules" 
ON public.training_modules 
FOR ALL 
USING (has_role(auth.uid(), 'company_admin'::app_role) AND (created_by = auth.uid()))
WITH CHECK (has_role(auth.uid(), 'company_admin'::app_role) AND (created_by = auth.uid()));

CREATE POLICY "Super admins can manage all training modules" 
ON public.training_modules 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));