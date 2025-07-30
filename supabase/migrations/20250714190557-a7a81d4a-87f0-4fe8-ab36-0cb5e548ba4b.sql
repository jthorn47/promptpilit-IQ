-- Ensure training-audio bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('training-audio', 'training-audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create policy to allow public access to training audio files
CREATE POLICY "Allow public access to training audio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'training-audio');

-- Create policy to allow authenticated users to upload training audio files
CREATE POLICY "Allow authenticated users to upload training audio files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'training-audio' AND auth.uid() IS NOT NULL);

-- Create policy to allow authenticated users to update training audio files
CREATE POLICY "Allow authenticated users to update training audio files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'training-audio' AND auth.uid() IS NOT NULL);

-- Create policy to allow authenticated users to delete training audio files
CREATE POLICY "Allow authenticated users to delete training audio files"
ON storage.objects FOR DELETE
USING (bucket_id = 'training-audio' AND auth.uid() IS NOT NULL);