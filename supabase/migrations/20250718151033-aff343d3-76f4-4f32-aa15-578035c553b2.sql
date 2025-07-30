-- Create user_email_signatures table for storing individual user signatures
CREATE TABLE IF NOT EXISTS public.user_email_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signature_html TEXT NOT NULL DEFAULT '',
  signature_text TEXT NOT NULL DEFAULT '',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  use_global_template BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_email_signatures ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own signatures
CREATE POLICY "Users can manage their own email signatures"
ON public.user_email_signatures
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Super admins can view all signatures
CREATE POLICY "Super admins can view all email signatures"
ON public.user_email_signatures
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_user_email_signatures_updated_at
BEFORE UPDATE ON public.user_email_signatures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_learning();