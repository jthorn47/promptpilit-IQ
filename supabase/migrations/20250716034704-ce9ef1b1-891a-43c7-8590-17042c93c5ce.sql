-- Enable RLS on company_settings if not already enabled
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for super admins to view all companies
CREATE POLICY "Super admins can view all companies" 
ON public.company_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create policy for super admins to manage all companies
CREATE POLICY "Super admins can manage all companies" 
ON public.company_settings 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role)) 
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Create policy for company admins to view their own company
CREATE POLICY "Company admins can view their company" 
ON public.company_settings 
FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, id));

-- Create policy for company admins to manage their own company
CREATE POLICY "Company admins can manage their company" 
ON public.company_settings 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, id)) 
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, id));