-- Add RLS policies for cases table
CREATE POLICY "Users can view all cases" ON public.cases
FOR SELECT USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'company_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role) OR
  assigned_to = auth.uid()
);

CREATE POLICY "Admins can insert cases" ON public.cases
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'company_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role)
);

CREATE POLICY "Admins can update cases" ON public.cases
FOR UPDATE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'company_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role) OR
  assigned_to = auth.uid()
);

CREATE POLICY "Admins can delete cases" ON public.cases
FOR DELETE USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_role(auth.uid(), 'company_admin'::app_role) OR
  has_role(auth.uid(), 'internal_staff'::app_role)
);