-- Create storage bucket for training files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('training-files', 'training-files', true);

-- Create storage policies for training files
CREATE POLICY "Anyone can view training files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'training-files');

CREATE POLICY "Authenticated users can upload training files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'training-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update training files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'training-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete training files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'training-files' AND auth.uid() IS NOT NULL);