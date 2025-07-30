
-- Phase 1: Enhance database structure for IIPP & Employee Handbook Builder

-- Add new document categories for septic industry and IIPP
INSERT INTO public.document_types (name, description, category, is_active, compliance_framework, legal_disclaimer)
VALUES 
  ('IIPP - Injury & Illness Prevention Program', 'OSHA-required workplace safety program for injury and illness prevention', 'safety', true, ARRAY['OSHA', 'Cal/OSHA'], 'This template provides general guidance and must be customized for your specific workplace hazards and state requirements.'),
  ('Septic Systems Safety Manual', 'Comprehensive safety and compliance manual for onsite wastewater systems', 'septic', true, ARRAY['EPA', 'State Environmental'], 'State and local septic regulations vary. Verify current requirements with your local authority having jurisdiction.'),
  ('Employee Handbook - Septic Industry', 'Complete employee handbook tailored for septic system service companies', 'handbook', true, ARRAY['OSHA', 'DOL', 'State Labor'], 'Employment laws vary by state. Consult with legal counsel to ensure compliance with local requirements.');

-- Create jurisdictions table for state/county specific rules
CREATE TABLE public.jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('state', 'county', 'city')),
  parent_jurisdiction_id UUID REFERENCES public.jurisdictions(id),
  abbreviation TEXT,
  fips_code TEXT,
  regulations_last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for jurisdictions
ALTER TABLE public.jurisdictions ENABLE ROW LEVEL SECURITY;

-- Create policy for jurisdictions (viewable by all authenticated users)
CREATE POLICY "Jurisdictions are viewable by authenticated users"
ON public.jurisdictions
FOR SELECT
TO authenticated
USING (true);

-- Create regulation_rules table for jurisdiction-specific requirements
CREATE TABLE public.regulation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES public.jurisdictions(id) ON DELETE CASCADE,
  document_category TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  effective_date DATE,
  expiration_date DATE,
  compliance_requirements JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for regulation rules
ALTER TABLE public.regulation_rules ENABLE ROW LEVEL SECURITY;

-- Create policy for regulation rules
CREATE POLICY "Regulation rules are viewable by authenticated users"
ON public.regulation_rules
FOR SELECT
TO authenticated
USING (is_active = true);

-- Add geographic fields to dynamic_fields table for location-based auto-population
INSERT INTO public.dynamic_fields (field_name, field_label, field_type, is_required, description)
VALUES 
  ('company_state', 'Company State', 'select', true, 'Primary state where company operates'),
  ('company_county', 'Company County', 'select', false, 'Primary county where company operates'),
  ('septic_permit_number', 'Septic Permit Number', 'text', false, 'State/local septic contractor permit number'),
  ('osha_establishment_id', 'OSHA Establishment ID', 'text', false, 'OSHA establishment identification number');

-- Create quiz_questions table for section-based assessments
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_section_id UUID REFERENCES public.document_sections(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'essay')),
  correct_answer JSONB,
  answer_options JSONB DEFAULT '[]',
  points INTEGER DEFAULT 1,
  explanation TEXT,
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for quiz questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Create policy for quiz questions
CREATE POLICY "Company admins can manage quiz questions for their documents"
ON public.quiz_questions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.document_sections ds
    JOIN public.documents d ON ds.document_id = d.id
    WHERE ds.id = quiz_questions.document_section_id
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, d.company_id)
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- Create compliance_forms table for embedded forms
CREATE TABLE public.compliance_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_section_id UUID REFERENCES public.document_sections(id) ON DELETE CASCADE,
  form_name TEXT NOT NULL,
  form_type TEXT NOT NULL CHECK (form_type IN ('checklist', 'inspection', 'incident_report', 'training_record')),
  form_fields JSONB NOT NULL DEFAULT '[]',
  submission_required BOOLEAN DEFAULT false,
  retention_period_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for compliance forms
ALTER TABLE public.compliance_forms ENABLE ROW LEVEL SECURITY;

-- Create policy for compliance forms
CREATE POLICY "Company admins can manage compliance forms for their documents"
ON public.compliance_forms
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.document_sections ds
    JOIN public.documents d ON ds.document_id = d.id
    WHERE ds.id = compliance_forms.document_section_id
    AND (
      has_company_role(auth.uid(), 'company_admin'::app_role, d.company_id)
      OR has_role(auth.uid(), 'super_admin'::app_role)
    )
  )
);

-- Create update triggers
CREATE TRIGGER update_jurisdictions_updated_at
    BEFORE UPDATE ON public.jurisdictions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regulation_rules_updated_at
    BEFORE UPDATE ON public.regulation_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at
    BEFORE UPDATE ON public.quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_forms_updated_at
    BEFORE UPDATE ON public.compliance_forms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample jurisdiction data
INSERT INTO public.jurisdictions (name, type, abbreviation, fips_code) VALUES
  ('California', 'state', 'CA', '06'),
  ('Texas', 'state', 'TX', '48'),
  ('Florida', 'state', 'FL', '12'),
  ('New York', 'state', 'NY', '36'),
  ('Washington', 'state', 'WA', '53');

-- Insert sample septic regulations for California
INSERT INTO public.regulation_rules (jurisdiction_id, document_category, rule_type, title, content, effective_date, compliance_requirements)
VALUES (
  (SELECT id FROM public.jurisdictions WHERE abbreviation = 'CA'),
  'septic',
  'maintenance',
  'Septic Tank Pumping Requirements',
  'Septic tanks shall be pumped and inspected at minimum every three (3) years for residential systems and annually for commercial systems. Records of pumping and inspection must be maintained for five (5) years.',
  '2024-01-01',
  '{"inspection_frequency": "annual", "record_retention": "5_years", "permit_required": true}'
);
