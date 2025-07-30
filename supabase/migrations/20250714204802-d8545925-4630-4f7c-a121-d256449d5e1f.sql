-- Create system settings table for storing Easelearn branding
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  setting_type text NOT NULL DEFAULT 'text',
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "System settings are viewable by everyone" 
ON public.system_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Super admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Insert default Easelearn logo setting
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description)
VALUES ('easelearn_logo_url', NULL, 'url', 'URL for the Easelearn logo displayed in training modules');

-- Add trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();