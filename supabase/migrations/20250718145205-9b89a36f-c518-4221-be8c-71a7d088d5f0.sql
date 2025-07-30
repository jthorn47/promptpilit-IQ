-- Create global email signature settings table
CREATE TABLE public.global_email_signature_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_html TEXT NOT NULL DEFAULT '',
  template_text TEXT NOT NULL DEFAULT '',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  allow_user_customization BOOLEAN NOT NULL DEFAULT true,
  available_tokens TEXT[] NOT NULL DEFAULT ARRAY['first_name', 'last_name', 'title', 'email', 'phone', 'company_name'],
  preview_data JSONB NOT NULL DEFAULT '{"first_name": "John", "last_name": "Doe", "title": "Software Engineer", "email": "john.doe@company.com", "phone": "(555) 123-4567", "company_name": "Acme Corp"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.global_email_signature_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage email signature settings
CREATE POLICY "Super admins can manage email signature settings" 
ON public.global_email_signature_settings 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_global_email_signature_settings_updated_at
BEFORE UPDATE ON public.global_email_signature_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_learning();

-- Insert default settings
INSERT INTO public.global_email_signature_settings (
  template_html,
  template_text,
  is_enabled,
  allow_user_customization
) VALUES (
  '<div style="font-family: Arial, sans-serif; color: #333;">
    <p><strong>{{first_name}} {{last_name}}</strong><br>
    {{title}}<br>
    {{company_name}}</p>
    <p>Email: <a href="mailto:{{email}}">{{email}}</a><br>
    Phone: {{phone}}</p>
  </div>',
  '{{first_name}} {{last_name}}
{{title}}
{{company_name}}

Email: {{email}}
Phone: {{phone}}',
  false,
  true
);