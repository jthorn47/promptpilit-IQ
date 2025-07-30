-- Remove client-specific tax engine integrations and create global tax engine settings

-- First, create a global tax engine settings table
CREATE TABLE public.global_tax_engine_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_name TEXT NOT NULL, -- 'symmetry', 'avalara', 'taxjar', etc.
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  configuration JSONB NOT NULL DEFAULT '{}',
  credentials JSONB NOT NULL DEFAULT '{}',
  webhook_url TEXT,
  webhook_secret TEXT,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.global_tax_engine_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage global tax engine settings
CREATE POLICY "Super admins can manage global tax engine settings"
  ON public.global_tax_engine_settings
  FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- All authenticated users can view the active tax engine settings
CREATE POLICY "Users can view active global tax engine settings"
  ON public.global_tax_engine_settings
  FOR SELECT
  USING (is_active = true);

-- Create updated_at trigger
CREATE TRIGGER update_global_tax_engine_settings_updated_at
  BEFORE UPDATE ON public.global_tax_engine_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payroll_updated_at_column();

-- Remove tax-specific integration providers and related data
-- First, delete any existing tax integrations
DELETE FROM public.integrations 
WHERE provider_id IN (
  SELECT id FROM public.integration_providers WHERE category = 'tax'
);

-- Delete tax integration providers
DELETE FROM public.integration_providers WHERE category = 'tax';

-- Insert the default tax engine (Symmetry as the primary one)
INSERT INTO public.global_tax_engine_settings (
  provider_name,
  display_name,
  is_active,
  configuration,
  credentials,
  created_by
) VALUES (
  'symmetry',
  'Symmetry Tax Engine',
  true,
  '{
    "environment": "sandbox",
    "version": "2024.1"
  }',
  '{}',
  '00000000-0000-0000-0000-000000000000'::UUID
);

-- Add comment to document the change
COMMENT ON TABLE public.global_tax_engine_settings IS 'Global tax engine configuration - only one active tax engine at a time for the entire platform';