-- Check current RLS policies for company_settings
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'company_settings';

-- Update the RLS policy to allow super admins to view all companies
DROP POLICY IF EXISTS "Super admins can manage all company settings" ON public.company_settings;

CREATE POLICY "Super admins can manage all company settings" 
ON public.company_settings 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Also allow Easeworks sales reps to view companies (for CRM purposes)
DROP POLICY IF EXISTS "Easeworks sales reps can view all company settings" ON public.company_settings;

CREATE POLICY "Easeworks sales reps can view all company settings" 
ON public.company_settings 
FOR SELECT 
USING (is_easeworks_user(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));