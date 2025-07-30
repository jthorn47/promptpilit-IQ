
-- Phase 1: Create unified database schema for WageCheckIQ v1.1

-- Drop existing tables to migrate to unified structure
DROP TABLE IF EXISTS public.wage_compliance_checks;
DROP TABLE IF EXISTS public.minimum_salary_thresholds;
DROP TABLE IF EXISTS public.minimum_wage_rates;

-- Create unified wage_rules table
CREATE TABLE public.wage_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jurisdiction_level TEXT NOT NULL CHECK (jurisdiction_level IN ('federal', 'state', 'county', 'city')),
  jurisdiction_name TEXT NOT NULL,
  state_code TEXT,
  county_name TEXT,
  city_name TEXT,
  zip_codes TEXT[], -- Array of applicable ZIP codes
  effective_date DATE NOT NULL,
  expiration_date DATE,
  minimum_hourly NUMERIC(5,2),
  tipped_hourly NUMERIC(5,2),
  exempt_weekly NUMERIC(8,2),
  exempt_annual NUMERIC(10,2),
  industry TEXT, -- 'general', 'fast_food', 'hospitality', etc.
  employee_count_threshold INTEGER, -- For small business exceptions
  source_url TEXT,
  is_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create wage_data_sources table to track parsing jobs
CREATE TABLE public.wage_data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  jurisdiction_level TEXT NOT NULL,
  jurisdiction_name TEXT NOT NULL,
  last_parsed_at TIMESTAMP WITH TIME ZONE,
  next_parse_at TIMESTAMP WITH TIME ZONE,
  parse_frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
  is_active BOOLEAN DEFAULT true,
  parse_status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed'
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wage_override_history table for audit trails
CREATE TABLE public.wage_override_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wage_rule_id UUID NOT NULL REFERENCES public.wage_rules(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'deleted'
  old_values JSONB,
  new_values JSONB,
  override_reason TEXT,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create employee wage compliance checks table
CREATE TABLE public.employee_wage_compliance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  compliance_status TEXT NOT NULL, -- 'compliant', 'non_compliant', 'insufficient_data'
  wage_type TEXT NOT NULL, -- 'hourly', 'salary'
  applicable_jurisdiction TEXT,
  required_rate NUMERIC(10,2),
  actual_rate NUMERIC(10,2),
  gap_amount NUMERIC(10,2),
  wage_rule_id UUID REFERENCES public.wage_rules(id),
  violation_details JSONB,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wage_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wage_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wage_override_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_wage_compliance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view wage rules" 
ON public.wage_rules FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage wage rules" 
ON public.wage_rules FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage wage data sources" 
ON public.wage_data_sources FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view wage data sources" 
ON public.wage_data_sources FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can view override history" 
ON public.wage_override_history FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert override history" 
ON public.wage_override_history FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Company admins can manage employee compliance" 
ON public.employee_wage_compliance FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'company_admin'::app_role));

-- Add triggers for updated_at columns
CREATE TRIGGER update_wage_rules_updated_at
  BEFORE UPDATE ON public.wage_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wage_data_sources_updated_at
  BEFORE UPDATE ON public.wage_data_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_wage_compliance_updated_at
  BEFORE UPDATE ON public.employee_wage_compliance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_wage_rules_jurisdiction ON public.wage_rules(jurisdiction_level, jurisdiction_name, state_code);
CREATE INDEX idx_wage_rules_effective_date ON public.wage_rules(effective_date);
CREATE INDEX idx_wage_rules_active ON public.wage_rules(is_active);
CREATE INDEX idx_wage_data_sources_next_parse ON public.wage_data_sources(next_parse_at) WHERE is_active = true;
CREATE INDEX idx_employee_wage_compliance_employee ON public.employee_wage_compliance(employee_id);
CREATE INDEX idx_employee_wage_compliance_status ON public.employee_wage_compliance(compliance_status);

-- Insert initial federal wage data
INSERT INTO public.wage_rules (
  jurisdiction_level, jurisdiction_name, state_code, minimum_hourly, tipped_hourly, 
  exempt_weekly, exempt_annual, effective_date, source_url
) VALUES (
  'federal', 'United States', 'US', 7.25, 2.13, 684.00, 35568.00, '2020-01-01',
  'https://www.dol.gov/agencies/whd/mw-consolidated'
);

-- Insert California data
INSERT INTO public.wage_rules (
  jurisdiction_level, jurisdiction_name, state_code, minimum_hourly, 
  exempt_weekly, exempt_annual, effective_date, source_url
) VALUES (
  'state', 'California', 'CA', 16.00, 1280.00, 66560.00, '2024-01-01',
  'https://www.dir.ca.gov/dlse/faq_minimumwage.htm'
);

-- Insert initial data sources for automated parsing
INSERT INTO public.wage_data_sources (
  source_name, source_url, jurisdiction_level, jurisdiction_name, next_parse_at
) VALUES 
('Federal DOL', 'https://www.dol.gov/agencies/whd/mw-consolidated', 'federal', 'United States', now() + interval '1 day'),
('California DIR', 'https://www.dir.ca.gov/dlse/faq_minimumwage.htm', 'state', 'California', now() + interval '1 day'),
('New York DOL', 'https://dol.ny.gov/minimum-wage', 'state', 'New York', now() + interval '1 day'),
('Washington LNI', 'https://www.lni.wa.gov/wages/minimum-wage/', 'state', 'Washington', now() + interval '1 day'),
('Oregon BOLI', 'https://www.oregon.gov/boli/workers/pages/minimum-wage.aspx', 'state', 'Oregon', now() + interval '1 day'),
('Illinois IDES', 'https://www.ides.illinois.gov', 'state', 'Illinois', now() + interval '1 day');
