-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email logs table for tracking sent emails
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  template_id UUID REFERENCES public.email_templates(id),
  from_name TEXT,
  from_email TEXT,
  reply_to TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT,
  message_id TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email settings table for storing email configuration
CREATE TABLE public.email_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.company_settings(id),
  from_name TEXT NOT NULL DEFAULT 'EaseLearn',
  from_email TEXT NOT NULL DEFAULT 'noreply@easeworks.com',
  reply_to TEXT NOT NULL DEFAULT 'support@easeworks.com',
  smtp_enabled BOOLEAN NOT NULL DEFAULT false,
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Company admins can manage email templates"
ON public.email_templates
FOR ALL
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for email_logs
CREATE POLICY "Company admins can view email logs"
ON public.email_logs
FOR SELECT
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert email logs"
ON public.email_logs
FOR INSERT
WITH CHECK (true);

-- RLS Policies for email_settings
CREATE POLICY "Company admins can manage email settings"
ON public.email_settings
FOR ALL
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_settings_updated_at
BEFORE UPDATE ON public.email_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();