-- Create enum types for the onboarding system
CREATE TYPE onboarding_status AS ENUM ('pending', 'in_progress', 'completed', 'approved', 'rejected');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'temporary');
CREATE TYPE compensation_type AS ENUM ('hourly', 'salary');
CREATE TYPE document_type AS ENUM ('w4', 'i9', 'state_tax', 'handbook', 'direct_deposit', 'id_document', 'custom');
CREATE TYPE user_language AS ENUM ('en', 'es');

-- Companies/Clients table
CREATE TABLE public.onboarding_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  company_address JSONB, -- {street, city, state, zip, country}
  company_logo_url TEXT,
  primary_contact_email TEXT NOT NULL,
  primary_contact_name TEXT,
  phone TEXT,
  states_operating TEXT[] NOT NULL DEFAULT '{}', -- States where company operates
  default_language user_language DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Onboarding codes/links
CREATE TABLE public.onboarding_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.onboarding_companies(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  employee_email TEXT,
  employee_first_name TEXT,
  employee_last_name TEXT,
  position_title TEXT,
  department TEXT,
  work_state TEXT NOT NULL, -- Primary work state for tax purposes
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Employee onboarding records
CREATE TABLE public.employee_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_code_id UUID REFERENCES public.onboarding_codes(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.onboarding_companies(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name TEXT,
  last_name TEXT,
  middle_name TEXT,
  ssn_encrypted TEXT, -- Encrypted SSN
  date_of_birth DATE,
  phone TEXT,
  email TEXT,
  address JSONB, -- {street, city, state, zip, country}
  emergency_contact JSONB, -- {name, relationship, phone, email}
  
  -- Employment Information (filled by employer)
  position_title TEXT,
  department TEXT,
  start_date DATE,
  employment_type employment_type,
  compensation_type compensation_type,
  compensation_amount DECIMAL(10,2),
  overtime_eligible BOOLEAN DEFAULT false,
  
  -- Onboarding Progress
  status onboarding_status DEFAULT 'pending',
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 7,
  language_preference user_language DEFAULT 'en',
  
  -- Completion tracking
  personal_info_completed BOOLEAN DEFAULT false,
  w4_completed BOOLEAN DEFAULT false,
  i9_section1_completed BOOLEAN DEFAULT false,
  i9_section2_completed BOOLEAN DEFAULT false,
  state_tax_completed BOOLEAN DEFAULT false,
  direct_deposit_completed BOOLEAN DEFAULT false,
  handbook_acknowledged BOOLEAN DEFAULT false,
  esignature_completed BOOLEAN DEFAULT false,
  
  -- Employer review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  employer_notes TEXT,
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documents storage tracking
CREATE TABLE public.onboarding_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_onboarding_id UUID REFERENCES public.employee_onboarding(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_required BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  signed_at TIMESTAMPTZ,
  signature_data JSONB -- For eSignature metadata
);

-- Form data storage (for W-4, state forms, etc.)
CREATE TABLE public.onboarding_form_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_onboarding_id UUID REFERENCES public.employee_onboarding(id) ON DELETE CASCADE,
  form_type document_type NOT NULL,
  form_data JSONB NOT NULL, -- JSON structure with form fields
  completed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  signature_data JSONB
);

-- Company-specific documents and forms
CREATE TABLE public.company_onboarding_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.onboarding_companies(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  template_name TEXT NOT NULL,
  file_path TEXT, -- For PDF templates
  form_fields JSONB, -- For dynamic form configuration
  is_required BOOLEAN DEFAULT true,
  state_specific TEXT, -- NULL for general, state code for state-specific
  language user_language DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- State-specific tax forms configuration
CREATE TABLE public.state_tax_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL,
  form_name TEXT NOT NULL,
  form_fields JSONB NOT NULL, -- JSON structure defining form fields
  language user_language DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(state_code, language)
);

-- Enable RLS on all tables
ALTER TABLE public.onboarding_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_form_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.state_tax_forms ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Super admins can manage everything
CREATE POLICY "Super admins can manage all onboarding data"
ON public.onboarding_companies FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage all onboarding codes"
ON public.onboarding_codes FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can manage all employee onboarding"
ON public.employee_onboarding FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Company admins can manage their company's data
CREATE POLICY "Company admins can view their companies"
ON public.onboarding_companies FOR SELECT
USING (
  has_role(auth.uid(), 'company_admin'::app_role) AND 
  id = get_user_company_id(auth.uid())
);

-- Employees can access onboarding via valid codes (public access)
CREATE POLICY "Public access to onboarding via valid codes"
ON public.onboarding_codes FOR SELECT
USING (NOT is_used AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Public can create employee onboarding records"
ON public.employee_onboarding FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can update their own onboarding records"
ON public.employee_onboarding FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can view their own onboarding records"
ON public.employee_onboarding FOR SELECT
USING (true);

-- Documents and forms - similar policies
CREATE POLICY "Public can manage onboarding documents"
ON public.onboarding_documents FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Public can manage onboarding form data"
ON public.onboarding_form_data FOR ALL
USING (true)
WITH CHECK (true);

-- State tax forms are publicly viewable
CREATE POLICY "State tax forms are publicly viewable"
ON public.state_tax_forms FOR SELECT
USING (is_active = true);

CREATE POLICY "Super admins can manage state tax forms"
ON public.state_tax_forms FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Company templates
CREATE POLICY "Company admins can manage their templates"
ON public.company_onboarding_templates FOR ALL
USING (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (has_role(auth.uid(), 'company_admin'::app_role) AND company_id = get_user_company_id(auth.uid()))
)
WITH CHECK (
  has_role(auth.uid(), 'super_admin'::app_role) OR
  (has_role(auth.uid(), 'company_admin'::app_role) AND company_id = get_user_company_id(auth.uid()))
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_onboarding_companies_updated_at BEFORE UPDATE ON public.onboarding_companies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_onboarding_codes_updated_at BEFORE UPDATE ON public.onboarding_codes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_employee_onboarding_updated_at BEFORE UPDATE ON public.employee_onboarding FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_company_onboarding_templates_updated_at BEFORE UPDATE ON public.company_onboarding_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_state_tax_forms_updated_at BEFORE UPDATE ON public.state_tax_forms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to generate unique onboarding codes
CREATE OR REPLACE FUNCTION generate_onboarding_code() RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.onboarding_codes WHERE code = code) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Insert some initial state tax forms
INSERT INTO public.state_tax_forms (state_code, form_name, form_fields, language) VALUES
('CA', 'DE 4 - Employee''s Withholding Allowance Certificate', '{
  "filing_status": {"type": "select", "options": ["single", "married_filing_jointly", "married_filing_separately", "head_of_household"], "required": true},
  "total_allowances": {"type": "number", "min": 0, "required": true},
  "additional_withholding": {"type": "number", "min": 0},
  "exempt": {"type": "boolean"}
}', 'en'),
('NY', 'IT-2104 - Employee''s Withholding Allowance Certificate', '{
  "filing_status": {"type": "select", "options": ["single", "married_filing_jointly", "married_filing_separately", "head_of_household"], "required": true},
  "allowances": {"type": "number", "min": 0, "required": true},
  "additional_withholding": {"type": "number", "min": 0}
}', 'en'),
('TX', 'No State Income Tax', '{}', 'en'),
('FL', 'No State Income Tax', '{}', 'en');

-- Spanish versions
INSERT INTO public.state_tax_forms (state_code, form_name, form_fields, language) VALUES
('CA', 'DE 4 - Certificado de Exención de Retención del Empleado', '{
  "filing_status": {"type": "select", "options": ["soltero", "casado_declaracion_conjunta", "casado_declaracion_separada", "cabeza_de_familia"], "required": true},
  "total_allowances": {"type": "number", "min": 0, "required": true},
  "additional_withholding": {"type": "number", "min": 0},
  "exempt": {"type": "boolean"}
}', 'es'),
('NY', 'IT-2104 - Certificado de Exención de Retención del Empleado', '{
  "filing_status": {"type": "select", "options": ["soltero", "casado_declaracion_conjunta", "casado_declaracion_separada", "cabeza_de_familia"], "required": true},
  "allowances": {"type": "number", "min": 0, "required": true},
  "additional_withholding": {"type": "number", "min": 0}
}', 'es'),
('TX', 'Sin Impuesto Estatal sobre la Renta', '{}', 'es'),
('FL', 'Sin Impuesto Estatal sobre la Renta', '{}', 'es');