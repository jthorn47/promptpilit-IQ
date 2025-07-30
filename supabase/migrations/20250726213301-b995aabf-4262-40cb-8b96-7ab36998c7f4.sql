-- Create storage bucket for punch photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('punch-photos', 'punch-photos', false);

-- Create policies for punch photos
CREATE POLICY "Employees can view their own punch photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'punch-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Employees can upload their own punch photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'punch-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Company admins can view all punch photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'punch-photos' AND 
  EXISTS (
    SELECT 1 FROM time_punches tp 
    WHERE tp.photo_url LIKE '%' || name 
    AND has_company_role(auth.uid(), 'company_admin'::app_role, tp.company_id)
  )
);

-- Add photo requirements to company settings
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS require_punch_photos boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS photo_verification_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS punch_photo_quality_threshold integer DEFAULT 80;