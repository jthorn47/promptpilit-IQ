-- Create documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for document uploads
CREATE POLICY "Authenticated users can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their company documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Company admins can manage documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'documents' AND (
  has_role(auth.uid(), 'company_admin'::app_role) 
  OR has_role(auth.uid(), 'super_admin'::app_role)
));