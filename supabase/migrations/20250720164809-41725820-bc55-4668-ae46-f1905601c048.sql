-- Create reports table for storing generated reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  report_content TEXT NOT NULL,
  report_type TEXT NOT NULL DEFAULT 'custom',
  category TEXT,
  created_by UUID NOT NULL,
  company_id UUID,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, pending_approval, approved, published
  is_template BOOLEAN NOT NULL DEFAULT false,
  template_config JSONB DEFAULT '{}',
  data_sources JSONB DEFAULT '[]',
  filters JSONB DEFAULT '{}',
  parameters JSONB DEFAULT '{}',
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report conversations table for multi-step report building
CREATE TABLE public.report_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  conversation_step INTEGER NOT NULL DEFAULT 1,
  question TEXT,
  answer TEXT,
  context_data JSONB DEFAULT '{}',
  is_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report notifications table for admin alerts
CREATE TABLE public.report_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- new_report, approval_request, published
  recipient_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports" 
ON public.reports FOR SELECT 
USING (created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can create reports" 
ON public.reports FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own reports" 
ON public.reports FOR UPDATE 
USING (created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can view all reports" 
ON public.reports FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for report conversations
CREATE POLICY "Users can manage their conversations" 
ON public.report_conversations FOR ALL 
USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for report notifications
CREATE POLICY "Users can view their notifications" 
ON public.report_notifications FOR SELECT 
USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their notifications" 
ON public.report_notifications FOR UPDATE 
USING (recipient_id = auth.uid());