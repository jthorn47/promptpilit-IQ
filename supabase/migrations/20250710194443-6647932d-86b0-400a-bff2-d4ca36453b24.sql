-- Create comprehensive reporting system tables

-- Table to store saved report configurations
CREATE TABLE public.saved_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  data_source TEXT NOT NULL, -- 'payroll', 'employees', 'time_tracking', 'benefits'
  report_config JSONB NOT NULL DEFAULT '{}', -- stores filters, columns, grouping, etc.
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for scheduled reports
CREATE TABLE public.report_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  saved_report_id UUID REFERENCES public.saved_reports(id) ON DELETE CASCADE,
  schedule_frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
  schedule_time TIME WITHOUT TIME ZONE DEFAULT '09:00:00',
  schedule_day_of_week INTEGER, -- 0-6 for weekly
  schedule_day_of_month INTEGER, -- 1-31 for monthly
  email_recipients TEXT[] DEFAULT '{}',
  email_subject TEXT,
  email_message TEXT,
  export_format TEXT DEFAULT 'excel', -- 'excel', 'pdf', 'csv'
  is_active BOOLEAN DEFAULT true,
  next_generation_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track report executions
CREATE TABLE public.report_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  saved_report_id UUID REFERENCES public.saved_reports(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.report_schedules(id) ON DELETE SET NULL,
  executed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  execution_type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'scheduled'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  error_message TEXT,
  file_path TEXT,
  recipient_emails TEXT[],
  execution_time_ms INTEGER,
  record_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Table for report alerts and notifications
CREATE TABLE public.report_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  data_source TEXT NOT NULL,
  alert_conditions JSONB NOT NULL DEFAULT '{}', -- threshold conditions
  notification_recipients TEXT[] DEFAULT '{}',
  notification_methods TEXT[] DEFAULT '{"email"}', -- 'email', 'in_app'
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_reports
CREATE POLICY "Users can view their company reports" ON public.saved_reports
FOR SELECT USING (
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  is_template = true
);

CREATE POLICY "Company admins can manage reports" ON public.saved_reports
FOR ALL USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND 
  (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "Users can create reports for their company" ON public.saved_reports
FOR INSERT WITH CHECK (
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for report_schedules
CREATE POLICY "Users can view their company schedules" ON public.report_schedules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.saved_reports sr 
    WHERE sr.id = report_schedules.saved_report_id 
    AND (sr.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

CREATE POLICY "Company admins can manage schedules" ON public.report_schedules
FOR ALL USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.saved_reports sr 
    WHERE sr.id = report_schedules.saved_report_id 
    AND (sr.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

-- RLS Policies for report_executions
CREATE POLICY "Users can view their company executions" ON public.report_executions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.saved_reports sr 
    WHERE sr.id = report_executions.saved_report_id 
    AND (sr.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

CREATE POLICY "System can insert executions" ON public.report_executions
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update executions" ON public.report_executions
FOR UPDATE USING (true);

-- RLS Policies for report_alerts
CREATE POLICY "Users can view their company alerts" ON public.report_alerts
FOR SELECT USING (
  company_id = get_user_company_id(auth.uid()) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage alerts" ON public.report_alerts
FOR ALL USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND 
  (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role))
);

-- Add triggers for updated_at
CREATE TRIGGER update_saved_reports_updated_at
BEFORE UPDATE ON public.saved_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at
BEFORE UPDATE ON public.report_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_alerts_updated_at
BEFORE UPDATE ON public.report_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add next generation date trigger for schedules
CREATE TRIGGER update_schedule_next_generation
BEFORE INSERT OR UPDATE ON public.report_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_next_generation_date();