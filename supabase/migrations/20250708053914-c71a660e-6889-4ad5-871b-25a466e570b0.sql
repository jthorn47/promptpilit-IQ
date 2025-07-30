-- Create RLS policy to allow public access to training-files
CREATE POLICY "Public read access to training files" ON storage.objects
FOR SELECT USING (bucket_id = 'training-files');