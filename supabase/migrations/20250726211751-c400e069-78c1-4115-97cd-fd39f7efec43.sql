-- Create storage bucket for employee photos
INSERT INTO storage.buckets (id, name, public) VALUES ('employee-photos', 'employee-photos', true);

-- Create storage policies for employee photos
CREATE POLICY "Public can view employee photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'employee-photos');

CREATE POLICY "Authenticated users can upload employee photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'employee-photos');

CREATE POLICY "System can manage employee photos" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'employee-photos');