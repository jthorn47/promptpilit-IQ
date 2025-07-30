-- Create client module access table to track which modules are enabled per client
CREATE TABLE public.client_module_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    module_type TEXT NOT NULL CHECK (module_type IN ('platform', 'training')),
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    enabled_by UUID REFERENCES auth.users(id),
    enabled_at TIMESTAMP WITH TIME ZONE,
    disabled_at TIMESTAMP WITH TIME ZONE,
    configuration_data JSONB DEFAULT '{}',
    setup_completed BOOLEAN DEFAULT false,
    setup_completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(client_id, module_id)
);

-- Enable RLS
ALTER TABLE public.client_module_access ENABLE ROW LEVEL SECURITY;

-- Create policies for client module access
CREATE POLICY "Super admins can manage all client module access"
ON public.client_module_access
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Internal staff can manage client module access"
ON public.client_module_access
FOR ALL
USING (has_role(auth.uid(), 'internal_staff'::app_role));

CREATE POLICY "Company admins can view their client module access"
ON public.client_module_access
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.clients c
        WHERE c.id = client_module_access.client_id
        AND c.company_settings_id = get_user_company_id(auth.uid())
    )
);

-- Create training modules table to store all available training modules
CREATE TABLE public.training_modules_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT false,
    is_beta BOOLEAN DEFAULT false,
    is_coming_soon BOOLEAN DEFAULT false,
    requires_setup BOOLEAN DEFAULT false,
    setup_wizard_path TEXT,
    dependencies TEXT[] DEFAULT '{}',
    icon TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default training modules
INSERT INTO public.training_modules_catalog (module_id, name, description, category, is_premium, requires_setup, icon) VALUES
('sbw9237', 'SBW-9237: Workplace Violence Prevention', 'California SB 553 compliant training module with SCORM content and WPV plan review', 'safety', false, true, 'Shield'),
('harassment_prevention', 'Harassment Prevention Training', 'Comprehensive workplace harassment prevention and reporting training', 'hr', false, true, 'Users'),
('safety_training', 'General Safety Training', 'Basic workplace safety protocols and emergency procedures', 'safety', false, true, 'Heart'),
('compliance_basics', 'Compliance Fundamentals', 'Essential compliance training for all employees', 'compliance', false, false, 'FileText');

-- Create function to sync module access when a client is created
CREATE OR REPLACE FUNCTION public.create_default_client_modules()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert platform modules for new client
    INSERT INTO public.client_module_access (client_id, module_id, module_type, is_enabled)
    SELECT 
        NEW.id,
        unnest(ARRAY['lms', 'assessments', 'payroll', 'ats', 'onboarding', 'benefits', 'performance', 'scheduling', 'processing_schedules', 'express_tracking', 'hr_management', 'workers_comp', 'time_attendance', 'wpv_wizard', 'crm', 'compliance', 'reports', 'business_intelligence']),
        'platform',
        false;
    
    -- Insert training modules for new client
    INSERT INTO public.client_module_access (client_id, module_id, module_type, is_enabled)
    SELECT 
        NEW.id,
        tm.module_id,
        'training',
        false
    FROM public.training_modules_catalog tm;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create module access for new clients
CREATE TRIGGER create_client_modules_trigger
    AFTER INSERT ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_client_modules();

-- Create function to get client module summary
CREATE OR REPLACE FUNCTION public.get_client_module_summary(client_uuid UUID)
RETURNS TABLE (
    total_modules INTEGER,
    enabled_modules INTEGER,
    platform_modules INTEGER,
    training_modules INTEGER,
    setup_pending INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_modules,
        SUM(CASE WHEN is_enabled THEN 1 ELSE 0 END)::INTEGER as enabled_modules,
        SUM(CASE WHEN module_type = 'platform' THEN 1 ELSE 0 END)::INTEGER as platform_modules,
        SUM(CASE WHEN module_type = 'training' THEN 1 ELSE 0 END)::INTEGER as training_modules,
        SUM(CASE WHEN is_enabled AND NOT setup_completed THEN 1 ELSE 0 END)::INTEGER as setup_pending
    FROM public.client_module_access
    WHERE client_id = client_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add update trigger for timestamps
CREATE TRIGGER update_client_module_access_updated_at
    BEFORE UPDATE ON public.client_module_access
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();