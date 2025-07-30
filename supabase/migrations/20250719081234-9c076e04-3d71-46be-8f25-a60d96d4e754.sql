
-- Create client_payroll_settings table
CREATE TABLE public.client_payroll_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    pay_frequency TEXT DEFAULT 'bi_weekly' CHECK (pay_frequency IN ('weekly', 'bi_weekly', 'semi_monthly', 'monthly')),
    pay_group_id UUID,
    default_earnings_ids UUID[] DEFAULT '{}',
    default_deductions_ids UUID[] DEFAULT '{}',
    fein TEXT,
    suta_account_number TEXT,
    local_tax_config JSONB DEFAULT '{}',
    workers_comp_code_ids UUID[] DEFAULT '{}',
    direct_deposit_required BOOLEAN DEFAULT false,
    pto_policy_id UUID,
    pay_stub_delivery_method TEXT DEFAULT 'email' CHECK (pay_stub_delivery_method IN ('email', 'print', 'portal', 'both')),
    payroll_contact_id UUID,
    custom_overrides JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    UNIQUE(client_id)
);

-- Enable RLS
ALTER TABLE public.client_payroll_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for client_payroll_settings
CREATE POLICY "Super admins can manage all client payroll settings"
ON public.client_payroll_settings
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their client payroll settings"
ON public.client_payroll_settings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.clients c
        WHERE c.id = client_payroll_settings.client_id
        AND c.company_settings_id = get_user_company_id(auth.uid())
    )
);

-- Create indexes for better performance
CREATE INDEX idx_client_payroll_settings_client_id ON public.client_payroll_settings(client_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_client_payroll_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_client_payroll_settings_updated_at
    BEFORE UPDATE ON public.client_payroll_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_client_payroll_settings_updated_at();

-- Create supporting tables for master data
CREATE TABLE public.pay_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.earnings_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    is_taxable BOOLEAN DEFAULT true,
    is_overtime BOOLEAN DEFAULT false,
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.deduction_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    is_pre_tax BOOLEAN DEFAULT false,
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.workers_comp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    description TEXT,
    rate DECIMAL(5,4),
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.pto_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    accrual_rate DECIMAL(5,2),
    max_carryover DECIMAL(5,2),
    company_id UUID REFERENCES public.company_settings(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on supporting tables
ALTER TABLE public.pay_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deduction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers_comp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pto_policies ENABLE ROW LEVEL SECURITY;

-- Create policies for supporting tables (similar pattern for all)
CREATE POLICY "Company users can view their pay groups"
ON public.pay_groups FOR SELECT
USING (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their pay groups"
ON public.pay_groups FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Similar policies for other tables
CREATE POLICY "Company users can view their earnings types"
ON public.earnings_types FOR SELECT
USING (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their earnings types"
ON public.earnings_types FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company users can view their deduction types"
ON public.deduction_types FOR SELECT
USING (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their deduction types"
ON public.deduction_types FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company users can view their workers comp codes"
ON public.workers_comp_codes FOR SELECT
USING (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their workers comp codes"
ON public.workers_comp_codes FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company users can view their PTO policies"
ON public.pto_policies FOR SELECT
USING (company_id = get_user_company_id(auth.uid()) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage their PTO policies"
ON public.pto_policies FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));
