-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('training-audio', 'training-audio', true);

-- Create RLS policies for audio uploads
CREATE POLICY "Allow authenticated users to upload audio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'training-audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to view audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'training-audio');

CREATE POLICY "Allow authenticated users to update their audio files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'training-audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete their audio files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'training-audio' AND auth.uid() IS NOT NULL);

-- Add audio URL column to client_sbw9237_modules table
ALTER TABLE public.client_sbw9237_modules 
ADD COLUMN intro_audio_url TEXT;