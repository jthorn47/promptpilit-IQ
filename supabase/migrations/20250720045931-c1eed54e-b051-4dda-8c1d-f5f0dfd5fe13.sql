
-- Enhance pay_types table with missing fields for comprehensive earnings management
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS gl_code TEXT;
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS show_on_pay_stub BOOLEAN DEFAULT true;
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS include_in_overtime_calculation BOOLEAN DEFAULT false;
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS employer_match_percentage NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS per_check_limit NUMERIC(12,2);
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS annual_limit NUMERIC(12,2);
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS calculation_method TEXT DEFAULT 'flat_amount';
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS deduction_schedule TEXT DEFAULT 'every_check';
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS is_reimbursable BOOLEAN DEFAULT false;
ALTER TABLE public.pay_types ADD COLUMN IF NOT EXISTS w2_reporting_code TEXT;

-- Create comprehensive deduction_definitions table
CREATE TABLE IF NOT EXISTS public.deduction_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  deduction_type TEXT NOT NULL CHECK (deduction_type IN ('pre_tax', 'post_tax', 'garnishment')),
  calculation_method TEXT NOT NULL DEFAULT 'flat_amount' CHECK (calculation_method IN ('flat_amount', 'percentage', 'custom_formula')),
  default_amount NUMERIC(12,2) DEFAULT 0,
  percentage_rate NUMERIC(5,4) DEFAULT 0,
  custom_formula TEXT,
  is_employer_paid BOOLEAN DEFAULT false,
  is_employee_paid BOOLEAN DEFAULT true,
  employer_match_percentage NUMERIC(5,2) DEFAULT 0,
  per_check_limit NUMERIC(12,2),
  annual_limit NUMERIC(12,2),
  deduction_schedule TEXT DEFAULT 'every_check' CHECK (deduction_schedule IN ('every_check', 'first_of_month', 'bi_weekly', 'monthly')),
  is_taxable BOOLEAN DEFAULT true,
  is_reimbursable BOOLEAN DEFAULT false,
  show_on_pay_stub BOOLEAN DEFAULT true,
  w2_reporting_code TEXT,
  gl_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(company_id, code)
);

-- Create client-specific earnings configuration table
CREATE TABLE IF NOT EXISTS public.client_earnings_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  pay_type_id UUID NOT NULL REFERENCES public.pay_types(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  custom_amount NUMERIC(12,2),
  custom_rate NUMERIC(12,4),
  department_codes TEXT[],
  cost_center_codes TEXT[],
  job_codes TEXT[],
  effective_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, pay_type_id)
);

-- Create client-specific deductions configuration table
CREATE TABLE IF NOT EXISTS public.client_deductions_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  deduction_id UUID NOT NULL REFERENCES public.deduction_definitions(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  custom_amount NUMERIC(12,2),
  custom_percentage NUMERIC(5,4),
  custom_formula TEXT,
  department_codes TEXT[],
  cost_center_codes TEXT[],
  job_codes TEXT[],
  effective_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, deduction_id)
);

-- Enable RLS on new tables
ALTER TABLE public.deduction_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_earnings_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_deductions_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deduction_definitions
CREATE POLICY "Company admins can manage deduction definitions"
  ON public.deduction_definitions
  FOR ALL
  USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id)
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );

-- RLS Policies for client_earnings_config
CREATE POLICY "Company admins can manage client earnings config"
  ON public.client_earnings_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.company_settings cs 
      WHERE cs.id = client_earnings_config.client_id 
      AND (has_company_role(auth.uid(), 'company_admin'::app_role, cs.id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_settings cs 
      WHERE cs.id = client_earnings_config.client_id 
      AND (has_company_role(auth.uid(), 'company_admin'::app_role, cs.id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

-- RLS Policies for client_deductions_config
CREATE POLICY "Company admins can manage client deductions config"
  ON public.client_deductions_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.company_settings cs 
      WHERE cs.id = client_deductions_config.client_id 
      AND (has_company_role(auth.uid(), 'company_admin'::app_role, cs.id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.company_settings cs 
      WHERE cs.id = client_deductions_config.client_id 
      AND (has_company_role(auth.uid(), 'company_admin'::app_role, cs.id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_deduction_definitions_updated_at
  BEFORE UPDATE ON public.deduction_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payroll_updated_at_column();

CREATE TRIGGER update_client_earnings_config_updated_at
  BEFORE UPDATE ON public.client_earnings_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payroll_updated_at_column();

CREATE TRIGGER update_client_deductions_config_updated_at
  BEFORE UPDATE ON public.client_deductions_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payroll_updated_at_column();

-- Create audit logging function for earnings and deductions changes
CREATE OR REPLACE FUNCTION public.log_payroll_config_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    company_id,
    action_type,
    resource_type,
    resource_id,
    old_values,
    new_values,
    details
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.company_id, OLD.company_id),
    CASE TG_OP
      WHEN 'INSERT' THEN 'created'
      WHEN 'UPDATE' THEN 'updated'
      WHEN 'DELETE' THEN 'deleted'
    END,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    CASE TG_OP
      WHEN 'INSERT' THEN 'Created new ' || TG_TABLE_NAME
      WHEN 'UPDATE' THEN 'Updated ' || TG_TABLE_NAME
      WHEN 'DELETE' THEN 'Deleted ' || TG_TABLE_NAME
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers
CREATE TRIGGER audit_pay_types_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.pay_types
  FOR EACH ROW EXECUTE FUNCTION public.log_payroll_config_changes();

CREATE TRIGGER audit_deduction_definitions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.deduction_definitions
  FOR EACH ROW EXECUTE FUNCTION public.log_payroll_config_changes();

CREATE TRIGGER audit_client_earnings_config_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.client_earnings_config
  FOR EACH ROW EXECUTE FUNCTION public.log_payroll_config_changes();

CREATE TRIGGER audit_client_deductions_config_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.client_deductions_config
  FOR EACH ROW EXECUTE FUNCTION public.log_payroll_config_changes();
