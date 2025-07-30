-- Global Benefits Administration Microservices Schema
-- Service 1: Carrier Service
CREATE TYPE public.carrier_type AS ENUM ('medical', 'dental', 'vision', 'life', 'disability', 'hsa', 'fsa', 'other');

CREATE TABLE public.carriers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type carrier_type NOT NULL,
  contact_info JSONB NOT NULL DEFAULT '{}', -- {email, phone}
  edi_settings JSONB NOT NULL DEFAULT '{}', -- {format, transmissionMethod}
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service 2: Plan Type Service
CREATE TABLE public.plan_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service 3: Plan Template Service
CREATE TYPE public.rating_method AS ENUM ('composite', 'age_banded', 'custom');

CREATE TABLE public.plan_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  carrier_id UUID REFERENCES public.carriers(id),
  plan_type_code TEXT REFERENCES public.plan_types(code),
  rating_method rating_method NOT NULL DEFAULT 'composite',
  tier_structure JSONB NOT NULL DEFAULT '[]', -- ["Employee", "Employee + Spouse", ...]
  eligibility_rule_id UUID,
  lock_fields JSONB NOT NULL DEFAULT '[]', -- ["ratingMethod", "tiers"]
  documents JSONB NOT NULL DEFAULT '[]', -- [docId1, docId2]
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service 4: Eligibility Rule Service
CREATE TYPE public.measurement_method AS ENUM ('monthly', 'lookback');

CREATE TABLE public.eligibility_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  waiting_period_days INTEGER NOT NULL DEFAULT 0,
  min_hours_per_week INTEGER NOT NULL DEFAULT 30,
  rehire_reset_period INTEGER NOT NULL DEFAULT 90,
  measurement_method measurement_method NOT NULL DEFAULT 'monthly',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key reference for plan templates
ALTER TABLE public.plan_templates 
ADD CONSTRAINT fk_eligibility_rule 
FOREIGN KEY (eligibility_rule_id) REFERENCES public.eligibility_rules(id);

-- Service 5: Deduction Code Service
CREATE TABLE public.deduction_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  pre_tax BOOLEAN NOT NULL DEFAULT true,
  gl_code TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service 6: Document Service (shared)
CREATE TYPE public.document_type AS ENUM ('sbc', 'spd', 'plan_guide', 'certificate', 'form', 'other');

CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type document_type NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  description TEXT,
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service 7: Plan Assignment Service
CREATE TABLE public.plan_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.plan_templates(id),
  client_id UUID, -- References client from company_settings
  effective_date DATE NOT NULL,
  termination_date DATE,
  locked_fields JSONB NOT NULL DEFAULT '[]',
  custom_settings JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plan_id, client_id, effective_date)
);

-- Service 8: Audit Log Service (shared)
CREATE TYPE public.audit_action AS ENUM ('create', 'update', 'delete', 'assign', 'unassign');
CREATE TYPE public.audit_entity AS ENUM ('carrier', 'plan_type', 'plan_template', 'eligibility_rule', 'deduction_code', 'document', 'plan_assignment');

CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type audit_entity NOT NULL,
  entity_id UUID NOT NULL,
  action audit_action NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deduction_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Super Admins (full access)
CREATE POLICY "Super admins can manage carriers" ON public.carriers FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'));

CREATE POLICY "Super admins can manage plan types" ON public.plan_types FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'));

CREATE POLICY "Super admins can manage plan templates" ON public.plan_templates FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'));

CREATE POLICY "Super admins can manage eligibility rules" ON public.eligibility_rules FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'));

CREATE POLICY "Super admins can manage deduction codes" ON public.deduction_codes FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'));

CREATE POLICY "Super admins can manage documents" ON public.documents FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'));

CREATE POLICY "Super admins can manage plan assignments" ON public.plan_assignments FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'));

CREATE POLICY "Super admins can view audit logs" ON public.audit_logs FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'));

-- Company Admin policies (limited to their company)
CREATE POLICY "Company admins can view plan assignments for their company" ON public.plan_assignments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'company_admin'
    AND ur.company_id = plan_assignments.client_id
  )
);

-- Insert default plan types
INSERT INTO public.plan_types (category, subcategory, code, description) VALUES
('Medical', 'PPO', 'medical_ppo', 'Preferred Provider Organization'),
('Medical', 'HMO', 'medical_hmo', 'Health Maintenance Organization'),
('Medical', 'EPO', 'medical_epo', 'Exclusive Provider Organization'),
('Medical', 'HDHP', 'medical_hdhp', 'High Deductible Health Plan'),
('Dental', 'PPO', 'dental_ppo', 'Dental PPO'),
('Dental', 'HMO', 'dental_hmo', 'Dental HMO'),
('Vision', 'Standard', 'vision_standard', 'Vision Plan'),
('Life', 'Basic', 'life_basic', 'Basic Life Insurance'),
('Life', 'Voluntary', 'life_voluntary', 'Voluntary Life Insurance'),
('Disability', 'STD', 'disability_std', 'Short Term Disability'),
('Disability', 'LTD', 'disability_ltd', 'Long Term Disability'),
('HSA', 'Standard', 'hsa_standard', 'Health Savings Account'),
('FSA', 'Healthcare', 'fsa_healthcare', 'Healthcare Flexible Spending Account'),
('FSA', 'Dependent Care', 'fsa_dependent_care', 'Dependent Care FSA');

-- Insert default deduction codes
INSERT INTO public.deduction_codes (code, description, pre_tax, gl_code) VALUES
('MED_PRETAX', 'Medical Insurance Pre-Tax', true, '2100'),
('MED_AFTERTAX', 'Medical Insurance After-Tax', false, '2101'),
('DENTAL_PRETAX', 'Dental Insurance Pre-Tax', true, '2102'),
('DENTAL_AFTERTAX', 'Dental Insurance After-Tax', false, '2103'),
('VISION_PRETAX', 'Vision Insurance Pre-Tax', true, '2104'),
('VISION_AFTERTAX', 'Vision Insurance After-Tax', false, '2105'),
('LIFE_PRETAX', 'Life Insurance Pre-Tax', true, '2106'),
('LIFE_AFTERTAX', 'Life Insurance After-Tax', false, '2107'),
('STD_PRETAX', 'Short Term Disability Pre-Tax', true, '2108'),
('LTD_PRETAX', 'Long Term Disability Pre-Tax', true, '2109'),
('HSA_PRETAX', 'HSA Contribution Pre-Tax', true, '2110'),
('FSA_PRETAX', 'FSA Contribution Pre-Tax', true, '2111');

-- Create indexes for performance
CREATE INDEX idx_carriers_type ON public.carriers(type);
CREATE INDEX idx_plan_templates_carrier_id ON public.plan_templates(carrier_id);
CREATE INDEX idx_plan_templates_plan_type_code ON public.plan_templates(plan_type_code);
CREATE INDEX idx_plan_assignments_client_id ON public.plan_assignments(client_id);
CREATE INDEX idx_plan_assignments_plan_id ON public.plan_assignments(plan_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Create update timestamp triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_carriers_updated_at BEFORE UPDATE ON public.carriers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_plan_templates_updated_at BEFORE UPDATE ON public.plan_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_eligibility_rules_updated_at BEFORE UPDATE ON public.eligibility_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deduction_codes_updated_at BEFORE UPDATE ON public.deduction_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_plan_assignments_updated_at BEFORE UPDATE ON public.plan_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();