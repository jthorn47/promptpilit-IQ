-- Add publishing scope to training_modules table
ALTER TABLE public.training_modules 
ADD COLUMN IF NOT EXISTS publishing_scope text DEFAULT 'draft' CHECK (publishing_scope IN ('draft', 'all_clients', 'specific_clients'));

-- Create training_module_client_access table for client-specific publishing
CREATE TABLE IF NOT EXISTS public.training_module_client_access (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    training_module_id uuid NOT NULL,
    client_id uuid NOT NULL,
    is_published boolean DEFAULT false,
    published_at timestamp with time zone,
    published_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(training_module_id, client_id)
);

-- Add foreign key constraints
ALTER TABLE public.training_module_client_access
ADD CONSTRAINT fk_training_module_client_access_training_module
FOREIGN KEY (training_module_id) REFERENCES public.training_modules(id) ON DELETE CASCADE;

ALTER TABLE public.training_module_client_access
ADD CONSTRAINT fk_training_module_client_access_client
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- Enable RLS on training_module_client_access
ALTER TABLE public.training_module_client_access ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for training_module_client_access
CREATE POLICY "Super admins can manage all training module client access"
ON public.training_module_client_access
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their client training access"
ON public.training_module_client_access
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.clients c
        WHERE c.id = training_module_client_access.client_id
        AND has_company_role(auth.uid(), 'company_admin'::app_role, c.company_settings_id)
    )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_training_module_client_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_training_module_client_access_updated_at
    BEFORE UPDATE ON public.training_module_client_access
    FOR EACH ROW
    EXECUTE FUNCTION public.update_training_module_client_access_updated_at();

-- Add audit trail for training module publishing
CREATE TABLE IF NOT EXISTS public.training_module_publishing_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    training_module_id uuid NOT NULL,
    action_type text NOT NULL CHECK (action_type IN ('published', 'unpublished', 'scope_changed')),
    publishing_scope text NOT NULL,
    client_ids uuid[] DEFAULT '{}',
    performed_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);

-- Add foreign key for training_module_publishing_audit
ALTER TABLE public.training_module_publishing_audit
ADD CONSTRAINT fk_training_module_publishing_audit_training_module
FOREIGN KEY (training_module_id) REFERENCES public.training_modules(id) ON DELETE CASCADE;

-- Enable RLS on training_module_publishing_audit
ALTER TABLE public.training_module_publishing_audit ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for training_module_publishing_audit
CREATE POLICY "Super admins can view all training module publishing audit"
ON public.training_module_publishing_audit
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert training module publishing audit"
ON public.training_module_publishing_audit
FOR INSERT
WITH CHECK (true);