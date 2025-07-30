-- Phase 3: Email Integration & Automation

-- Email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_type TEXT NOT NULL DEFAULT 'general', -- general, follow_up, welcome, proposal, etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  variables JSONB DEFAULT '[]'::jsonb, -- Available template variables
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email campaigns table
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_id UUID REFERENCES public.email_templates(id),
  status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, sending, sent, paused
  send_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email campaign recipients table
CREATE TABLE public.email_campaign_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id),
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, bounced, failed
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  tracking_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email automation workflows table
CREATE TABLE public.email_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- lead_created, lead_status_change, activity_completed, time_based
  trigger_conditions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email workflow steps table
CREATE TABLE public.email_workflow_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.email_workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL DEFAULT 'email', -- email, delay, condition
  template_id UUID REFERENCES public.email_templates(id),
  delay_amount INTEGER, -- in hours
  conditions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email workflow executions table
CREATE TABLE public.email_workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.email_workflows(id),
  lead_id UUID REFERENCES public.leads(id),
  current_step INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, paused, failed
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  next_execution_at TIMESTAMP WITH TIME ZONE,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, html_content, text_content, template_type, variables, created_by) VALUES
('Welcome Email', 'Welcome to {{company_name}}!', '<h1>Welcome {{first_name}}!</h1><p>Thank you for your interest in our services. We''re excited to help you with your HR needs.</p><p>Best regards,<br>{{sender_name}}</p>', 'Welcome {{first_name}}!\n\nThank you for your interest in our services. We''re excited to help you with your HR needs.\n\nBest regards,\n{{sender_name}}', 'welcome', '["first_name", "company_name", "sender_name"]'::jsonb, '00000000-0000-0000-0000-000000000000'),
('Follow-up Email', 'Following up on our conversation', '<h2>Hi {{first_name}},</h2><p>I wanted to follow up on our recent conversation about {{topic}}.</p><p>Do you have any questions about our HR services? I''d be happy to schedule a call to discuss further.</p><p>Best regards,<br>{{sender_name}}</p>', 'Hi {{first_name}},\n\nI wanted to follow up on our recent conversation about {{topic}}.\n\nDo you have any questions about our HR services? I''d be happy to schedule a call to discuss further.\n\nBest regards,\n{{sender_name}}', 'follow_up', '["first_name", "topic", "sender_name"]'::jsonb, '00000000-0000-0000-0000-000000000000'),
('Proposal Email', 'Your Custom HR Solutions Proposal', '<h2>Hi {{first_name}},</h2><p>Thank you for taking the time to discuss your HR needs with us. I''ve prepared a custom proposal for {{company_name}}.</p><p>The proposal includes:</p><ul><li>HR Risk Assessment</li><li>Compliance Management</li><li>Employee Training Solutions</li><li>Ongoing Support</li></ul><p>I''d love to schedule a call to walk through the details.</p><p>Best regards,<br>{{sender_name}}</p>', 'Hi {{first_name}},\n\nThank you for taking the time to discuss your HR needs with us. I''ve prepared a custom proposal for {{company_name}}.\n\nThe proposal includes:\n- HR Risk Assessment\n- Compliance Management\n- Employee Training Solutions\n- Ongoing Support\n\nI''d love to schedule a call to walk through the details.\n\nBest regards,\n{{sender_name}}', 'proposal', '["first_name", "company_name", "sender_name"]'::jsonb, '00000000-0000-0000-0000-000000000000');

-- Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_workflow_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Sales reps can view all email templates" 
ON public.email_templates FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Sales reps can manage email templates" 
ON public.email_templates FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for email_campaigns
CREATE POLICY "Sales reps can manage email campaigns" 
ON public.email_campaigns FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for email_campaign_recipients
CREATE POLICY "Sales reps can manage campaign recipients" 
ON public.email_campaign_recipients FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for email_workflows
CREATE POLICY "Sales reps can manage email workflows" 
ON public.email_workflows FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for email_workflow_steps
CREATE POLICY "Sales reps can manage workflow steps" 
ON public.email_workflow_steps FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for email_workflow_executions
CREATE POLICY "Sales reps can view workflow executions" 
ON public.email_workflow_executions FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_campaign_recipients_updated_at
  BEFORE UPDATE ON public.email_campaign_recipients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_workflows_updated_at
  BEFORE UPDATE ON public.email_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_workflow_steps_updated_at
  BEFORE UPDATE ON public.email_workflow_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_workflow_executions_updated_at
  BEFORE UPDATE ON public.email_workflow_executions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_email_templates_type ON public.email_templates(template_type);
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX idx_email_campaign_recipients_campaign_id ON public.email_campaign_recipients(campaign_id);
CREATE INDEX idx_email_campaign_recipients_status ON public.email_campaign_recipients(status);
CREATE INDEX idx_email_campaign_recipients_tracking_id ON public.email_campaign_recipients(tracking_id);
CREATE INDEX idx_email_workflows_trigger_type ON public.email_workflows(trigger_type);
CREATE INDEX idx_email_workflow_executions_workflow_id ON public.email_workflow_executions(workflow_id);
CREATE INDEX idx_email_workflow_executions_status ON public.email_workflow_executions(status);
CREATE INDEX idx_email_workflow_executions_next_execution ON public.email_workflow_executions(next_execution_at);