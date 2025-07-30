-- Document Builder System Tables

-- Document types and templates
CREATE TABLE public.document_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'wpv', 'iipp', 'hr_policy', 'handbook', etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  compliance_framework TEXT[], -- Array of frameworks this applies to
  legal_disclaimer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document templates
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type_id UUID NOT NULL REFERENCES public.document_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}', -- Template structure and content
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES public.company_settings(id),
  version TEXT NOT NULL DEFAULT '1.0',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Main documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES public.document_types(id),
  template_id UUID REFERENCES public.document_templates(id),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}', -- Document structure and content
  dynamic_fields JSONB NOT NULL DEFAULT '{}', -- Company-specific field values
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'review', 'published', 'archived'
  version TEXT NOT NULL DEFAULT '1.0',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}', -- Additional metadata
  created_by UUID NOT NULL REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID REFERENCES auth.users(id),
  pdf_url TEXT, -- URL to generated PDF
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document sections (for modular document building)
CREATE TABLE public.document_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  section_title TEXT NOT NULL,
  section_content JSONB NOT NULL DEFAULT '{}',
  section_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_collapsed BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document versions for change tracking
CREATE TABLE public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  content JSONB NOT NULL,
  dynamic_fields JSONB NOT NULL DEFAULT '{}',
  change_summary TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Legal clauses library
CREATE TABLE public.legal_clauses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  clause_type TEXT NOT NULL, -- 'disclaimer', 'policy', 'procedure', etc.
  applicable_documents TEXT[], -- Array of document types this applies to
  jurisdiction TEXT DEFAULT 'US', -- Legal jurisdiction
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dynamic field definitions
CREATE TABLE public.dynamic_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'number', 'date', 'select', 'company_data'
  default_value TEXT,
  validation_rules JSONB DEFAULT '{}',
  is_required BOOLEAN NOT NULL DEFAULT false,
  source_table TEXT, -- If pulling from existing data
  source_column TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document comments and review system
CREATE TABLE public.document_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.document_sections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment_text TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'comment', -- 'comment', 'suggestion', 'approval', 'rejection'
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document approvals and signatures
CREATE TABLE public.document_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  approval_type TEXT NOT NULL DEFAULT 'review', -- 'review', 'approval', 'signature'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  notes TEXT,
  digital_signature TEXT, -- Base64 encoded signature or signature metadata
  signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX idx_documents_company_id ON public.documents(company_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_document_type ON public.documents(document_type_id);
CREATE INDEX idx_document_sections_document_id ON public.document_sections(document_id);
CREATE INDEX idx_document_sections_order ON public.document_sections(document_id, section_order);
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_comments_document_id ON public.document_comments(document_id);

-- Enable Row Level Security
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Document types - viewable by all authenticated users
CREATE POLICY "Document types are viewable by authenticated users"
ON public.document_types FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage document types"
ON public.document_types FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Document templates
CREATE POLICY "Users can view public templates and their company templates"
ON public.document_templates FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    is_public = true OR 
    company_id = get_user_company_id(auth.uid()) OR
    has_role(auth.uid(), 'super_admin')
  )
);

CREATE POLICY "Company admins can manage their templates"
ON public.document_templates FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin', company_id) OR
  has_role(auth.uid(), 'super_admin')
);

-- Documents
CREATE POLICY "Company users can view their company documents"
ON public.documents FOR SELECT
USING (
  company_id = get_user_company_id(auth.uid()) OR
  has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Company admins can manage their company documents"
ON public.documents FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin', company_id) OR
  has_role(auth.uid(), 'super_admin')
);

-- Document sections
CREATE POLICY "Users can view sections of accessible documents"
ON public.document_sections FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_sections.document_id
    AND (d.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'))
  )
);

CREATE POLICY "Company admins can manage sections of their documents"
ON public.document_sections FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_sections.document_id
    AND (has_company_role(auth.uid(), 'company_admin', d.company_id) OR has_role(auth.uid(), 'super_admin'))
  )
);

-- Document versions
CREATE POLICY "Users can view versions of accessible documents"
ON public.document_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_versions.document_id
    AND (d.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'))
  )
);

CREATE POLICY "System can insert document versions"
ON public.document_versions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_versions.document_id
    AND (has_company_role(auth.uid(), 'company_admin', d.company_id) OR has_role(auth.uid(), 'super_admin'))
  )
);

-- Legal clauses
CREATE POLICY "Legal clauses are viewable by authenticated users"
ON public.legal_clauses FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage legal clauses"
ON public.legal_clauses FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Dynamic fields
CREATE POLICY "Dynamic fields are viewable by authenticated users"
ON public.dynamic_fields FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage dynamic fields"
ON public.dynamic_fields FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Document comments
CREATE POLICY "Users can view comments on accessible documents"
ON public.document_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_comments.document_id
    AND (d.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'))
  )
);

CREATE POLICY "Users can manage their own comments"
ON public.document_comments FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "Company admins can manage comments on their documents"
ON public.document_comments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_comments.document_id
    AND has_company_role(auth.uid(), 'company_admin', d.company_id)
  ) OR has_role(auth.uid(), 'super_admin')
);

-- Document approvals
CREATE POLICY "Users can view approvals for accessible documents"
ON public.document_approvals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_approvals.document_id
    AND (d.company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'))
  )
);

CREATE POLICY "Approvers can manage their own approvals"
ON public.document_approvals FOR ALL
USING (approver_id = auth.uid());

CREATE POLICY "Company admins can manage approvals for their documents"
ON public.document_approvals FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_approvals.document_id
    AND has_company_role(auth.uid(), 'company_admin', d.company_id)
  ) OR has_role(auth.uid(), 'super_admin')
);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_document_types_updated_at
  BEFORE UPDATE ON public.document_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_sections_updated_at
  BEFORE UPDATE ON public.document_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_clauses_updated_at
  BEFORE UPDATE ON public.legal_clauses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_comments_updated_at
  BEFORE UPDATE ON public.document_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default document types
INSERT INTO public.document_types (name, description, category, compliance_framework, legal_disclaimer) VALUES
('Workplace Violence Prevention Plan', 'Comprehensive plan for preventing workplace violence as required by SB 553', 'wpv', ARRAY['SB 553', 'Cal/OSHA'], 'This plan is provided for compliance assistance only and does not constitute legal advice. Consult with legal counsel for specific requirements.'),
('Injury and Illness Prevention Program', 'IIPP as required by Cal/OSHA', 'iipp', ARRAY['Cal/OSHA', 'OSHA'], 'This program template is provided for compliance assistance only. Employers must customize this program to reflect their specific workplace conditions.'),
('Employee Handbook', 'Comprehensive employee handbook covering policies and procedures', 'handbook', ARRAY[], 'This handbook template provides general guidance and must be customized to reflect your specific workplace policies and applicable laws.'),
('HR Policy Manual', 'Human resources policies and procedures', 'hr_policy', ARRAY[], 'These policy templates are provided for informational purposes and must be reviewed by legal counsel before implementation.'),
('Safety Manual', 'Workplace safety policies and procedures', 'safety', ARRAY['OSHA', 'Cal/OSHA'], 'This safety manual template must be customized to reflect your specific workplace hazards and safety requirements.');

-- Insert default dynamic fields
INSERT INTO public.dynamic_fields (field_name, field_label, field_type, source_table, source_column, description, is_required) VALUES
('company_name', 'Company Name', 'company_data', 'company_settings', 'company_name', 'Legal company name', true),
('company_address', 'Company Address', 'text', NULL, NULL, 'Primary business address', true),
('company_phone', 'Company Phone', 'text', NULL, NULL, 'Main company phone number', false),
('supervisor_name', 'Supervisor Name', 'text', NULL, NULL, 'Name of responsible supervisor', true),
('supervisor_title', 'Supervisor Title', 'text', NULL, NULL, 'Title of responsible supervisor', false),
('effective_date', 'Effective Date', 'date', NULL, NULL, 'Date when the document becomes effective', true),
('review_date', 'Review Date', 'date', NULL, NULL, 'Date for next review', false),
('employee_count', 'Employee Count', 'number', NULL, NULL, 'Total number of employees', false),
('business_type', 'Business Type', 'text', NULL, NULL, 'Type of business/industry', false),
('contact_email', 'Contact Email', 'text', NULL, NULL, 'Primary contact email', false);

-- Insert sample legal clauses
INSERT INTO public.legal_clauses (title, content, clause_type, applicable_documents, jurisdiction) VALUES
('Non-Discrimination Clause', 'This company is an equal opportunity employer and does not discriminate on the basis of race, color, religion, gender, sexual orientation, gender identity, national origin, age, disability, or any other legally protected status.', 'policy', ARRAY['handbook', 'hr_policy'], 'US'),
('At-Will Employment', 'Employment with this company is at-will, meaning that either the employee or the company may terminate the employment relationship at any time, with or without cause or notice.', 'policy', ARRAY['handbook'], 'US'),
('Confidentiality Agreement', 'Employees must maintain the confidentiality of proprietary information and trade secrets of the company and its clients.', 'policy', ARRAY['handbook', 'hr_policy'], 'US'),
('Safety Compliance', 'All employees are required to comply with safety policies and procedures and report any unsafe conditions immediately.', 'policy', ARRAY['safety', 'iipp'], 'US'),
('Cal/OSHA Disclaimer', 'This document has been prepared to assist employers in complying with Cal/OSHA requirements. It does not constitute legal advice and should be reviewed by qualified professionals.', 'disclaimer', ARRAY['iipp', 'safety', 'wpv'], 'CA');