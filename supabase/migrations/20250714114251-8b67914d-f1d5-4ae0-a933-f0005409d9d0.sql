-- Create table to track SBW-9237 status and configuration per client
CREATE TABLE public.client_sbw9237_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unpublished' CHECK (status IN ('unpublished', 'published', 'archived')),
  
  -- Configuration data
  wpv_plan_content TEXT,
  wpv_plan_file_url TEXT,
  wpv_plan_type TEXT DEFAULT 'html' CHECK (wpv_plan_type IN ('html', 'pdf')),
  intro_custom_text TEXT,
  intro_company_logo_url TEXT,
  
  -- Video and SCORM settings  
  scorm_package_url TEXT DEFAULT '/scorm-packages/SBW-9237.zip',
  video_url TEXT,
  
  -- Publishing tracking
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  UNIQUE(client_id)
);

-- Enable RLS
ALTER TABLE public.client_sbw9237_modules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Super admins can manage all SBW-9237 modules"
ON public.client_sbw9237_modules
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can view their SBW-9237 modules"
ON public.client_sbw9237_modules
FOR SELECT
USING (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can only see published modules for assignments"
ON public.client_sbw9237_modules
FOR SELECT
USING (
  (company_id = get_user_company_id(auth.uid()) AND status = 'published') 
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Function to auto-create SBW-9237 module when client is created
CREATE OR REPLACE FUNCTION public.create_sbw9237_module_for_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create unpublished SBW-9237 module for new client
  INSERT INTO public.client_sbw9237_modules (
    client_id,
    company_id,
    status,
    intro_custom_text,
    created_by
  ) VALUES (
    NEW.id,
    NEW.company_settings_id,
    'unpublished',
    'Welcome to your SB 553 Workplace Violence Prevention Training prepared specifically for ' || NEW.company_name || '.',
    auth.uid()
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create SBW-9237 module for new clients
CREATE TRIGGER create_sbw9237_module_on_client_creation
  AFTER INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.create_sbw9237_module_for_client();

-- Create modules for existing clients
INSERT INTO public.client_sbw9237_modules (client_id, company_id, status, intro_custom_text)
SELECT 
  c.id,
  c.company_settings_id,
  'unpublished',
  'Welcome to your SB 553 Workplace Violence Prevention Training prepared specifically for ' || c.company_name || '.'
FROM public.clients c
WHERE NOT EXISTS (
  SELECT 1 FROM public.client_sbw9237_modules csm WHERE csm.client_id = c.id
);

-- Add updated_at trigger
CREATE TRIGGER update_client_sbw9237_modules_updated_at
  BEFORE UPDATE ON public.client_sbw9237_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();