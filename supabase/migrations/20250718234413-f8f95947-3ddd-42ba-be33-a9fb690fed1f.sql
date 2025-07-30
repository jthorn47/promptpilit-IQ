-- Create client module settings table for universal settings schema
CREATE TABLE public.client_module_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0.0',
    settings JSONB NOT NULL DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(client_id, module_name)
);

-- Create client settings audit table for tracking changes
CREATE TABLE public.client_settings_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL,
    module_name TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'reset', 'deleted')),
    old_version TEXT,
    new_version TEXT,
    old_settings JSONB,
    new_settings JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    change_summary TEXT,
    ip_address INET,
    user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.client_module_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_settings_audit ENABLE ROW LEVEL SECURITY;

-- Create policies for client_module_settings
CREATE POLICY "Super admins can manage all client settings"
ON public.client_module_settings
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their client settings"
ON public.client_module_settings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.clients c
        WHERE c.id = client_module_settings.client_id
        AND c.company_settings_id = get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Payroll managers can view and update payroll settings"
ON public.client_module_settings
FOR ALL
USING (
    module_name LIKE 'HaaLO.%' AND
    (
        has_role(auth.uid(), 'super_admin'::app_role) OR
        has_role(auth.uid(), 'company_admin'::app_role) OR
        has_role(auth.uid(), 'payroll_manager'::app_role)
    ) AND
    EXISTS (
        SELECT 1 FROM public.clients c
        WHERE c.id = client_module_settings.client_id
        AND c.company_settings_id = get_user_company_id(auth.uid())
    )
);

-- Create policies for client_settings_audit
CREATE POLICY "Super admins can view all settings audit"
ON public.client_settings_audit
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can view their client settings audit"
ON public.client_settings_audit
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.clients c
        WHERE c.id = client_settings_audit.client_id
        AND c.company_settings_id = get_user_company_id(auth.uid())
    )
);

CREATE POLICY "System can insert settings audit"
ON public.client_settings_audit
FOR INSERT
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_client_module_settings_client_module ON public.client_module_settings(client_id, module_name);
CREATE INDEX idx_client_module_settings_module ON public.client_module_settings(module_name);
CREATE INDEX idx_client_settings_audit_client ON public.client_settings_audit(client_id);
CREATE INDEX idx_client_settings_audit_module ON public.client_settings_audit(module_name);
CREATE INDEX idx_client_settings_audit_changed_at ON public.client_settings_audit(changed_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_client_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_client_settings_updated_at
    BEFORE UPDATE ON public.client_module_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_client_settings_updated_at();

-- Create function to log settings changes
CREATE OR REPLACE FUNCTION public.log_client_settings_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log settings changes
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.client_settings_audit (
            client_id, module_name, action_type, new_version, new_settings, changed_by
        ) VALUES (
            NEW.client_id, NEW.module_name, 'created', NEW.version, NEW.settings, NEW.updated_by
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.client_settings_audit (
            client_id, module_name, action_type, old_version, new_version, old_settings, new_settings, changed_by
        ) VALUES (
            NEW.client_id, NEW.module_name, 'updated', OLD.version, NEW.version, OLD.settings, NEW.settings, NEW.updated_by
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.client_settings_audit (
            client_id, module_name, action_type, old_version, old_settings, changed_by
        ) VALUES (
            OLD.client_id, OLD.module_name, 'deleted', OLD.version, OLD.settings, auth.uid()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic audit logging
CREATE TRIGGER log_client_settings_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.client_module_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.log_client_settings_change();

-- Create function to get client settings with fallback to defaults
CREATE OR REPLACE FUNCTION public.get_client_module_settings(
    p_client_id UUID,
    p_module_name TEXT,
    p_default_settings JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    result_settings JSONB;
BEGIN
    SELECT settings INTO result_settings
    FROM public.client_module_settings
    WHERE client_id = p_client_id AND module_name = p_module_name;
    
    IF result_settings IS NULL THEN
        RETURN p_default_settings;
    END IF;
    
    RETURN result_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset client settings to default
CREATE OR REPLACE FUNCTION public.reset_client_module_settings(
    p_client_id UUID,
    p_module_name TEXT,
    p_default_settings JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    -- Update existing record or insert new one with default settings
    INSERT INTO public.client_module_settings (
        client_id, module_name, settings, updated_by
    ) VALUES (
        p_client_id, p_module_name, p_default_settings, auth.uid()
    )
    ON CONFLICT (client_id, module_name)
    DO UPDATE SET
        settings = p_default_settings,
        updated_by = auth.uid(),
        last_updated = now();
        
    -- Log the reset action
    INSERT INTO public.client_settings_audit (
        client_id, module_name, action_type, new_settings, changed_by, change_summary
    ) VALUES (
        p_client_id, p_module_name, 'reset', p_default_settings, auth.uid(), 'Settings reset to default values'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;