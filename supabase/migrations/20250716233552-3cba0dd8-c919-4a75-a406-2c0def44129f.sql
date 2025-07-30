-- Add contextual foreign key relationships to email_logs table
ALTER TABLE public.email_logs 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_settings(id),
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES public.company_contacts(id),
ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id),
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_logs_company_id ON public.email_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_contact_id ON public.email_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON public.email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sender_id ON public.email_logs(sender_id);

-- Update RLS policies for contextual access
DROP POLICY IF EXISTS "Company admins can view email logs" ON public.email_logs;
DROP POLICY IF EXISTS "System can insert email logs" ON public.email_logs;

-- Enhanced RLS policies for contextual email access
CREATE POLICY "Users can view their sent emails"
ON public.email_logs
FOR SELECT
USING (sender_id = auth.uid());

CREATE POLICY "Company admins can view company emails"
ON public.email_logs  
FOR SELECT
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "CRM staff can view all emails"
ON public.email_logs
FOR SELECT  
USING (has_crm_role(auth.uid(), 'internal_staff'::app_role) OR has_crm_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can insert email logs"
ON public.email_logs
FOR INSERT
WITH CHECK (sender_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can update their email logs"
ON public.email_logs
FOR UPDATE
USING (sender_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));