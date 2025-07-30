-- Create storage bucket for case documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('case-documents', 'case-documents', false);

-- Create case documents table
CREATE TABLE public.case_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  document_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  is_confidential BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for case documents
CREATE POLICY "Users can view case documents they have access to" 
ON public.case_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('super_admin', 'company_admin', 'internal_staff')
  )
);

CREATE POLICY "Users can upload case documents" 
ON public.case_documents 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('super_admin', 'company_admin', 'internal_staff')
  )
);

CREATE POLICY "Users can update case documents they uploaded" 
ON public.case_documents 
FOR UPDATE 
USING (
  uploaded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('super_admin', 'company_admin')
  )
);

CREATE POLICY "Users can delete case documents they uploaded" 
ON public.case_documents 
FOR DELETE 
USING (
  uploaded_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('super_admin', 'company_admin')
  )
);

-- Create storage policies for case documents
CREATE POLICY "Authenticated users can view case documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'case-documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload case documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'case-documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their uploaded documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'case-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their uploaded documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'case-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_case_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_case_documents_updated_at
BEFORE UPDATE ON public.case_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_case_documents_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_case_documents_case_id ON public.case_documents(case_id);
CREATE INDEX idx_case_documents_uploaded_by ON public.case_documents(uploaded_by);
CREATE INDEX idx_case_documents_status ON public.case_documents(status);
CREATE INDEX idx_case_documents_document_type ON public.case_documents(document_type);