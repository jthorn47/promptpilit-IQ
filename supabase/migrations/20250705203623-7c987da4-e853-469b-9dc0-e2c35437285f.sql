-- Phase 2: Activity & Task Management

-- Activities table for tracking all interactions
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- call, email, meeting, demo, proposal, note, etc.
  subject TEXT NOT NULL,
  description TEXT,
  contact_name TEXT,
  contact_email TEXT,
  lead_id UUID REFERENCES public.leads(id),
  deal_id UUID REFERENCES public.deals(id),
  company_id UUID REFERENCES public.company_settings(id),
  assigned_to UUID NOT NULL, -- who is responsible
  created_by UUID NOT NULL, -- who logged this activity
  duration_minutes INTEGER DEFAULT 0,
  outcome TEXT, -- result of the activity
  next_steps TEXT, -- what to do next
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT NOT NULL DEFAULT 'completed', -- completed, scheduled, cancelled
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tasks table for follow-ups and reminders
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'follow_up', -- follow_up, call, email, meeting, demo, proposal
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  assigned_to UUID NOT NULL,
  created_by UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id),
  deal_id UUID REFERENCES public.deals(id),
  company_id UUID REFERENCES public.company_settings(id),
  contact_name TEXT,
  contact_email TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  reminder_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activity templates for common activities
CREATE TABLE public.activity_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  description_template TEXT,
  default_duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default activity templates
INSERT INTO public.activity_templates (name, type, subject_template, description_template, default_duration_minutes, created_by) VALUES
('Discovery Call', 'call', 'Discovery call with {{contact_name}} at {{company_name}}', 'Initial discovery call to understand needs and challenges', 30, '00000000-0000-0000-0000-000000000000'),
('Demo Presentation', 'demo', 'Product demo for {{company_name}}', 'Demonstrate key features and capabilities', 60, '00000000-0000-0000-0000-000000000000'),
('Follow-up Email', 'email', 'Follow-up with {{contact_name}}', 'Send follow-up email after previous interaction', 15, '00000000-0000-0000-0000-000000000000'),
('Proposal Review', 'meeting', 'Proposal review meeting with {{company_name}}', 'Review and discuss proposal details', 45, '00000000-0000-0000-0000-000000000000'),
('Contract Negotiation', 'meeting', 'Contract negotiation with {{company_name}}', 'Negotiate contract terms and pricing', 60, '00000000-0000-0000-0000-000000000000'),
('Onboarding Call', 'call', 'Onboarding call with {{company_name}}', 'Welcome new client and setup initial requirements', 45, '00000000-0000-0000-0000-000000000000');

-- Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activities
CREATE POLICY "Sales reps can view all activities" 
ON public.activities FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Sales reps can manage activities" 
ON public.activities FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for tasks
CREATE POLICY "Sales reps can view all tasks" 
ON public.tasks FOR SELECT 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Sales reps can manage tasks" 
ON public.tasks FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for activity templates
CREATE POLICY "Authenticated users can view activity templates" 
ON public.activity_templates FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Sales reps can manage activity templates" 
ON public.activity_templates FOR ALL 
USING (has_role(auth.uid(), 'sales_rep'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create updated_at triggers
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_templates_updated_at
  BEFORE UPDATE ON public.activity_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_activities_assigned_to ON public.activities(assigned_to);
CREATE INDEX idx_activities_scheduled_at ON public.activities(scheduled_at);
CREATE INDEX idx_activities_deal_id ON public.activities(deal_id);
CREATE INDEX idx_activities_lead_id ON public.activities(lead_id);

CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_deal_id ON public.tasks(deal_id);
CREATE INDEX idx_tasks_lead_id ON public.tasks(lead_id);