-- Create client-assets storage bucket for client logos
INSERT INTO storage.buckets (id, name, public) VALUES ('client-assets', 'client-assets', true);

-- Create storage policies for client-assets bucket
CREATE POLICY "Client assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'client-assets');

CREATE POLICY "Authenticated users can upload client assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'client-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update client assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'client-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete client assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'client-assets' AND auth.uid() IS NOT NULL);