-- VaultLayer: Time-aware, version-controlled payroll data schema
-- Phase 2 of CorePayrollEngine implementation

-- 1. EmployeeProfile - Version-controlled employee profiles
CREATE TABLE public.payroll_employee_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.payroll_employees(id) ON DELETE CASCADE,
    effective_date DATE NOT NULL,
    end_date DATE NULL,
    pay_type TEXT NOT NULL CHECK (pay_type IN ('hourly', 'salaried', 'commission', 'piece_rate')),
    base_rate DECIMAL(12,4) NOT NULL,
    overtime_rate DECIMAL(12,4) NULL,
    default_location_id UUID NULL REFERENCES public.company_locations(id),
    deduction_ids UUID[] DEFAULT '{}',
    tax_config JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'terminated', 'suspended')),
    version_id UUID NOT NULL DEFAULT gen_random_uuid(),
    created_by UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Ensure only one active profile per employee per effective date
    UNIQUE(employee_id, effective_date, version_id)
);

-- 2. EarningsDefinition - Types of earnings with calculation rules
CREATE TABLE public.payroll_earnings_definitions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    earning_type_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    calculation_method TEXT NOT NULL CHECK (calculation_method IN ('flat', 'multiplier', 'tiered', 'piece_rate', 'hourly')),
    taxability JSONB NOT NULL DEFAULT '{"fit": true, "sit": true, "fica": true, "medicare": true, "sdi": false, "futa": true, "suta": true}',
    include_in_ot_calc BOOLEAN NOT NULL DEFAULT true,
    is_overtime_eligible BOOLEAN NOT NULL DEFAULT false,
    multiplier_rate DECIMAL(6,4) DEFAULT 1.0000,
    effective_date DATE NOT NULL,
    end_date DATE NULL,
    version_id UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_settings(id),
    created_by UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(earning_type_id, effective_date, company_id, version_id)
);

-- 3. DeductionRule - Deduction configurations with versioning
CREATE TABLE public.payroll_deduction_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    deduction_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    deduction_type TEXT NOT NULL CHECK (deduction_type IN ('pre_tax', 'post_tax', 'garnishment')),
    calculation_method TEXT NOT NULL CHECK (calculation_method IN ('fixed_amount', 'percentage', 'tiered', 'formula')),
    calculation_config JSONB NOT NULL DEFAULT '{}',
    limit_type TEXT CHECK (limit_type IN ('per_pay_period', 'annual', 'lifetime', 'none')),
    limit_amount DECIMAL(12,4) NULL,
    applies_to_earnings TEXT[] DEFAULT '{}',
    priority_order INTEGER DEFAULT 100,
    effective_date DATE NOT NULL,
    end_date DATE NULL,
    version_id UUID NOT NULL DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_settings(id),
    created_by UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(deduction_id, effective_date, company_id, version_id)
);

-- 4. TaxTableEntry - Version-controlled tax tables
CREATE TABLE public.payroll_tax_tables (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    jurisdiction TEXT NOT NULL,
    jurisdiction_type TEXT NOT NULL CHECK (jurisdiction_type IN ('federal', 'state', 'local', 'county', 'city')),
    tax_type TEXT NOT NULL CHECK (tax_type IN ('income', 'social_security', 'medicare', 'unemployment', 'disability', 'transit')),
    filing_status TEXT NULL,
    tax_brackets JSONB NOT NULL DEFAULT '[]',
    rate_type TEXT NOT NULL CHECK (rate_type IN ('marginal', 'flat', 'supplemental')) DEFAULT 'marginal',
    flat_rate DECIMAL(8,6) NULL,
    wage_base DECIMAL(12,2) NULL,
    effective_date DATE NOT NULL,
    end_date DATE NULL,
    version_id UUID NOT NULL DEFAULT gen_random_uuid(),
    tax_year INTEGER NOT NULL,
    created_by UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(jurisdiction, tax_type, filing_status, effective_date, version_id)
);

-- 5. PayRun - Payroll run tracking with version mapping
CREATE TABLE public.payroll_pay_runs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pay_run_id TEXT NOT NULL,
    company_id UUID NOT NULL REFERENCES public.company_settings(id),
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    processed_on TIMESTAMP WITH TIME ZONE NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'committed', 'voided', 'error')),
    employee_count INTEGER DEFAULT 0,
    total_gross_pay DECIMAL(12,2) DEFAULT 0,
    total_net_pay DECIMAL(12,2) DEFAULT 0,
    total_employer_taxes DECIMAL(12,2) DEFAULT 0,
    version_id_map JSONB NOT NULL DEFAULT '{}',
    engine_version TEXT NOT NULL,
    calculation_metadata JSONB DEFAULT '{}',
    error_details TEXT NULL,
    processed_by UUID NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(pay_run_id, company_id)
);

-- 6. PayRunCalculations - Individual employee calculations per pay run
CREATE TABLE public.payroll_pay_run_calculations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pay_run_id UUID NOT NULL REFERENCES public.payroll_pay_runs(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.payroll_employees(id),
    employee_profile_version_id UUID NOT NULL,
    input_data JSONB NOT NULL,
    calculation_result JSONB NOT NULL,
    gross_pay DECIMAL(12,4) NOT NULL,
    net_pay DECIMAL(12,4) NOT NULL,
    total_taxes DECIMAL(12,4) NOT NULL,
    total_deductions DECIMAL(12,4) NOT NULL,
    employer_taxes DECIMAL(12,4) NOT NULL,
    earnings_breakdown JSONB NOT NULL DEFAULT '[]',
    deductions_breakdown JSONB NOT NULL DEFAULT '[]',
    taxes_breakdown JSONB NOT NULL DEFAULT '{}',
    calculation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    UNIQUE(pay_run_id, employee_id)
);

-- 7. AuditLog - Comprehensive change tracking
CREATE TABLE public.payroll_audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    audit_id UUID NOT NULL DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'activate', 'deactivate')),
    changed_by UUID NULL,
    change_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    before_state JSONB NULL,
    after_state JSONB NULL,
    reason_comment TEXT NULL,
    ip_address INET NULL,
    user_agent TEXT NULL,
    session_id TEXT NULL,
    company_id UUID NULL REFERENCES public.company_settings(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. SimulationLog - Simulation tracking (separate from production)
CREATE TABLE public.payroll_simulation_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sim_id UUID NOT NULL DEFAULT gen_random_uuid(),
    simulation_type TEXT NOT NULL CHECK (simulation_type IN ('single_employee', 'batch', 'what_if', 'historical')),
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    simulation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    simulated_by UUID NULL,
    company_id UUID NULL REFERENCES public.company_settings(id),
    linked_to_payrun_id UUID NULL REFERENCES public.payroll_pay_runs(id),
    simulation_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_employee_profiles_employee_effective ON public.payroll_employee_profiles(employee_id, effective_date DESC);
CREATE INDEX idx_employee_profiles_active ON public.payroll_employee_profiles(employee_id, status) WHERE status = 'active';
CREATE INDEX idx_earnings_definitions_type_effective ON public.payroll_earnings_definitions(earning_type_id, effective_date DESC);
CREATE INDEX idx_deduction_rules_id_effective ON public.payroll_deduction_rules(deduction_id, effective_date DESC);
CREATE INDEX idx_tax_tables_jurisdiction_effective ON public.payroll_tax_tables(jurisdiction, tax_type, effective_date DESC);
CREATE INDEX idx_pay_runs_company_period ON public.payroll_pay_runs(company_id, pay_period_start, pay_period_end);
CREATE INDEX idx_pay_run_calculations_run_employee ON public.payroll_pay_run_calculations(pay_run_id, employee_id);
CREATE INDEX idx_audit_logs_entity ON public.payroll_audit_logs(entity_type, entity_id, change_timestamp DESC);
CREATE INDEX idx_audit_logs_company_timestamp ON public.payroll_audit_logs(company_id, change_timestamp DESC);
CREATE INDEX idx_simulation_logs_company_timestamp ON public.payroll_simulation_logs(company_id, simulation_timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.payroll_employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_earnings_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_deduction_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_tax_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_pay_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_pay_run_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_simulation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company admins can manage employee profiles" ON public.payroll_employee_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.payroll_employees pe 
            WHERE pe.id = payroll_employee_profiles.employee_id 
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, pe.company_id) 
                 OR has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

CREATE POLICY "Company admins can manage earnings definitions" ON public.payroll_earnings_definitions
    FOR ALL USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage deduction rules" ON public.payroll_deduction_rules
    FOR ALL USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view tax tables" ON public.payroll_tax_tables
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage tax tables" ON public.payroll_tax_tables
    FOR ALL USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage pay runs" ON public.payroll_pay_runs
    FOR ALL USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can view pay run calculations" ON public.payroll_pay_run_calculations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.payroll_pay_runs pr 
            WHERE pr.id = payroll_pay_run_calculations.pay_run_id 
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, pr.company_id) 
                 OR has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

CREATE POLICY "System can insert pay run calculations" ON public.payroll_pay_run_calculations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Company admins can view audit logs" ON public.payroll_audit_logs
    FOR SELECT USING (
        (company_id IS NULL) OR 
        (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    );

CREATE POLICY "System can insert audit logs" ON public.payroll_audit_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Company admins can manage simulation logs" ON public.payroll_simulation_logs
    FOR ALL USING (
        (company_id IS NULL) OR 
        (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    );

-- Triggers for automatic audit logging
CREATE OR REPLACE FUNCTION public.log_payroll_changes()
RETURNS TRIGGER AS $$
DECLARE
    company_id_val UUID;
BEGIN
    -- Determine company_id based on table
    IF TG_TABLE_NAME = 'payroll_employee_profiles' THEN
        SELECT pe.company_id INTO company_id_val 
        FROM public.payroll_employees pe 
        WHERE pe.id = COALESCE(NEW.employee_id, OLD.employee_id);
    ELSIF TG_TABLE_NAME IN ('payroll_earnings_definitions', 'payroll_deduction_rules', 'payroll_pay_runs') THEN
        company_id_val := COALESCE(NEW.company_id, OLD.company_id);
    ELSE
        company_id_val := NULL;
    END IF;

    INSERT INTO public.payroll_audit_logs (
        entity_type, entity_id, change_type, changed_by, 
        before_state, after_state, company_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'create'
            WHEN 'UPDATE' THEN 'update'
            WHEN 'DELETE' THEN 'delete'
        END,
        auth.uid(),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        company_id_val
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit triggers
CREATE TRIGGER audit_employee_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.payroll_employee_profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_payroll_changes();

CREATE TRIGGER audit_earnings_definitions
    AFTER INSERT OR UPDATE OR DELETE ON public.payroll_earnings_definitions
    FOR EACH ROW EXECUTE FUNCTION public.log_payroll_changes();

CREATE TRIGGER audit_deduction_rules
    AFTER INSERT OR UPDATE OR DELETE ON public.payroll_deduction_rules
    FOR EACH ROW EXECUTE FUNCTION public.log_payroll_changes();

CREATE TRIGGER audit_pay_runs
    AFTER INSERT OR UPDATE OR DELETE ON public.payroll_pay_runs
    FOR EACH ROW EXECUTE FUNCTION public.log_payroll_changes();

-- Helper functions for version management
CREATE OR REPLACE FUNCTION public.get_current_employee_profile(p_employee_id UUID, p_effective_date DATE DEFAULT CURRENT_DATE)
RETURNS public.payroll_employee_profiles AS $$
DECLARE
    profile_record public.payroll_employee_profiles;
BEGIN
    SELECT * INTO profile_record
    FROM public.payroll_employee_profiles
    WHERE employee_id = p_employee_id
    AND effective_date <= p_effective_date
    AND (end_date IS NULL OR end_date > p_effective_date)
    AND status = 'active'
    ORDER BY effective_date DESC
    LIMIT 1;
    
    RETURN profile_record;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_tax_table(
    p_jurisdiction TEXT, 
    p_tax_type TEXT, 
    p_filing_status TEXT DEFAULT NULL,
    p_effective_date DATE DEFAULT CURRENT_DATE
)
RETURNS public.payroll_tax_tables AS $$
DECLARE
    tax_record public.payroll_tax_tables;
BEGIN
    SELECT * INTO tax_record
    FROM public.payroll_tax_tables
    WHERE jurisdiction = p_jurisdiction
    AND tax_type = p_tax_type
    AND (p_filing_status IS NULL OR filing_status = p_filing_status)
    AND effective_date <= p_effective_date
    AND (end_date IS NULL OR end_date > p_effective_date)
    ORDER BY effective_date DESC
    LIMIT 1;
    
    RETURN tax_record;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.end_date_current_version(
    p_table_name TEXT,
    p_record_id UUID,
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('UPDATE public.%I SET end_date = $1, updated_at = now() WHERE id = $2', p_table_name)
    USING p_end_date, p_record_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;