-- Create enum for language options
CREATE TYPE language_option AS ENUM ('EN', 'ES', 'BOTH');

-- Create onboarding_configs table
CREATE TABLE public.onboarding_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    welcome_text TEXT,
    intro_video_url TEXT,
    language_toggle language_option DEFAULT 'EN',
    next_steps_subject TEXT,
    next_steps_body TEXT,
    show_orientation_calendar_link BOOLEAN DEFAULT false,
    allow_employee_portal_access BOOLEAN DEFAULT false,
    job_custom_fields JSONB DEFAULT '[]'::jsonb,
    require_manager_approval BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID
);

-- Create acknowledgment_documents table
CREATE TABLE public.acknowledgment_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    onboarding_config_id UUID NOT NULL REFERENCES public.onboarding_configs(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_url TEXT,
    is_global BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training_assignments table for onboarding
CREATE TABLE public.onboarding_training_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    onboarding_config_id UUID NOT NULL REFERENCES public.onboarding_configs(id) ON DELETE CASCADE,
    training_module_id UUID,
    module_name TEXT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom_fields table for job-specific fields
CREATE TABLE public.onboarding_custom_fields (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    onboarding_config_id UUID NOT NULL REFERENCES public.onboarding_configs(id) ON DELETE CASCADE,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'select', 'checkbox', 'date', 'number')),
    field_options JSONB DEFAULT '[]'::jsonb,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.onboarding_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acknowledgment_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_custom_fields ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for onboarding_configs
CREATE POLICY "Client admins can manage their onboarding configs" 
ON public.onboarding_configs 
FOR ALL 
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, client_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create RLS policies for acknowledgment_documents
CREATE POLICY "Client admins can manage acknowledgment documents" 
ON public.acknowledgment_documents 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.onboarding_configs oc 
        WHERE oc.id = acknowledgment_documents.onboarding_config_id 
        AND (has_company_role(auth.uid(), 'company_admin'::app_role, oc.client_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
);

-- Create RLS policies for training_assignments
CREATE POLICY "Client admins can manage training assignments" 
ON public.onboarding_training_assignments 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.onboarding_configs oc 
        WHERE oc.id = onboarding_training_assignments.onboarding_config_id 
        AND (has_company_role(auth.uid(), 'company_admin'::app_role, oc.client_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
);

-- Create RLS policies for custom_fields
CREATE POLICY "Client admins can manage custom fields" 
ON public.onboarding_custom_fields 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.onboarding_configs oc 
        WHERE oc.id = onboarding_custom_fields.onboarding_config_id 
        AND (has_company_role(auth.uid(), 'company_admin'::app_role, oc.client_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_onboarding_configs_updated_at
    BEFORE UPDATE ON public.onboarding_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_updated_at();

CREATE TRIGGER update_acknowledgment_documents_updated_at
    BEFORE UPDATE ON public.acknowledgment_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_updated_at();

CREATE TRIGGER update_onboarding_training_assignments_updated_at
    BEFORE UPDATE ON public.onboarding_training_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_updated_at();

CREATE TRIGGER update_onboarding_custom_fields_updated_at
    BEFORE UPDATE ON public.onboarding_custom_fields
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_updated_at();