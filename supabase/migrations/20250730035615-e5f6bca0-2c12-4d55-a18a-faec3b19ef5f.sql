-- Create HALI configuration table
CREATE TABLE public.hali_configurations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES public.company_settings(id),
  auto_responses jsonb DEFAULT '{
    "welcome": "Hi! I''m HALI, your HR assistant. Reply START to begin or HELP for options.",
    "help": "Available commands: START (begin conversation), HELP (this message), STOP (opt out)",
    "stop": "You''ve been unsubscribed from HALI SMS notifications."
  }'::jsonb,
  escalation_enabled boolean DEFAULT true,
  escalation_routing jsonb DEFAULT '{
    "slack_webhook": "",
    "email_recipients": ["hr@company.com"],
    "webhook_url": ""
  }'::jsonb,
  allowed_keywords text[] DEFAULT ARRAY['START', 'HELP', 'STOP', 'HR', 'PAYROLL'],
  vault_file_settings jsonb DEFAULT '{
    "expiry_hours": 24,
    "size_limit_mb": 10,
    "allowed_types": ["pdf", "doc", "docx", "jpg", "png"]
  }'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.hali_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Company admins can manage HALI configurations" 
ON public.hali_configurations 
FOR ALL 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_hali_configurations_updated_at
  BEFORE UPDATE ON public.hali_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_halo_updated_at();

-- Create default configuration for super admins (global config)
INSERT INTO public.hali_configurations (company_id, created_by) 
VALUES (NULL, NULL);