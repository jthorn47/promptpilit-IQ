-- Create user email settings table for individual staff email configurations
CREATE TABLE public.user_email_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT,
  smtp_enabled BOOLEAN NOT NULL DEFAULT false,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_username TEXT,
  smtp_password TEXT, -- Note: In production, this should be encrypted
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, from_email)
);

-- Enable RLS
ALTER TABLE public.user_email_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only manage their own email settings
CREATE POLICY "Users can manage their own email settings"
ON public.user_email_settings
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Super admins can view all email settings for support purposes
CREATE POLICY "Super admins can view all user email settings"
ON public.user_email_settings
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_user_email_settings_updated_at
BEFORE UPDATE ON public.user_email_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_email_settings_user_id ON public.user_email_settings(user_id);
CREATE INDEX idx_user_email_settings_active ON public.user_email_settings(is_active);