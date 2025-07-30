-- Fix the RLS policy that references invalid 'payroll_manager' role
-- Drop the problematic policy
DROP POLICY IF EXISTS "Payroll managers can view and update payroll settings" ON public.client_module_settings;

-- Recreate the policy without the invalid payroll_manager role
CREATE POLICY "Admins can manage HaaLO module settings"
ON public.client_module_settings
FOR ALL
USING (
    module_name LIKE 'HaaLO.%' AND
    (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'company_admin'::app_role) OR
        has_role(auth.uid(), 'admin'::app_role)
    ) AND
    EXISTS (
        SELECT 1 FROM public.clients c
        WHERE c.id = client_module_settings.client_id
        AND c.company_settings_id = get_user_company_id(auth.uid())
    )
);