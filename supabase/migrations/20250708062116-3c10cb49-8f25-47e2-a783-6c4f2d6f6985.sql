-- Create email automation system for training

-- Email automation table
CREATE TABLE public.email_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('training_assigned', 'training_due_soon', 'training_overdue', 'training_completed', 'welcome_new_employee')),
  delay_hours INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  template_type TEXT NOT NULL DEFAULT 'training_assignment',
  subject_template TEXT NOT NULL,
  body_template TEXT,
  send_to_learner BOOLEAN NOT NULL DEFAULT true,
  send_to_manager BOOLEAN NOT NULL DEFAULT false,
  send_to_admin BOOLEAN NOT NULL DEFAULT false,
  company_id UUID REFERENCES public.company_settings(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_sent_count INTEGER DEFAULT 0
);

-- Email automation logs for tracking
CREATE TABLE public.email_automation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID NOT NULL REFERENCES public.email_automations(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('learner', 'manager', 'admin')),
  trigger_data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_status TEXT NOT NULL DEFAULT 'sent' CHECK (email_status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  email_id TEXT,
  error_message TEXT,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- Email automation queue for delayed sending
CREATE TABLE public.email_automation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID NOT NULL REFERENCES public.email_automations(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_type TEXT NOT NULL,
  trigger_data JSONB NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_automation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_automations
CREATE POLICY "Company admins can manage their email automations" 
ON public.email_automations 
FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Super admins can manage all email automations" 
ON public.email_automations 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for email_automation_logs
CREATE POLICY "Company users can view their automation logs" 
ON public.email_automation_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.email_automations ea 
    WHERE ea.id = email_automation_logs.automation_id 
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, ea.company_id) 
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "System can insert automation logs" 
ON public.email_automation_logs 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for email_automation_queue
CREATE POLICY "Company users can view their automation queue" 
ON public.email_automation_queue 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.email_automations ea 
    WHERE ea.id = email_automation_queue.automation_id 
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, ea.company_id) 
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

CREATE POLICY "System can manage automation queue" 
ON public.email_automation_queue 
FOR ALL 
USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_email_automations_updated_at
BEFORE UPDATE ON public.email_automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_email_automations_trigger_type ON public.email_automations(trigger_type);
CREATE INDEX idx_email_automations_company_id ON public.email_automations(company_id);
CREATE INDEX idx_email_automation_queue_scheduled_for ON public.email_automation_queue(scheduled_for);
CREATE INDEX idx_email_automation_queue_status ON public.email_automation_queue(status);
CREATE INDEX idx_email_automation_logs_automation_id ON public.email_automation_logs(automation_id);

-- Insert default email automations
INSERT INTO public.email_automations (name, trigger_type, delay_hours, subject_template, template_type, send_to_learner, send_to_manager) VALUES
('Training Assignment Notification', 'training_assigned', 0, 'New Training Assignment: {{training_name}}', 'training_assignment', true, false),
('Training Due Reminder', 'training_due_soon', 0, 'Reminder: {{training_name}} due in {{days_until_due}} days', 'training_reminder', true, false),
('Overdue Training Alert', 'training_overdue', 24, 'OVERDUE: {{training_name}} - Action Required', 'training_reminder', true, true),
('Training Completion Certificate', 'training_completed', 0, 'Congratulations! You completed {{training_name}}', 'completion_certificate', true, false),
('Welcome New Employee', 'welcome_new_employee', 2, 'Welcome to {{company_name}} - Your Training Journey Begins', 'welcome_email', true, false);