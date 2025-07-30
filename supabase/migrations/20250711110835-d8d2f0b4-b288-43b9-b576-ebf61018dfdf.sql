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