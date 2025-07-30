-- Additional tables for comprehensive email system

-- Email templates with visual builder support
CREATE TABLE public.email_templates_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_type TEXT NOT NULL DEFAULT 'general',
  category TEXT DEFAULT 'general',
  variables JSONB DEFAULT '[]',
  design_config JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_template BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES public.company_settings(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email lists for bulk operations
CREATE TABLE public.email_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  company_id UUID REFERENCES public.company_settings(id),
  created_by UUID REFERENCES auth.users(id),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  tags JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email list recipients
CREATE TABLE public.email_list_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES public.email_lists(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(list_id, email)
);

-- Email automation rules
CREATE TABLE public.email_automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'training_assignment', 'training_completion', 'reminder', 'custom'
  trigger_conditions JSONB DEFAULT '{}',
  template_id UUID REFERENCES public.email_templates_v2(id),
  delay_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  company_id UUID REFERENCES public.company_settings(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email signatures for users
CREATE TABLE public.email_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default',
  html_content TEXT NOT NULL,
  text_content TEXT,
  is_default BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Email audit logs for compliance
CREATE TABLE public.email_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_queue_id UUID REFERENCES public.email_queue(id),
  action_type TEXT NOT NULL, -- 'sent', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained'
  user_id UUID REFERENCES auth.users(id),
  recipient_email TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email A/B tests
CREATE TABLE public.email_ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  test_type TEXT NOT NULL DEFAULT 'subject', -- 'subject', 'content', 'sender'
  variant_a_config JSONB NOT NULL,
  variant_b_config JSONB NOT NULL,
  split_percentage INTEGER NOT NULL DEFAULT 50,
  winner_variant TEXT, -- 'a', 'b', null
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email webhooks for external integrations
CREATE TABLE public.email_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  events JSONB NOT NULL DEFAULT '["sent", "delivered", "opened", "clicked"]',
  secret_key TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  company_id UUID REFERENCES public.company_settings(id),
  created_by UUID REFERENCES auth.users(id),
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.email_templates_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_list_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company users can manage their email templates"
ON public.email_templates_v2
FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR created_by = auth.uid())
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR created_by = auth.uid());

CREATE POLICY "Company users can manage their email lists"
ON public.email_lists
FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR created_by = auth.uid())
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR created_by = auth.uid());

CREATE POLICY "Users can view list recipients for their lists"
ON public.email_list_recipients
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.email_lists el 
  WHERE el.id = email_list_recipients.list_id 
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, el.company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR el.created_by = auth.uid())
));

CREATE POLICY "Users can manage recipients for their lists"
ON public.email_list_recipients
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.email_lists el 
  WHERE el.id = email_list_recipients.list_id 
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, el.company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR el.created_by = auth.uid())
));

CREATE POLICY "Company users can manage their automation rules"
ON public.email_automation_rules
FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR created_by = auth.uid())
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR created_by = auth.uid());

CREATE POLICY "Users can manage their own signatures"
ON public.email_signatures
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Company users can view their audit logs"
ON public.email_audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR user_id = auth.uid());

CREATE POLICY "System can insert audit logs"
ON public.email_audit_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Company users can manage their AB tests"
ON public.email_ab_tests
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.email_campaigns ec 
  WHERE ec.id = email_ab_tests.campaign_id 
  AND (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR ec.created_by = auth.uid())
));

CREATE POLICY "Company users can manage their webhooks"
ON public.email_webhooks
FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR created_by = auth.uid())
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role) OR created_by = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_email_templates_v2_updated_at
BEFORE UPDATE ON public.email_templates_v2
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_lists_updated_at
BEFORE UPDATE ON public.email_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_automation_rules_updated_at
BEFORE UPDATE ON public.email_automation_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_signatures_updated_at
BEFORE UPDATE ON public.email_signatures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_ab_tests_updated_at
BEFORE UPDATE ON public.email_ab_tests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_webhooks_updated_at
BEFORE UPDATE ON public.email_webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_email_templates_v2_company ON public.email_templates_v2(company_id);
CREATE INDEX idx_email_templates_v2_active ON public.email_templates_v2(is_active);
CREATE INDEX idx_email_lists_company ON public.email_lists(company_id);
CREATE INDEX idx_email_list_recipients_list ON public.email_list_recipients(list_id);
CREATE INDEX idx_email_automation_rules_company ON public.email_automation_rules(company_id);
CREATE INDEX idx_email_audit_logs_email ON public.email_audit_logs(email_queue_id);
CREATE INDEX idx_email_audit_logs_recipient ON public.email_audit_logs(recipient_email);
CREATE INDEX idx_email_webhooks_company ON public.email_webhooks(company_id);