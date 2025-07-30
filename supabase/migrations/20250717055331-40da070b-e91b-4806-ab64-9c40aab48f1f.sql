-- Create onboarding profiles table
CREATE TABLE public.onboarding_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.company_settings(id),
    legal_company_name TEXT,
    ein TEXT,
    business_address JSONB,
    entity_type TEXT,
    industry TEXT,
    naics_code TEXT,
    
    -- Tax accounts
    federal_ein TEXT,
    state_withholding_account TEXT,
    state_unemployment_id TEXT,
    local_tax_ids JSONB DEFAULT '[]'::JSONB,
    power_of_attorney_docs TEXT[],
    
    -- Banking
    bank_account_holder TEXT,
    routing_number TEXT,
    account_number TEXT,
    bank_verification_doc TEXT,
    ach_authorized BOOLEAN DEFAULT false,
    
    -- Service plan
    service_plan_type TEXT, -- ASO or PEO
    selected_addons TEXT[],
    monthly_pricing JSONB,
    
    -- Status and scoring
    current_step INTEGER DEFAULT 1,
    onboarding_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft', -- draft, in_progress, completed, active
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create onboarding progress tracking
CREATE TABLE public.onboarding_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    onboarding_profile_id UUID REFERENCES public.onboarding_profiles(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    validation_errors JSONB DEFAULT '[]'::JSONB,
    halo_alerts JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create onboarding logs for HALO tracking
CREATE TABLE public.onboarding_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    onboarding_profile_id UUID REFERENCES public.onboarding_profiles(id) ON DELETE CASCADE,
    step_number INTEGER,
    log_type TEXT NOT NULL, -- validation, alert, recommendation, error
    severity TEXT DEFAULT 'info', -- info, warning, error, critical
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::JSONB,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID
);

-- Create employee import staging table
CREATE TABLE public.onboarding_employee_imports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    onboarding_profile_id UUID REFERENCES public.onboarding_profiles(id) ON DELETE CASCADE,
    file_name TEXT,
    file_url TEXT,
    import_data JSONB,
    validation_results JSONB DEFAULT '{}'::JSONB,
    status TEXT DEFAULT 'pending', -- pending, validated, imported, error
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_employee_imports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_profiles
CREATE POLICY "Company admins can manage their onboarding profiles"
ON public.onboarding_profiles
FOR ALL
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
    has_role(auth.uid(), 'super_admin'::app_role) OR
    created_by = auth.uid()
);

-- RLS Policies for onboarding_progress
CREATE POLICY "Users can manage their onboarding progress"
ON public.onboarding_progress
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.onboarding_profiles op
        WHERE op.id = onboarding_progress.onboarding_profile_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, op.company_id) OR 
            has_role(auth.uid(), 'super_admin'::app_role) OR
            op.created_by = auth.uid()
        )
    )
);

-- RLS Policies for onboarding_logs
CREATE POLICY "Users can view their onboarding logs"
ON public.onboarding_logs
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.onboarding_profiles op
        WHERE op.id = onboarding_logs.onboarding_profile_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, op.company_id) OR 
            has_role(auth.uid(), 'super_admin'::app_role) OR
            op.created_by = auth.uid()
        )
    )
);

-- RLS Policies for onboarding_employee_imports
CREATE POLICY "Users can manage their employee imports"
ON public.onboarding_employee_imports
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.onboarding_profiles op
        WHERE op.id = onboarding_employee_imports.onboarding_profile_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, op.company_id) OR 
            has_role(auth.uid(), 'super_admin'::app_role) OR
            op.created_by = auth.uid()
        )
    )
);

-- Create update trigger for onboarding_profiles
CREATE OR REPLACE FUNCTION public.update_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_profiles_updated_at
    BEFORE UPDATE ON public.onboarding_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_onboarding_updated_at();

CREATE TRIGGER update_onboarding_progress_updated_at
    BEFORE UPDATE ON public.onboarding_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_onboarding_updated_at();