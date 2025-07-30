-- Create the missing client_module_access table first
CREATE TABLE IF NOT EXISTS public.client_module_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  module_type TEXT NOT NULL DEFAULT 'platform',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}',
  enabled_by UUID,
  enabled_at TIMESTAMP WITH TIME ZONE,
  disabled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, module_id, module_type)
);

-- Add RLS policies for client_module_access
ALTER TABLE public.client_module_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can manage module access"
ON public.client_module_access
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = client_module_access.client_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, c.company_settings_id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = client_module_access.client_id 
    AND (has_company_role(auth.uid(), 'company_admin'::app_role, c.company_settings_id) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_client_module_access_updated_at
  BEFORE UPDATE ON public.client_module_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payroll_updated_at_column();