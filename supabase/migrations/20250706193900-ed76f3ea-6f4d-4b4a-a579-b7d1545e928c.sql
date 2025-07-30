-- Create SSO configuration table for enterprise identity providers
CREATE TABLE public.sso_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE NOT NULL,
    provider_name TEXT NOT NULL, -- 'azure_ad', 'okta', 'google_workspace', 'saml_generic'
    provider_type TEXT NOT NULL DEFAULT 'saml', -- 'saml', 'oidc'
    
    -- SAML Configuration
    saml_entity_id TEXT,
    saml_sso_url TEXT,
    saml_certificate TEXT,
    saml_attribute_mapping JSONB DEFAULT '{}',
    
    -- OIDC Configuration  
    oidc_client_id TEXT,
    oidc_client_secret TEXT,
    oidc_discovery_url TEXT,
    oidc_scopes TEXT[] DEFAULT ARRAY['openid', 'email', 'profile'],
    
    -- Common settings
    is_active BOOLEAN NOT NULL DEFAULT false,
    auto_provision_users BOOLEAN NOT NULL DEFAULT true,
    default_role app_role NOT NULL DEFAULT 'learner',
    domain_restrictions TEXT[], -- Email domains that can use this SSO
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    
    UNIQUE(company_id, provider_name)
);

-- Create SSO user mappings table to track SSO-provisioned users
CREATE TABLE public.sso_user_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sso_configuration_id UUID REFERENCES public.sso_configurations(id) ON DELETE CASCADE NOT NULL,
    external_user_id TEXT NOT NULL, -- ID from the SSO provider
    external_attributes JSONB DEFAULT '{}', -- Attributes from SSO provider
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(sso_configuration_id, external_user_id),
    UNIQUE(user_id, sso_configuration_id)
);

-- Create SSO sessions table for tracking SSO login sessions
CREATE TABLE public.sso_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    sso_configuration_id UUID REFERENCES public.sso_configurations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    saml_request_id TEXT,
    relay_state TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'expired'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sso_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sso_user_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sso_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SSO configurations
CREATE POLICY "Super admins can manage all SSO configurations"
ON public.sso_configurations
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their SSO configurations"
ON public.sso_configurations
FOR ALL
USING (
    has_role(auth.uid(), 'company_admin') AND
    company_id = get_user_company_id(auth.uid())
);

-- RLS Policies for SSO user mappings
CREATE POLICY "Super admins can view all SSO user mappings"
ON public.sso_user_mappings
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can view their company's SSO user mappings"
ON public.sso_user_mappings
FOR SELECT
USING (
    has_role(auth.uid(), 'company_admin') AND
    EXISTS (
        SELECT 1 FROM public.sso_configurations sc
        WHERE sc.id = sso_configuration_id
        AND sc.company_id = get_user_company_id(auth.uid())
    )
);

CREATE POLICY "Users can view their own SSO mappings"
ON public.sso_user_mappings
FOR SELECT
USING (user_id = auth.uid());

-- RLS Policies for SSO sessions
CREATE POLICY "Super admins can manage all SSO sessions"
ON public.sso_sessions
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can manage SSO sessions"
ON public.sso_sessions
FOR ALL
USING (true)
WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_sso_configurations_updated_at
    BEFORE UPDATE ON public.sso_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sso_user_mappings_updated_at
    BEFORE UPDATE ON public.sso_user_mappings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sso_sessions_updated_at
    BEFORE UPDATE ON public.sso_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle SSO user provisioning
CREATE OR REPLACE FUNCTION public.provision_sso_user(
    p_email TEXT,
    p_first_name TEXT DEFAULT NULL,
    p_last_name TEXT DEFAULT NULL,
    p_sso_config_id UUID,
    p_external_user_id TEXT,
    p_external_attributes JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
    v_default_role app_role;
    v_existing_user_id UUID;
BEGIN
    -- Get SSO configuration details
    SELECT company_id, default_role INTO v_company_id, v_default_role
    FROM public.sso_configurations
    WHERE id = p_sso_config_id;
    
    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'Invalid SSO configuration ID';
    END IF;
    
    -- Check if user already exists
    SELECT id INTO v_existing_user_id
    FROM auth.users
    WHERE email = p_email;
    
    IF v_existing_user_id IS NOT NULL THEN
        -- Update existing user mapping
        INSERT INTO public.sso_user_mappings (
            user_id, sso_configuration_id, external_user_id, external_attributes, last_login_at
        )
        VALUES (
            v_existing_user_id, p_sso_config_id, p_external_user_id, p_external_attributes, now()
        )
        ON CONFLICT (user_id, sso_configuration_id)
        DO UPDATE SET
            external_user_id = EXCLUDED.external_user_id,
            external_attributes = EXCLUDED.external_attributes,
            last_login_at = now(),
            updated_at = now();
            
        RETURN v_existing_user_id;
    END IF;
    
    -- Create new user (this will be handled by the application layer)
    -- For now, we'll return NULL to indicate user needs to be created
    RETURN NULL;
END;
$$;