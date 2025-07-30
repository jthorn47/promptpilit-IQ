-- Create table for document sharing tokens
CREATE TABLE public.document_share_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  document_type TEXT NOT NULL,
  document_id TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NULL,
  used_by_ip INET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER NOT NULL DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.document_share_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create share tokens" 
ON public.document_share_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own share tokens" 
ON public.document_share_tokens 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own share tokens" 
ON public.document_share_tokens 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Create index for token lookup
CREATE INDEX idx_document_share_tokens_token ON public.document_share_tokens(token);
CREATE INDEX idx_document_share_tokens_active ON public.document_share_tokens(is_active, expires_at);

-- Function to generate secure token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Function to validate and use token
CREATE OR REPLACE FUNCTION public.use_share_token(token_value TEXT, user_ip INET DEFAULT NULL)
RETURNS TABLE(
  valid BOOLEAN,
  document_type TEXT,
  document_id TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record RECORD;
BEGIN
  -- Get token record
  SELECT * INTO token_record
  FROM public.document_share_tokens
  WHERE token = token_value
    AND is_active = true
    AND expires_at > now()
    AND (used_at IS NULL OR view_count < max_uses);
  
  -- Check if token exists and is valid
  IF token_record IS NULL THEN
    RETURN QUERY SELECT false, ''::TEXT, ''::TEXT, 'Invalid or expired token'::TEXT;
    RETURN;
  END IF;
  
  -- Update token usage
  UPDATE public.document_share_tokens
  SET 
    used_at = CASE WHEN used_at IS NULL THEN now() ELSE used_at END,
    used_by_ip = CASE WHEN used_by_ip IS NULL THEN user_ip ELSE used_by_ip END,
    view_count = view_count + 1,
    is_active = CASE WHEN view_count + 1 >= max_uses THEN false ELSE is_active END
  WHERE token = token_value;
  
  -- Return success
  RETURN QUERY SELECT true, token_record.document_type, token_record.document_id, ''::TEXT;
END;
$$;