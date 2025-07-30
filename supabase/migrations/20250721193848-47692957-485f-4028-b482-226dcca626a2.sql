-- Create only the missing tax tables (skip if they already exist)

-- Create tax change alerts table (if not exists)
CREATE TABLE IF NOT EXISTS public.tax_change_alerts (
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

-- Create tax monitoring log table (if not exists)
CREATE TABLE IF NOT EXISTS public.tax_monitoring_log (
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

-- Create employee YTD wages table (if not exists)
CREATE TABLE IF NOT EXISTS public.employee_ytd_wages (
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

-- Enable RLS on new tables (if they don't already have it)
ALTER TABLE public.tax_change_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_monitoring_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_ytd_wages ENABLE ROW LEVEL SECURITY;

-- Create policies (only if they don't exist)
DO $$
BEGIN
  -- Tax alerts policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tax_change_alerts' AND policyname = 'Super admins can manage tax alerts') THEN
    CREATE POLICY "Super admins can manage tax alerts" 
    ON public.tax_change_alerts FOR ALL 
    USING (has_role(auth.uid(), 'super_admin'::app_role));
  END IF;
  
  -- Tax monitoring policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tax_monitoring_log' AND policyname = 'Super admins can manage tax monitoring') THEN
    CREATE POLICY "Super admins can manage tax monitoring" 
    ON public.tax_monitoring_log FOR ALL 
    USING (has_role(auth.uid(), 'super_admin'::app_role));
  END IF;
  
  -- YTD wages policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employee_ytd_wages' AND policyname = 'Company admins can manage YTD wages') THEN
    CREATE POLICY "Company admins can manage YTD wages" 
    ON public.employee_ytd_wages FOR ALL 
    USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));
  END IF;
END $$;