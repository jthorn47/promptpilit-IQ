-- Check if OPENAI_API_KEY is configured for edge functions
-- This migration creates a simple audit table to track uploaded reports
CREATE TABLE IF NOT EXISTS public.payroll_report_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id),
  analysis_result JSONB,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'analyzing', 'analyzed', 'processed', 'error')),
  company_id UUID,
  payroll_period_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payroll_report_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Company admins can manage their payroll report uploads"
ON public.payroll_report_uploads
FOR ALL
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_payroll_report_uploads_updated_at
BEFORE UPDATE ON public.payroll_report_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();