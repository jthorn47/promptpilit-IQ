-- Create certificate templates table for reusable templates
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  company_id UUID REFERENCES public.company_settings(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on certificate templates
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for certificate templates
CREATE POLICY "Company admins can manage their certificate templates" 
ON public.certificate_templates 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Update existing certificates table to work with new system
ALTER TABLE public.certificates 
DROP COLUMN IF EXISTS completion_id,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS course_id UUID,
ADD COLUMN IF NOT EXISTS course_title TEXT,
ADD COLUMN IF NOT EXISTS learner_name TEXT,
ADD COLUMN IF NOT EXISTS instructor_name TEXT DEFAULT 'Jeffrey Thorn',
ADD COLUMN IF NOT EXISTS score INTEGER,
ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_settings(id);

-- Update RLS policies for certificates
DROP POLICY IF EXISTS "Company admins can manage their certificates" ON public.certificates;
DROP POLICY IF EXISTS "Super admins can manage all certificates" ON public.certificates;

CREATE POLICY "Company users can view their certificates" 
ON public.certificates 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage certificates" 
ON public.certificates 
FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create updated_at trigger for certificate templates
CREATE TRIGGER update_certificate_templates_updated_at
BEFORE UPDATE ON public.certificate_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();