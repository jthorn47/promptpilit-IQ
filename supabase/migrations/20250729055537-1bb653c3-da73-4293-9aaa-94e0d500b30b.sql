-- Enable RLS on email_templates table
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy for email_templates
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
USING (
  auth.role() = 'service_role'
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'company_admin'::app_role)
)
WITH CHECK (
  auth.role() = 'service_role'
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'company_admin'::app_role)
);