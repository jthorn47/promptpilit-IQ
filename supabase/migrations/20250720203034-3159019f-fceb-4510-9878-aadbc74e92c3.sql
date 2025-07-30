
-- CompX Workers' Compensation Management System Database Schema

-- Create CompX policies table
CREATE TABLE public.compx_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  policy_number TEXT NOT NULL UNIQUE,
  carrier_name TEXT NOT NULL,
  policy_type TEXT NOT NULL DEFAULT 'workers_comp',
  effective_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  annual_premium DECIMAL(12,2),
  deductible DECIMAL(10,2) DEFAULT 0,
  coverage_limits JSONB DEFAULT '{}',
  policy_status TEXT NOT NULL DEFAULT 'active',
  broker_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create CompX employee profiles
CREATE TABLE public.compx_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  worker_comp_code TEXT NOT NULL,
  job_classification TEXT NOT NULL,
  hourly_rate DECIMAL(8,2),
  annual_hours INTEGER DEFAULT 2080,
  risk_level TEXT DEFAULT 'medium',
  safety_training_status TEXT DEFAULT 'pending',
  last_safety_training DATE,
  medical_restrictions TEXT,
  return_to_work_eligible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create CompX incidents table
CREATE TABLE public.compx_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  compx_employee_id UUID REFERENCES public.compx_employees(id) ON DELETE SET NULL,
  incident_number TEXT NOT NULL UNIQUE,
  incident_date TIMESTAMPTZ NOT NULL,
  reported_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  incident_type TEXT NOT NULL,
  severity_level TEXT NOT NULL DEFAULT 'minor',
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  body_part_affected TEXT,
  injury_type TEXT,
  medical_attention_required BOOLEAN DEFAULT false,
  witnesses JSONB DEFAULT '[]',
  photos JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  investigation_notes TEXT,
  corrective_actions TEXT,
  status TEXT NOT NULL DEFAULT 'reported',
  reported_by UUID REFERENCES auth.users(id),
  investigated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create CompX claims table
CREATE TABLE public.compx_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  incident_id UUID REFERENCES public.compx_incidents(id) ON DELETE SET NULL,
  compx_employee_id UUID NOT NULL REFERENCES public.compx_employees(id) ON DELETE CASCADE,
  claim_number TEXT NOT NULL UNIQUE,
  claim_date DATE NOT NULL,
  claim_type TEXT NOT NULL DEFAULT 'medical_only',
  claim_status TEXT NOT NULL DEFAULT 'open',
  total_paid DECIMAL(12,2) DEFAULT 0,
  total_reserved DECIMAL(12,2) DEFAULT 0,
  medical_costs DECIMAL(12,2) DEFAULT 0,
  indemnity_costs DECIMAL(12,2) DEFAULT 0,
  legal_costs DECIMAL(12,2) DEFAULT 0,
  adjuster_name TEXT,
  adjuster_contact JSONB DEFAULT '{}',
  medical_provider TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  estimated_closure_date DATE,
  return_to_work_date DATE,
  settlement_amount DECIMAL(12,2),
  closure_date DATE,
  closure_reason TEXT,
  litigation_status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create CompX medical providers table
CREATE TABLE public.compx_medical_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  specialty TEXT,
  address JSONB NOT NULL,
  contact_info JSONB NOT NULL,
  network_status TEXT DEFAULT 'preferred',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create CompX safety reports table
CREATE TABLE public.compx_safety_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  report_date DATE NOT NULL,
  location TEXT NOT NULL,
  inspector_id UUID REFERENCES auth.users(id),
  safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100),
  violations JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  corrective_actions JSONB DEFAULT '[]',
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  status TEXT DEFAULT 'pending',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create CompX compliance tracking table
CREATE TABLE public.compx_compliance_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  compliance_type TEXT NOT NULL,
  requirement_description TEXT NOT NULL,
  due_date DATE NOT NULL,
  completion_date DATE,
  status TEXT DEFAULT 'pending',
  responsible_person UUID REFERENCES auth.users(id),
  documentation JSONB DEFAULT '[]',
  penalty_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create CompX return to work programs table
CREATE TABLE public.compx_return_to_work (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES public.compx_claims(id) ON DELETE CASCADE,
  compx_employee_id UUID NOT NULL REFERENCES public.compx_employees(id) ON DELETE CASCADE,
  program_start_date DATE NOT NULL,
  target_return_date DATE,
  actual_return_date DATE,
  work_restrictions JSONB DEFAULT '[]',
  modified_duties TEXT,
  accommodations_provided TEXT,
  medical_clearance_required BOOLEAN DEFAULT true,
  medical_clearance_date DATE,
  progress_notes TEXT,
  program_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_compx_policies_company_id ON public.compx_policies(company_id);
CREATE INDEX idx_compx_employees_company_id ON public.compx_employees(company_id);
CREATE INDEX idx_compx_incidents_company_id ON public.compx_incidents(company_id);
CREATE INDEX idx_compx_claims_company_id ON public.compx_claims(company_id);
CREATE INDEX idx_compx_claims_status ON public.compx_claims(claim_status);
CREATE INDEX idx_compx_incidents_date ON public.compx_incidents(incident_date);
CREATE INDEX idx_compx_safety_reports_company_id ON public.compx_safety_reports(company_id);

-- Enable RLS on all tables
ALTER TABLE public.compx_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compx_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compx_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compx_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compx_medical_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compx_safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compx_compliance_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compx_return_to_work ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company admins can manage their CompX policies" 
ON public.compx_policies 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their CompX employees" 
ON public.compx_employees 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company users can manage their CompX incidents" 
ON public.compx_incidents 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their CompX claims" 
ON public.compx_claims 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their CompX medical providers" 
ON public.compx_medical_providers 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company users can manage their CompX safety reports" 
ON public.compx_safety_reports 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their CompX compliance tracking" 
ON public.compx_compliance_tracking 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their CompX return to work programs" 
ON public.compx_return_to_work 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_compx_policies_updated_at
BEFORE UPDATE ON public.compx_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compx_employees_updated_at
BEFORE UPDATE ON public.compx_employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compx_incidents_updated_at
BEFORE UPDATE ON public.compx_incidents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compx_claims_updated_at
BEFORE UPDATE ON public.compx_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compx_medical_providers_updated_at
BEFORE UPDATE ON public.compx_medical_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compx_safety_reports_updated_at
BEFORE UPDATE ON public.compx_safety_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compx_compliance_tracking_updated_at
BEFORE UPDATE ON public.compx_compliance_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compx_return_to_work_updated_at
BEFORE UPDATE ON public.compx_return_to_work
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
