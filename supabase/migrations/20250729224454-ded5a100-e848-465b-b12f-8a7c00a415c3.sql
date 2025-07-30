-- Fix security warnings by adding proper RLS policies for existing tables

-- Additional policies for employees table (if missing)
CREATE POLICY "Company admins can view employees" 
ON public.employees 
FOR SELECT 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can insert employees" 
ON public.employees 
FOR INSERT 
WITH CHECK (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can update employees" 
ON public.employees 
FOR UPDATE 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can delete employees" 
ON public.employees 
FOR DELETE 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Additional policies for clients table (if missing)
CREATE POLICY "Company admins can view clients" 
ON public.clients 
FOR SELECT 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can insert clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can update clients" 
ON public.clients 
FOR UPDATE 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can delete clients" 
ON public.clients 
FOR DELETE 
USING (
  has_role(auth.uid(), 'super_admin'::app_role)
);