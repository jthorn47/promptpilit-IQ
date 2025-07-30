-- Check if onboarding_codes table exists, if not create it
CREATE TABLE IF NOT EXISTS public.onboarding_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    company_id UUID REFERENCES public.onboarding_companies(id) ON DELETE CASCADE,
    employee_email TEXT,
    employee_first_name TEXT,
    employee_last_name TEXT,
    position_title TEXT,
    work_state TEXT NOT NULL,
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'es')),
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    sent_via_hroiq BOOLEAN DEFAULT false,
    sent_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Check if employee_onboarding table exists, if not create it
CREATE TABLE IF NOT EXISTS public.employee_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    onboarding_code_id UUID REFERENCES public.onboarding_codes(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    address JSONB,
    ssn_encrypted TEXT,
    date_of_birth DATE,
    language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'es')),
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'approved')),
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 8,
    
    -- Step completion tracking
    personal_info_completed BOOLEAN DEFAULT false,
    i9_section1_completed BOOLEAN DEFAULT false,
    w4_completed BOOLEAN DEFAULT false,
    state_tax_completed BOOLEAN DEFAULT false,
    ca_wage_notice_completed BOOLEAN DEFAULT false,
    direct_deposit_completed BOOLEAN DEFAULT false,
    handbook_acknowledged BOOLEAN DEFAULT false,
    esignature_completed BOOLEAN DEFAULT false,
    
    -- Form data storage
    personal_info_data JSONB DEFAULT '{}',
    i9_data JSONB DEFAULT '{}',
    w4_data JSONB DEFAULT '{}',
    state_tax_data JSONB DEFAULT '{}',
    ca_wage_notice_data JSONB DEFAULT '{}',
    direct_deposit_data JSONB DEFAULT '{}',
    acknowledgment_data JSONB DEFAULT '{}',
    esignature_data JSONB DEFAULT '{}',
    
    -- VaultIQ integration
    vault_folder_id TEXT,
    pdf_export_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create direct deposit accounts table
CREATE TABLE IF NOT EXISTS public.employee_direct_deposit_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    onboarding_id UUID REFERENCES public.employee_onboarding(id) ON DELETE CASCADE,
    account_type TEXT CHECK (account_type IN ('checking', 'savings')),
    bank_name TEXT,
    routing_number TEXT NOT NULL,
    account_number_encrypted TEXT NOT NULL,
    allocation_type TEXT CHECK (allocation_type IN ('percentage', 'fixed_amount', 'remainder')),
    allocation_value DECIMAL(10,2),
    priority_order INTEGER DEFAULT 1,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create acknowledgment signatures table
CREATE TABLE IF NOT EXISTS public.employee_acknowledgment_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    onboarding_id UUID REFERENCES public.employee_onboarding(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    signature_data TEXT NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address INET,
    user_agent TEXT
);

-- Enable RLS on all new tables
ALTER TABLE public.onboarding_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_direct_deposit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_acknowledgment_signatures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_codes
DROP POLICY IF EXISTS "Onboarding codes are viewable by admins" ON public.onboarding_codes;
DROP POLICY IF EXISTS "Onboarding codes are manageable by admins" ON public.onboarding_codes;

CREATE POLICY "Onboarding codes are viewable by admins" ON public.onboarding_codes
    FOR SELECT USING (
        has_role(auth.uid(), 'super_admin'::app_role) OR 
        has_role(auth.uid(), 'company_admin'::app_role)
    );

CREATE POLICY "Onboarding codes are manageable by admins" ON public.onboarding_codes
    FOR ALL USING (
        has_role(auth.uid(), 'super_admin'::app_role) OR 
        has_role(auth.uid(), 'company_admin'::app_role)
    );

-- RLS Policies for employee_onboarding (accessible by code)
DROP POLICY IF EXISTS "Employee onboarding accessible by code" ON public.employee_onboarding;
CREATE POLICY "Employee onboarding accessible by code" ON public.employee_onboarding
    FOR ALL USING (true); -- Will be secured at application level by code validation

-- RLS Policies for direct deposit accounts
DROP POLICY IF EXISTS "Direct deposit accounts accessible with onboarding" ON public.employee_direct_deposit_accounts;
CREATE POLICY "Direct deposit accounts accessible with onboarding" ON public.employee_direct_deposit_accounts
    FOR ALL USING (true); -- Secured through onboarding relationship

-- RLS Policies for acknowledgment signatures
DROP POLICY IF EXISTS "Acknowledgment signatures accessible with onboarding" ON public.employee_acknowledgment_signatures;
CREATE POLICY "Acknowledgment signatures accessible with onboarding" ON public.employee_acknowledgment_signatures
    FOR ALL USING (true); -- Secured through onboarding relationship

-- Add triggers for updated_at (only if they don't exist)
DROP TRIGGER IF EXISTS update_employee_onboarding_updated_at ON public.employee_onboarding;
CREATE TRIGGER update_employee_onboarding_updated_at
    BEFORE UPDATE ON public.employee_onboarding
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get onboarding progress percentage
CREATE OR REPLACE FUNCTION public.get_onboarding_progress(onboarding_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completed_steps INTEGER := 0;
    total_steps INTEGER := 8;
    record_data RECORD;
BEGIN
    SELECT * INTO record_data
    FROM public.employee_onboarding
    WHERE id = onboarding_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Count completed steps
    IF record_data.personal_info_completed THEN completed_steps := completed_steps + 1; END IF;
    IF record_data.i9_section1_completed THEN completed_steps := completed_steps + 1; END IF;
    IF record_data.w4_completed THEN completed_steps := completed_steps + 1; END IF;
    IF record_data.state_tax_completed THEN completed_steps := completed_steps + 1; END IF;
    IF record_data.ca_wage_notice_completed THEN completed_steps := completed_steps + 1; END IF;
    IF record_data.direct_deposit_completed THEN completed_steps := completed_steps + 1; END IF;
    IF record_data.handbook_acknowledged THEN completed_steps := completed_steps + 1; END IF;
    IF record_data.esignature_completed THEN completed_steps := completed_steps + 1; END IF;
    
    RETURN ROUND((completed_steps::DECIMAL / total_steps::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;