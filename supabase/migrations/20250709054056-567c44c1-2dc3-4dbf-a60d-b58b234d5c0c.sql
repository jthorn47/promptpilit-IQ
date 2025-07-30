-- Create table for WPV plans
CREATE TABLE public.wpv_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'uploaded',
  ai_content_generated BOOLEAN DEFAULT false,
  ai_generation_date TIMESTAMP WITH TIME ZONE,
  plan_content TEXT, -- Extracted text content for AI processing
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wpv_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Company admins can manage their WPV plans" 
ON public.wpv_plans 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id));

CREATE POLICY "Super admins can manage all WPV plans" 
ON public.wpv_plans 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Create storage bucket for WPV plans
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wpv-plans', 'wpv-plans', false);

-- Create storage policies
CREATE POLICY "Company admins can upload their WPV plans" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'wpv-plans' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Company admins can view their WPV plans" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'wpv-plans' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Company admins can update their WPV plans" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'wpv-plans' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Company admins can delete their WPV plans" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'wpv-plans' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create trigger for updated_at
CREATE TRIGGER update_wpv_plans_updated_at
BEFORE UPDATE ON public.wpv_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();