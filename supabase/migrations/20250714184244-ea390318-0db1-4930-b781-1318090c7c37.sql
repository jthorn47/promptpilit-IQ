-- Check and update training-audio bucket configuration
-- First, make sure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-audio', 'training-audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create permissive policies for training audio
CREATE POLICY "Training audio is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'training-audio');

CREATE POLICY "Authenticated users can upload training audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'training-audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update training audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'training-audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete training audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'training-audio' AND auth.uid() IS NOT NULL);