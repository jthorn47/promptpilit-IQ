-- Create storage policies for SCORM files
-- Allow authenticated users to upload SCORM files
CREATE POLICY "Authenticated users can upload SCORM files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'training-files' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = 'scorm'
);

-- Allow authenticated users to view SCORM files
CREATE POLICY "Authenticated users can view SCORM files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'training-files' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = 'scorm'
);

-- Allow authenticated users to delete their own SCORM files
CREATE POLICY "Authenticated users can delete SCORM files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'training-files' AND 
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = 'scorm'
);