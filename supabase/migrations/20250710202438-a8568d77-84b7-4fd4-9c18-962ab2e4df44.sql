-- ACH Direct Deposit Processing Module Database Schema

-- Company ACH Configuration
CREATE TABLE public.company_ach_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_identification TEXT NOT NULL, -- TIN or assigned company ID
    originating_dfi_routing TEXT NOT NULL, -- Company's bank routing number
    immediate_destination TEXT NOT NULL, -- Receiving bank for submission
    immediate_origin TEXT NOT NULL, -- Company identifier for ACH origin
    batch_number_sequence INTEGER DEFAULT 1,
    file_id_modifier CHAR(1) DEFAULT 'A',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(company_id)
);

-- Employee Bank Accounts (with encryption)
CREATE TABLE public.employee_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
    account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings')),
    routing_number_encrypted TEXT NOT NULL, -- Encrypted routing number
    account_number_encrypted TEXT NOT NULL, -- Encrypted account number
    deposit_type TEXT NOT NULL DEFAULT 'amount' CHECK (deposit_type IN ('amount', 'percentage', 'remainder')),
    deposit_amount DECIMAL(10,2), -- Amount if fixed amount
    deposit_percentage DECIMAL(5,2), -- Percentage if percentage-based
    deposit_priority INTEGER DEFAULT 1, -- Order for multiple accounts
    account_nickname TEXT, -- Optional name for account
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- ACH Batches (tracking file generations)
CREATE TABLE public.ach_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
    batch_number INTEGER NOT NULL,
    effective_date DATE NOT NULL,
    batch_description TEXT NOT NULL DEFAULT 'PAYROLL',
    total_debit_amount DECIMAL(12,2) DEFAULT 0,
    total_credit_amount DECIMAL(12,2) DEFAULT 0,
    entry_hash BIGINT DEFAULT 0,
    total_entries INTEGER DEFAULT 0,
    file_name TEXT,
    nacha_file_content TEXT, -- Store the generated NACHA file content
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'exported', 'submitted', 'processed', 'rejected')),
    generated_at TIMESTAMP WITH TIME ZONE,
    exported_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Individual ACH Entries within batches
CREATE TABLE public.ach_batch_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.ach_batches(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL,
    bank_account_id UUID NOT NULL REFERENCES public.employee_bank_accounts(id),
    transaction_code TEXT NOT NULL, -- 22=checking credit, 32=savings credit, etc.
    amount DECIMAL(10,2) NOT NULL,
    individual_name TEXT NOT NULL,
    trace_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'returned', 'failed')),
    return_reason_code TEXT,
    return_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ACH Audit Trail
CREATE TABLE public.ach_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.company_settings(id),
    batch_id UUID REFERENCES public.ach_batches(id),
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    performed_by UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    action_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_employee_bank_accounts_employee_id ON public.employee_bank_accounts(employee_id);
CREATE INDEX idx_employee_bank_accounts_company_id ON public.employee_bank_accounts(company_id);
CREATE INDEX idx_ach_batches_company_id ON public.ach_batches(company_id);
CREATE INDEX idx_ach_batches_status ON public.ach_batches(status);
CREATE INDEX idx_ach_batch_entries_batch_id ON public.ach_batch_entries(batch_id);
CREATE INDEX idx_ach_audit_logs_company_id ON public.ach_audit_logs(company_id);
CREATE INDEX idx_ach_audit_logs_created_at ON public.ach_audit_logs(created_at);

-- Enable RLS on all tables
ALTER TABLE public.company_ach_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ach_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ach_batch_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ach_audit_logs ENABLE ROW LEVEL SECURITY;