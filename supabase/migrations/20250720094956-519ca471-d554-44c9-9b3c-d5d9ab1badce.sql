-- Create comprehensive payroll employee management system

-- Create main payroll employees table
CREATE TABLE public.payroll_employee_master (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id uuid NOT NULL,
    
    -- Personal Info
    employee_number text UNIQUE,
    legal_first_name text NOT NULL,
    legal_middle_name text,
    legal_last_name text NOT NULL,
    preferred_name text,
    ssn_encrypted text,
    date_of_birth date,
    gender text,
    personal_email text,
    mobile_phone text,
    
    -- Address Info
    residential_address jsonb,
    work_location_id uuid,
    
    -- Employment Status
    employment_status text NOT NULL DEFAULT 'active',
    hire_date date NOT NULL,
    termination_date date,
    termination_reason text,
    
    -- Pay Setup
    pay_type text NOT NULL DEFAULT 'hourly', -- hourly, salary, commission, flat_rate
    pay_frequency text NOT NULL DEFAULT 'bi_weekly', -- weekly, bi_weekly, semi_monthly, monthly
    compensation_rate numeric NOT NULL DEFAULT 0,
    standard_hours_per_week numeric DEFAULT 40,
    overtime_eligible boolean DEFAULT true,
    shift_differential_rate numeric DEFAULT 0,
    shift_differential_type text DEFAULT 'percentage', -- percentage or amount
    pay_group_id uuid,
    
    -- Direct Deposit
    direct_deposit_enabled boolean DEFAULT false,
    
    -- Tax Setup
    federal_filing_status text,
    federal_allowances integer DEFAULT 0,
    additional_federal_withholding numeric DEFAULT 0,
    state_filing_status text,
    state_allowances integer DEFAULT 0,
    additional_state_withholding numeric DEFAULT 0,
    local_tax_code text,
    sui_state text,
    is_exempt_federal boolean DEFAULT false,
    is_exempt_state boolean DEFAULT false,
    tax_classification text DEFAULT 'w2', -- w2 or 1099
    
    -- Job & Org Info
    job_title text,
    department text,
    division text,
    region text,
    reports_to_id uuid,
    hire_type text DEFAULT 'regular', -- regular, temp, seasonal, contractor
    workers_comp_code text,
    eeo_job_classification text,
    internal_id text,
    badge_number text,
    
    -- Test Mode
    is_test_employee boolean DEFAULT false,
    
    -- Audit fields
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid,
    updated_by uuid
);

-- Create direct deposit splits table
CREATE TABLE public.payroll_employee_direct_deposits (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid NOT NULL REFERENCES public.payroll_employee_master(id) ON DELETE CASCADE,
    
    bank_name text NOT NULL,
    account_type text NOT NULL, -- checking, savings
    routing_number text NOT NULL,
    account_number_encrypted text NOT NULL,
    account_number_last_four text NOT NULL,
    
    allocation_type text NOT NULL DEFAULT 'percentage', -- percentage, amount, remainder
    allocation_value numeric DEFAULT 0,
    priority_order integer DEFAULT 1,
    
    is_active boolean DEFAULT true,
    is_primary boolean DEFAULT false,
    
    effective_date date DEFAULT CURRENT_DATE,
    end_date date,
    
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create employee deductions table
CREATE TABLE public.payroll_employee_deductions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid NOT NULL REFERENCES public.payroll_employee_master(id) ON DELETE CASCADE,
    deduction_type_id uuid,
    
    deduction_name text NOT NULL,
    deduction_code text,
    is_pre_tax boolean DEFAULT false,
    amount_type text NOT NULL DEFAULT 'amount', -- amount, percentage
    amount_value numeric NOT NULL DEFAULT 0,
    frequency text DEFAULT 'per_pay_period', -- per_pay_period, monthly, annual
    max_amount_per_year numeric,
    
    vendor_name text,
    garnishment_agency text,
    garnishment_type text, -- child_support, tax_levy, wage_garnishment
    
    effective_date date DEFAULT CURRENT_DATE,
    end_date date,
    is_active boolean DEFAULT true,
    
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create employee documents table
CREATE TABLE public.payroll_employee_documents (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid NOT NULL REFERENCES public.payroll_employee_master(id) ON DELETE CASCADE,
    
    document_type text NOT NULL, -- i9, w4, direct_deposit_form, offer_letter, state_forms
    document_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    file_type text,
    
    tags text[],
    uploaded_by uuid,
    upload_date timestamp with time zone DEFAULT now(),
    
    is_confidential boolean DEFAULT true,
    retention_date date,
    
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create employee notes table
CREATE TABLE public.payroll_employee_notes (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id uuid NOT NULL REFERENCES public.payroll_employee_master(id) ON DELETE CASCADE,
    
    note_text text NOT NULL,
    note_type text DEFAULT 'general', -- general, hr, payroll, performance
    is_confidential boolean DEFAULT false,
    
    mentioned_users uuid[],
    
    created_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_payroll_employee_master_company_id ON public.payroll_employee_master(company_id);
CREATE INDEX idx_payroll_employee_master_employee_number ON public.payroll_employee_master(employee_number);
CREATE INDEX idx_payroll_employee_master_employment_status ON public.payroll_employee_master(employment_status);
CREATE INDEX idx_payroll_employee_master_is_test ON public.payroll_employee_master(is_test_employee);
CREATE INDEX idx_payroll_employee_direct_deposits_employee_id ON public.payroll_employee_direct_deposits(employee_id);
CREATE INDEX idx_payroll_employee_deductions_employee_id ON public.payroll_employee_deductions(employee_id);
CREATE INDEX idx_payroll_employee_documents_employee_id ON public.payroll_employee_documents(employee_id);
CREATE INDEX idx_payroll_employee_notes_employee_id ON public.payroll_employee_notes(employee_id);

-- Enable RLS
ALTER TABLE public.payroll_employee_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_employee_direct_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_employee_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_employee_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company admins can manage their employees" ON public.payroll_employee_master
    FOR ALL USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage employee direct deposits" ON public.payroll_employee_direct_deposits
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.payroll_employee_master pem 
        WHERE pem.id = payroll_employee_direct_deposits.employee_id 
        AND (has_company_role(auth.uid(), 'company_admin'::app_role, pem.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    ));

CREATE POLICY "Company admins can manage employee deductions" ON public.payroll_employee_deductions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.payroll_employee_master pem 
        WHERE pem.id = payroll_employee_deductions.employee_id 
        AND (has_company_role(auth.uid(), 'company_admin'::app_role, pem.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    ));

CREATE POLICY "Company admins can manage employee documents" ON public.payroll_employee_documents
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.payroll_employee_master pem 
        WHERE pem.id = payroll_employee_documents.employee_id 
        AND (has_company_role(auth.uid(), 'company_admin'::app_role, pem.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    ));

CREATE POLICY "Company admins can manage employee notes" ON public.payroll_employee_notes
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.payroll_employee_master pem 
        WHERE pem.id = payroll_employee_notes.employee_id 
        AND (has_company_role(auth.uid(), 'company_admin'::app_role, pem.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
    ));

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_payroll_employee_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_payroll_employee_master_updated_at
    BEFORE UPDATE ON public.payroll_employee_master
    FOR EACH ROW
    EXECUTE FUNCTION public.update_payroll_employee_updated_at();

CREATE TRIGGER update_payroll_employee_direct_deposits_updated_at
    BEFORE UPDATE ON public.payroll_employee_direct_deposits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_payroll_employee_updated_at();

CREATE TRIGGER update_payroll_employee_deductions_updated_at
    BEFORE UPDATE ON public.payroll_employee_deductions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_payroll_employee_updated_at();

CREATE TRIGGER update_payroll_employee_notes_updated_at
    BEFORE UPDATE ON public.payroll_employee_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_payroll_employee_updated_at();