-- Create company_hr_assessments table for PropGEN integration
CREATE TABLE public.company_hr_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  
  -- Assessment data
  responses JSONB NOT NULL DEFAULT '{}',
  risk_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
  
  -- Input method tracking
  input_method TEXT NOT NULL DEFAULT 'manual' CHECK (input_method IN ('manual', 'import', 'pdf_upload')),
  source_data JSONB DEFAULT '{}', -- Store import/upload metadata
  
  -- Assessment details
  industry TEXT,
  company_size TEXT,
  assessment_date DATE DEFAULT CURRENT_DATE,
  
  -- File references for PDF uploads
  pdf_file_url TEXT,
  pdf_parsed_data JSONB,
  
  -- External import data
  external_assessment_id TEXT,
  external_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Status and metadata
  status TEXT DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'imported', 'parsed')),
  ai_analysis JSONB,
  completion_metadata JSONB DEFAULT '{}',
  
  -- Audit fields
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure only one active assessment per company
  UNIQUE(company_id, assessment_date)
);

-- Enable RLS
ALTER TABLE public.company_hr_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Company admins can manage HR assessments" 
ON public.company_hr_assessments 
FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR
  has_crm_role(auth.uid(), 'internal_staff'::app_role)
);

CREATE POLICY "Sales staff can view HR assessments" 
ON public.company_hr_assessments 
FOR SELECT 
USING (
  has_crm_role(auth.uid(), 'internal_staff'::app_role) OR
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create updated_at trigger
CREATE TRIGGER update_company_hr_assessments_updated_at
  BEFORE UPDATE ON public.company_hr_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get latest assessment for a company
CREATE OR REPLACE FUNCTION public.get_company_latest_assessment(p_company_id UUID)
RETURNS TABLE (
  id UUID,
  risk_score INTEGER,
  risk_level TEXT,
  input_method TEXT,
  assessment_date DATE,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cha.id,
    cha.risk_score,
    cha.risk_level,
    cha.input_method,
    cha.assessment_date,
    cha.status,
    cha.created_at
  FROM public.company_hr_assessments cha
  WHERE cha.company_id = p_company_id
  ORDER BY cha.assessment_date DESC, cha.created_at DESC
  LIMIT 1;
END;
$$;

-- Create storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hr-assessment-pdfs',
  'hr-assessment-pdfs',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for PDF uploads
CREATE POLICY "Users can upload HR assessment PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'hr-assessment-pdfs' AND
  (has_role(auth.uid(), 'super_admin'::app_role) OR 
   has_crm_role(auth.uid(), 'internal_staff'::app_role) OR
   has_role(auth.uid(), 'company_admin'::app_role))
);

CREATE POLICY "Users can view HR assessment PDFs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'hr-assessment-pdfs' AND
  (has_role(auth.uid(), 'super_admin'::app_role) OR 
   has_crm_role(auth.uid(), 'internal_staff'::app_role) OR
   has_role(auth.uid(), 'company_admin'::app_role))
);

CREATE POLICY "Users can update HR assessment PDFs" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'hr-assessment-pdfs' AND
  (has_role(auth.uid(), 'super_admin'::app_role) OR 
   has_crm_role(auth.uid(), 'internal_staff'::app_role) OR
   has_role(auth.uid(), 'company_admin'::app_role))
);

-- Add indexes for performance
CREATE INDEX idx_company_hr_assessments_company_id ON public.company_hr_assessments(company_id);
CREATE INDEX idx_company_hr_assessments_date ON public.company_hr_assessments(assessment_date DESC);
CREATE INDEX idx_company_hr_assessments_external_id ON public.company_hr_assessments(external_assessment_id) WHERE external_assessment_id IS NOT NULL;