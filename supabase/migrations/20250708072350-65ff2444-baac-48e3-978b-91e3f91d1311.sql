-- Enhanced email administration tables

-- Email queue for scheduled and bulk emails
CREATE TABLE public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_id UUID REFERENCES public.email_templates(id),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  priority INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email analytics for tracking opens, clicks, bounces
CREATE TABLE public.email_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_queue_id UUID REFERENCES public.email_queue(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  location TEXT,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email delivery status tracking
CREATE TABLE public.email_delivery_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_queue_id UUID REFERENCES public.email_queue(id),
  status TEXT NOT NULL,
  status_details TEXT,
  delivery_timestamp TIMESTAMP WITH TIME ZONE,
  bounce_type TEXT,
  bounce_reason TEXT,
  complaint_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Domain verification for SPF/DKIM
CREATE TABLE public.email_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  spf_record TEXT,
  dkim_record TEXT,
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  company_id UUID REFERENCES public.company_settings(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email campaigns for bulk operations
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.email_templates(id),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  opened_count INTEGER NOT NULL DEFAULT 0,
  clicked_count INTEGER NOT NULL DEFAULT 0,
  bounced_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  campaign_data JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_delivery_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company admins can manage email queue"
ON public.email_queue
FOR ALL
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can view email analytics"
ON public.email_analytics
FOR SELECT
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert email analytics"
ON public.email_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Company admins can view delivery status"
ON public.email_delivery_status
FOR SELECT
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can manage delivery status"
ON public.email_delivery_status
FOR ALL
WITH CHECK (true);

CREATE POLICY "Company admins can manage their domains"
ON public.email_domains
FOR ALL
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage email campaigns"
ON public.email_campaigns
FOR ALL
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_email_queue_updated_at
BEFORE UPDATE ON public.email_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_domains_updated_at
BEFORE UPDATE ON public.email_domains
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
BEFORE UPDATE ON public.email_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_email_queue_status ON public.email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON public.email_queue(scheduled_for);
CREATE INDEX idx_email_analytics_event ON public.email_analytics(event_type);
CREATE INDEX idx_email_delivery_status ON public.email_delivery_status(status);