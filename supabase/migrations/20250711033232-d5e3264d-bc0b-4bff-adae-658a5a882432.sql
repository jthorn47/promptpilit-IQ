-- Create table for storing shareable links
CREATE TABLE public.shared_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  page_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Create index for faster token lookups
CREATE INDEX idx_shared_links_token ON public.shared_links(token);
CREATE INDEX idx_shared_links_active ON public.shared_links(is_active, expires_at);

-- Enable RLS
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to create shares
CREATE POLICY "Allow authenticated users to create shares" 
ON public.shared_links 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy to allow anyone to view active shares (for public access)
CREATE POLICY "Allow anyone to view active shares" 
ON public.shared_links 
FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Policy to allow authenticated users to view their own shares
CREATE POLICY "Allow authenticated users to view all shares" 
ON public.shared_links 
FOR SELECT 
TO authenticated 
USING (true);

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_share_view_count(share_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.shared_links 
  SET view_count = view_count + 1 
  WHERE token = share_token AND is_active = true AND (expires_at IS NULL OR expires_at > now());
END;
$$;