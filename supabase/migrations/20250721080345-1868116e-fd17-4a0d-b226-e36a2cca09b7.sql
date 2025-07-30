-- Create RLS policies for org_locations table
CREATE POLICY "Company admins can manage their org locations" 
ON public.org_locations 
FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create RLS policies for org_divisions table
CREATE POLICY "Company admins can manage their org divisions" 
ON public.org_divisions 
FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create RLS policies for org_departments table
CREATE POLICY "Company admins can manage their org departments" 
ON public.org_departments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.org_divisions od 
    WHERE od.id = org_departments.division_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, od.company_id) OR 
         has_role(auth.uid(), 'super_admin'::app_role))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.org_divisions od 
    WHERE od.id = org_departments.division_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, od.company_id) OR 
         has_role(auth.uid(), 'super_admin'::app_role))
  )
);

-- Create RLS policies for employee_org_assignments table
CREATE POLICY "Company admins can manage their employee org assignments" 
ON public.employee_org_assignments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.org_locations ol 
    WHERE ol.id = employee_org_assignments.location_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, ol.company_id) OR 
         has_role(auth.uid(), 'super_admin'::app_role))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.org_locations ol 
    WHERE ol.id = employee_org_assignments.location_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, ol.company_id) OR 
         has_role(auth.uid(), 'super_admin'::app_role))
  )
);