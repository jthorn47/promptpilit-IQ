-- Ensure training-audio bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-audio', 'training-audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create RLS policies for training-audio bucket
-- Allow public read access to training audio files
CREATE POLICY "Training audio files are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'training-audio');

-- Allow authenticated users to upload training audio files
CREATE POLICY "Authenticated users can upload training audio" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'training-audio' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to update their training audio files
CREATE POLICY "Authenticated users can update training audio" ON storage.objects
FOR UPDATE USING (bucket_id = 'training-audio' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete training audio files
CREATE POLICY "Authenticated users can delete training audio" ON storage.objects
FOR DELETE USING (bucket_id = 'training-audio' AND auth.uid() IS NOT NULL);