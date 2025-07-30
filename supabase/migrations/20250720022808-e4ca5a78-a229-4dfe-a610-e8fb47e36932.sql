
-- Create benefit_plan_assignments table to link global plans to clients
CREATE TABLE IF NOT EXISTS public.benefit_plan_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_template_id UUID NOT NULL,
  client_id UUID NOT NULL,
  effective_date DATE NOT NULL,
  termination_date DATE,
  locked_fields TEXT[] DEFAULT '{}',
  custom_settings JSONB DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'global' CHECK (source IN ('global', 'local')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  assigned_by UUID,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(plan_template_id, client_id)
);

-- Create benefit_plan_templates table (matching the types structure)
CREATE TABLE IF NOT EXISTS public.benefit_plan_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  carrier_id UUID NOT NULL,
  plan_type_code TEXT NOT NULL,
  rating_method TEXT NOT NULL CHECK (rating_method IN ('composite', 'age_banded', 'custom')),
  tier_structure TEXT[] DEFAULT '{}',
  eligibility_rule_id UUID,
  lock_fields TEXT[] DEFAULT '{}',
  documents TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create benefit_carriers table
CREATE TABLE IF NOT EXISTS public.benefit_carriers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('medical', 'dental', 'vision', 'life', 'disability', 'hsa', 'fsa', 'other')),
  contact_info JSONB DEFAULT '{}',
  edi_settings JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create benefit_plan_types table
CREATE TABLE IF NOT EXISTS public.benefit_plan_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create benefit_eligibility_rules table
CREATE TABLE IF NOT EXISTS public.benefit_eligibility_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  waiting_period_days INTEGER NOT NULL DEFAULT 0,
  min_hours_per_week INTEGER NOT NULL DEFAULT 0,
  rehire_reset_period INTEGER NOT NULL DEFAULT 0,
  measurement_method TEXT NOT NULL DEFAULT 'monthly' CHECK (measurement_method IN ('monthly', 'lookback')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create benefit_audit_logs table
CREATE TABLE IF NOT EXISTS public.benefit_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('carrier', 'plan_type', 'plan_template', 'eligibility_rule', 'deduction_code', 'document', 'plan_assignment')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'assign', 'unassign')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID NOT NULL,
  user_email TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.benefit_plan_assignments
ADD CONSTRAINT fk_plan_assignments_template FOREIGN KEY (plan_template_id) REFERENCES public.benefit_plan_templates(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_plan_assignments_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

ALTER TABLE public.benefit_plan_templates
ADD CONSTRAINT fk_plan_templates_carrier FOREIGN KEY (carrier_id) REFERENCES public.benefit_carriers(id),
ADD CONSTRAINT fk_plan_templates_eligibility FOREIGN KEY (eligibility_rule_id) REFERENCES public.benefit_eligibility_rules(id);

-- Enable RLS on all tables
ALTER TABLE public.benefit_plan_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_plan_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for benefit_plan_assignments
CREATE POLICY "Company admins can manage their client plan assignments"
ON public.benefit_plan_assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = benefit_plan_assignments.client_id
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, c.company_settings_id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

-- RLS Policies for benefit_plan_templates
CREATE POLICY "Super admins can manage plan templates"
ON public.benefit_plan_templates
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view active plan templates"
ON public.benefit_plan_templates
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS Policies for benefit_carriers
CREATE POLICY "Super admins can manage carriers"
ON public.benefit_carriers
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view carriers"
ON public.benefit_carriers
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS Policies for benefit_plan_types
CREATE POLICY "Authenticated users can view plan types"
ON public.benefit_plan_types
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage plan types"
ON public.benefit_plan_types
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for benefit_eligibility_rules
CREATE POLICY "Super admins can manage eligibility rules"
ON public.benefit_eligibility_rules
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view eligibility rules"
ON public.benefit_eligibility_rules
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS Policies for benefit_audit_logs
CREATE POLICY "Super admins can view all benefit audit logs"
ON public.benefit_audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can view their benefit audit logs"
ON public.benefit_audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.benefit_plan_assignments bpa
    JOIN public.clients c ON c.id = bpa.client_id
    WHERE bpa.id::text = benefit_audit_logs.entity_id::text
    AND has_company_role(auth.uid(), 'company_admin'::app_role, c.company_settings_id)
  )
);

CREATE POLICY "System can insert benefit audit logs"
ON public.benefit_audit_logs
FOR INSERT
WITH CHECK (true);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_benefit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_benefit_plan_assignments_updated_at
    BEFORE UPDATE ON public.benefit_plan_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_benefit_updated_at();

CREATE TRIGGER update_benefit_plan_templates_updated_at
    BEFORE UPDATE ON public.benefit_plan_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_benefit_updated_at();

CREATE TRIGGER update_benefit_carriers_updated_at
    BEFORE UPDATE ON public.benefit_carriers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_benefit_updated_at();

CREATE TRIGGER update_benefit_eligibility_rules_updated_at
    BEFORE UPDATE ON public.benefit_eligibility_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_benefit_updated_at();

-- Enable realtime for plan assignments
ALTER TABLE public.benefit_plan_assignments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.benefit_plan_assignments;

-- Insert some sample data for plan types
INSERT INTO public.benefit_plan_types (category, subcategory, code, description) VALUES
('medical', 'health', 'HMO', 'Health Maintenance Organization'),
('medical', 'health', 'PPO', 'Preferred Provider Organization'),
('medical', 'health', 'HDHP', 'High Deductible Health Plan'),
('dental', 'preventive', 'DENTAL_BASIC', 'Basic Dental Coverage'),
('dental', 'comprehensive', 'DENTAL_PREMIUM', 'Premium Dental Coverage'),
('vision', 'basic', 'VISION_BASIC', 'Basic Vision Coverage'),
('life', 'term', 'LIFE_TERM', 'Term Life Insurance'),
('disability', 'short_term', 'STD', 'Short Term Disability'),
('disability', 'long_term', 'LTD', 'Long Term Disability')
ON CONFLICT (code) DO NOTHING;
