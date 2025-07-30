-- Create payroll reports table for storing generated reports
CREATE TABLE public.payroll_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  report_data JSONB NOT NULL DEFAULT '{}',
  filters JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll export logs table for tracking exports
CREATE TABLE public.payroll_export_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  report_type TEXT NOT NULL,
  export_format TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  exported_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll audit trail table for tracking changes
CREATE TABLE public.payroll_audit_trail (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  performed_by UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payroll_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_audit_trail ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payroll_reports
CREATE POLICY "Company admins can manage payroll reports" 
ON public.payroll_reports FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for payroll_export_logs
CREATE POLICY "Company admins can view export logs" 
ON public.payroll_export_logs FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert export logs" 
ON public.payroll_export_logs FOR INSERT 
WITH CHECK (true);

-- RLS Policies for payroll_audit_trail
CREATE POLICY "Company admins can view audit trail" 
ON public.payroll_audit_trail FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert audit trail" 
ON public.payroll_audit_trail FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_payroll_reports_company_id ON public.payroll_reports(company_id);
CREATE INDEX idx_payroll_reports_type ON public.payroll_reports(report_type);
CREATE INDEX idx_payroll_export_logs_company_id ON public.payroll_export_logs(company_id);
CREATE INDEX idx_payroll_audit_trail_company_id ON public.payroll_audit_trail(company_id);
CREATE INDEX idx_payroll_audit_trail_resource ON public.payroll_audit_trail(resource_type, resource_id);

-- Create updated_at trigger for payroll_reports
CREATE TRIGGER update_payroll_reports_updated_at
  BEFORE UPDATE ON public.payroll_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();