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

-- Create report templates table for reusable report structures
CREATE TABLE public.report_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  data_mapping JSONB NOT NULL DEFAULT '{}',
  report_structure JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
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
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
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

-- RLS Policies for report templates
CREATE POLICY "Users can view active templates" 
ON public.report_templates FOR SELECT 
USING (is_active = true AND (is_public = true OR created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "Admins can manage templates" 
ON public.report_templates FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for report notifications
CREATE POLICY "Users can view their notifications" 
ON public.report_notifications FOR SELECT 
USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their notifications" 
ON public.report_notifications FOR UPDATE 
USING (recipient_id = auth.uid());

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_reports_updated_at();

CREATE TRIGGER update_report_conversations_updated_at
BEFORE UPDATE ON public.report_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_reports_updated_at();

CREATE TRIGGER update_report_templates_updated_at
BEFORE UPDATE ON public.report_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_reports_updated_at();

-- Insert default report templates
INSERT INTO public.report_templates (name, description, category, questions, data_mapping, report_structure, is_active, is_public, created_by) 
VALUES 
(
  'Employee Analytics Report',
  'Comprehensive analysis of employee data including headcount, demographics, and performance metrics',
  'HR',
  '[
    {"id": 1, "question": "Which departments would you like to include in the analysis?", "type": "multi-select", "options": ["All", "HR", "Engineering", "Sales", "Marketing", "Finance"]},
    {"id": 2, "question": "What time period should this report cover?", "type": "select", "options": ["Last 30 days", "Last 90 days", "Last 6 months", "Last year", "All time"]},
    {"id": 3, "question": "Which metrics are most important for your analysis?", "type": "multi-select", "options": ["Headcount", "Turnover rate", "New hires", "Department distribution", "Performance ratings"]}
  ]',
  '{"employee_data": "employees", "department_data": "departments", "performance_data": "performance_reviews"}',
  '{"sections": ["executive_summary", "key_metrics", "department_analysis", "trends", "recommendations"]}'::jsonb,
  true,
  true,
  '63767eb-d0bc-4262-8137-0c02167807231'
),
(
  'Payroll Summary Report', 
  'Detailed payroll analysis including costs, distributions, and compliance metrics',
  'Payroll',
  '[
    {"id": 1, "question": "Which pay period would you like to analyze?", "type": "select", "options": ["Current period", "Last pay period", "Last quarter", "Year to date"]},
    {"id": 2, "question": "Do you want to include overtime analysis?", "type": "yes_no"},
    {"id": 3, "question": "Should we include benefits costs in the analysis?", "type": "yes_no"},
    {"id": 4, "question": "Which cost breakdowns are important?", "type": "multi-select", "options": ["By department", "By employee type", "By pay grade", "By location"]}
  ]',
  '{"payroll_data": "pay_stubs", "employee_data": "employees", "benefits_data": "employee_benefits"}',
  '{"sections": ["executive_summary", "total_costs", "department_breakdown", "compliance_status", "recommendations"]}'::jsonb,
  true,
  true,
  '63767eb-d0bc-4262-8137-0c02167807231'
);