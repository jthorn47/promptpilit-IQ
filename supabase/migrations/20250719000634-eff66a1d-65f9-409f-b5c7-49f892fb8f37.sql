-- Create payroll reports table for storing generated reports
CREATE TABLE IF NOT EXISTS public.payroll_reports (
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
CREATE TABLE IF NOT EXISTS public.payroll_export_logs (
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

-- Enable Row Level Security (safe with IF NOT EXISTS)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payroll_reports'
  ) THEN
    ALTER TABLE public.payroll_reports ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Company admins can manage payroll reports" 
    ON public.payroll_reports FOR ALL 
    USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payroll_export_logs'
  ) THEN
    ALTER TABLE public.payroll_export_logs ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Company admins can view export logs" 
    ON public.payroll_export_logs FOR SELECT 
    USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

    CREATE POLICY "System can insert export logs" 
    ON public.payroll_export_logs FOR INSERT 
    WITH CHECK (true);
  END IF;
END $$;

-- Create indexes for better performance (with IF NOT EXISTS equivalent)
CREATE INDEX IF NOT EXISTS idx_payroll_reports_company_id ON public.payroll_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_payroll_reports_type ON public.payroll_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_payroll_export_logs_company_id ON public.payroll_export_logs(company_id);

-- Create updated_at trigger for payroll_reports (with check to avoid duplicate)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_payroll_reports_updated_at'
  ) THEN
    CREATE TRIGGER update_payroll_reports_updated_at
      BEFORE UPDATE ON public.payroll_reports
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;