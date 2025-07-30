-- Create email_logs table for contextual email routing
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  template_id UUID REFERENCES public.email_templates(id),
  from_name TEXT,
  from_email TEXT,
  reply_to TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  message_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contextual foreign keys for email routing
  company_id UUID REFERENCES public.company_settings(id),
  contact_id UUID REFERENCES public.company_contacts(id),
  lead_id UUID REFERENCES public.leads(id),
  sender_id UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_logs_company_id ON public.email_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_contact_id ON public.email_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON public.email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sender_id ON public.email_logs(sender_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON public.email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_logs_updated_at
    BEFORE UPDATE ON public.email_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_email_logs_updated_at();