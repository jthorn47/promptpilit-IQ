-- Create tax-related tables for TaxIQ system

-- Federal tax brackets table
CREATE TABLE public.federal_tax_brackets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  filing_status TEXT NOT NULL,
  min_income NUMERIC NOT NULL,
  max_income NUMERIC NOT NULL,
  rate NUMERIC NOT NULL,
  base_amount NUMERIC NOT NULL DEFAULT 0,
  jurisdiction TEXT NOT NULL DEFAULT 'federal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- State tax brackets table
CREATE TABLE public.state_tax_brackets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  state TEXT NOT NULL,
  filing_status TEXT NOT NULL,
  min_income NUMERIC NOT NULL,
  max_income NUMERIC NOT NULL,
  rate NUMERIC NOT NULL,
  base_amount NUMERIC NOT NULL DEFAULT 0,
  jurisdiction TEXT NOT NULL DEFAULT 'state',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee YTD wages tracking
CREATE TABLE public.employee_ytd_wages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  ytd_gross NUMERIC NOT NULL DEFAULT 0,
  ytd_federal_withholding NUMERIC NOT NULL DEFAULT 0,
  ytd_social_security NUMERIC NOT NULL DEFAULT 0,
  ytd_medicare NUMERIC NOT NULL DEFAULT 0,
  ytd_state_withholding NUMERIC NOT NULL DEFAULT 0,
  ytd_sdi NUMERIC NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, year)
);

-- Tax change alerts table
CREATE TABLE public.tax_change_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  change_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  change_details JSONB DEFAULT '{}',
  effective_date DATE,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tax monitoring log table
CREATE TABLE public.tax_monitoring_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  monitor_type TEXT NOT NULL,
  status TEXT NOT NULL,
  changes_detected INTEGER DEFAULT 0,
  last_checked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_check TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  monitoring_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.federal_tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.state_tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_ytd_wages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_change_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_monitoring_log ENABLE ROW LEVEL SECURITY;

-- Create policies for tax brackets (readable by authenticated users)
CREATE POLICY "Tax brackets are viewable by authenticated users" 
ON public.federal_tax_brackets FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Tax brackets are viewable by authenticated users" 
ON public.state_tax_brackets FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create policies for YTD wages (company admins only)
CREATE POLICY "Company admins can manage YTD wages" 
ON public.employee_ytd_wages FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Create policies for tax alerts (super admins only)
CREATE POLICY "Super admins can manage tax alerts" 
ON public.tax_change_alerts FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage tax monitoring" 
ON public.tax_monitoring_log FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add triggers for updated_at columns
CREATE TRIGGER update_federal_tax_brackets_updated_at
  BEFORE UPDATE ON public.federal_tax_brackets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_state_tax_brackets_updated_at
  BEFORE UPDATE ON public.state_tax_brackets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_ytd_wages_updated_at
  BEFORE UPDATE ON public.employee_ytd_wages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_change_alerts_updated_at
  BEFORE UPDATE ON public.tax_change_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_monitoring_log_updated_at
  BEFORE UPDATE ON public.tax_monitoring_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample 2024 federal tax brackets for single filers
INSERT INTO public.federal_tax_brackets (year, filing_status, min_income, max_income, rate, base_amount) VALUES
(2024, 'single', 0, 11000, 0.10, 0),
(2024, 'single', 11000, 44725, 0.12, 1100),
(2024, 'single', 44725, 95375, 0.22, 5147),
(2024, 'single', 95375, 197050, 0.24, 16290),
(2024, 'single', 197050, 250525, 0.32, 40594),
(2024, 'single', 250525, 609350, 0.35, 57706),
(2024, 'single', 609350, 999999999, 0.37, 183647);

-- Insert sample 2024 California tax brackets for single filers
INSERT INTO public.state_tax_brackets (year, state, filing_status, min_income, max_income, rate, base_amount) VALUES
(2024, 'CA', 'single', 0, 10099, 0.01, 0),
(2024, 'CA', 'single', 10099, 23942, 0.02, 100.99),
(2024, 'CA', 'single', 23942, 37788, 0.04, 377.85),
(2024, 'CA', 'single', 37788, 52455, 0.06, 931.69),
(2024, 'CA', 'single', 52455, 66295, 0.08, 1811.71),
(2024, 'CA', 'single', 66295, 338639, 0.093, 2918.91),
(2024, 'CA', 'single', 338639, 406364, 0.103, 28247.01),
(2024, 'CA', 'single', 406364, 677275, 0.113, 35220.68),
(2024, 'CA', 'single', 677275, 1000000, 0.123, 65814.63),
(2024, 'CA', 'single', 1000000, 999999999, 0.133, 105549.39);