-- Update company-related policies for CRM access

-- Update company_settings policies to allow Easeworks sales reps to view all companies
DROP POLICY IF EXISTS "Sales reps can view all company settings" ON public.company_settings;

CREATE POLICY "Easeworks sales reps can view all company settings" 
ON public.company_settings 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update company_locations policies to allow Easeworks sales reps to view all locations
DROP POLICY IF EXISTS "Sales reps can view all locations" ON public.company_locations;

CREATE POLICY "Easeworks sales reps can view all locations" 
ON public.company_locations 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update employees policies to allow Easeworks sales reps to view all employees
DROP POLICY IF EXISTS "Sales reps can view all employees" ON public.employees;

CREATE POLICY "Easeworks sales reps can view all employees" 
ON public.employees 
FOR SELECT 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));

-- Update invitations policies for CRM users
DROP POLICY IF EXISTS "Sales reps can manage invitations" ON public.invitations;

CREATE POLICY "Easeworks sales reps can manage invitations" 
ON public.invitations 
FOR ALL 
USING (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'))
WITH CHECK (has_crm_role(auth.uid(), 'sales_rep') OR has_crm_role(auth.uid(), 'super_admin'));