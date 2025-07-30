-- Create enum for billing types
CREATE TYPE public.propgen_billing_type AS ENUM (
  'flat_fee_onetime',
  'flat_fee_recurring', 
  'per_employee',
  'pepm',
  'percentage_payroll'
);

-- Create master table for additional fee templates
CREATE TABLE public.propgen_additional_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fee_name TEXT NOT NULL,
  description TEXT,
  default_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  billing_type public.propgen_billing_type NOT NULL DEFAULT 'flat_fee_onetime',
  default_inclusion BOOLEAN NOT NULL DEFAULT false,
  editable_at_company_level BOOLEAN NOT NULL DEFAULT true,
  display_in_proposal BOOLEAN NOT NULL DEFAULT true,
  include_in_roi_calculation BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create company-specific additional fees overrides
CREATE TABLE public.propgen_company_additional_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  additional_fee_id UUID NOT NULL REFERENCES public.propgen_additional_fees(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.propgen_workflows(id) ON DELETE CASCADE,
  is_included BOOLEAN NOT NULL DEFAULT false,
  custom_cost NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, additional_fee_id, workflow_id)
);

-- Enable RLS
ALTER TABLE public.propgen_additional_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propgen_company_additional_fees ENABLE ROW LEVEL SECURITY;

-- RLS policies for propgen_additional_fees
CREATE POLICY "Super admins can manage additional fees"
  ON public.propgen_additional_fees
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can view additional fees"
  ON public.propgen_additional_fees
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS policies for propgen_company_additional_fees
CREATE POLICY "Company admins can manage their company additional fees"
  ON public.propgen_company_additional_fees
  FOR ALL
  TO authenticated
  USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Create indexes for performance
CREATE INDEX idx_propgen_additional_fees_active ON public.propgen_additional_fees(is_active, sort_order);
CREATE INDEX idx_propgen_company_additional_fees_company ON public.propgen_company_additional_fees(company_id, workflow_id);
CREATE INDEX idx_propgen_company_additional_fees_fee ON public.propgen_company_additional_fees(additional_fee_id);

-- Create trigger for updated_at
CREATE TRIGGER update_propgen_additional_fees_updated_at
  BEFORE UPDATE ON public.propgen_additional_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_propgen_company_additional_fees_updated_at
  BEFORE UPDATE ON public.propgen_company_additional_fees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default additional fees
INSERT INTO public.propgen_additional_fees (fee_name, description, default_cost, billing_type, default_inclusion, sort_order) VALUES
('Drug Testing', 'Pre-employment and random drug testing services', 45.00, 'per_employee', false, 1),
('Training Programs', 'Comprehensive employee training and development', 125.00, 'per_employee', false, 2),
('Safety Posters', 'Mandatory workplace safety and compliance posters', 89.00, 'flat_fee_onetime', false, 3),
('Background Checks', 'Comprehensive background screening services', 35.00, 'per_employee', false, 4),
('Employee Handbook', 'Customized employee handbook and policies', 250.00, 'flat_fee_onetime', false, 5);