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

-- RLS Policies for company_ach_settings
CREATE POLICY "Company admins can manage their ACH settings"
ON public.company_ach_settings
FOR ALL
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for employee_bank_accounts
CREATE POLICY "Company admins can manage employee bank accounts"
ON public.employee_bank_accounts
FOR ALL
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for ach_batches
CREATE POLICY "Company admins can manage ACH batches"
ON public.ach_batches
FOR ALL
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
);

-- RLS Policies for ach_batch_entries
CREATE POLICY "Company users can view ACH batch entries"
ON public.ach_batch_entries
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.ach_batches ab
        WHERE ab.id = ach_batch_entries.batch_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, ab.company_id) OR
            has_role(auth.uid(), 'super_admin'::app_role)
        )
    )
);

CREATE POLICY "Company admins can manage ACH batch entries"
ON public.ach_batch_entries
FOR INSERT, UPDATE, DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.ach_batches ab
        WHERE ab.id = ach_batch_entries.batch_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, ab.company_id) OR
            has_role(auth.uid(), 'super_admin'::app_role)
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.ach_batches ab
        WHERE ab.id = ach_batch_entries.batch_id
        AND (
            has_company_role(auth.uid(), 'company_admin'::app_role, ab.company_id) OR
            has_role(auth.uid(), 'super_admin'::app_role)
        )
    )
);

-- RLS Policies for ach_audit_logs
CREATE POLICY "Company admins can view their ACH audit logs"
ON public.ach_audit_logs
FOR SELECT
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR
    has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "System can insert ACH audit logs"
ON public.ach_audit_logs
FOR INSERT
WITH CHECK (true);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_ach_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_ach_settings_updated_at
    BEFORE UPDATE ON public.company_ach_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ach_updated_at_column();

CREATE TRIGGER update_employee_bank_accounts_updated_at
    BEFORE UPDATE ON public.employee_bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ach_updated_at_column();

CREATE TRIGGER update_ach_batches_updated_at
    BEFORE UPDATE ON public.ach_batches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_ach_updated_at_column();

-- Function to validate routing numbers using checksum
CREATE OR REPLACE FUNCTION public.validate_routing_number(routing_number TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    sum_total INTEGER := 0;
    digit INTEGER;
    multiplier INTEGER;
BEGIN
    -- Must be exactly 9 digits
    IF length(routing_number) != 9 OR routing_number !~ '^[0-9]+$' THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate checksum: (3×d1 + 7×d2 + 1×d3 + 3×d4 + 7×d5 + 1×d6 + 3×d7 + 7×d8 + 1×d9) mod 10 = 0
    FOR i IN 1..9 LOOP
        digit := substring(routing_number FROM i FOR 1)::INTEGER;
        CASE (i - 1) % 3
            WHEN 0 THEN multiplier := 3;
            WHEN 1 THEN multiplier := 7;
            WHEN 2 THEN multiplier := 1;
        END CASE;
        sum_total := sum_total + (digit * multiplier);
    END LOOP;
    
    RETURN (sum_total % 10) = 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to generate NACHA file content
CREATE OR REPLACE FUNCTION public.generate_nacha_file(batch_id UUID)
RETURNS TEXT AS $$
DECLARE
    batch_record RECORD;
    company_record RECORD;
    entry_record RECORD;
    file_content TEXT := '';
    file_header TEXT;
    batch_header TEXT;
    entry_detail TEXT;
    batch_control TEXT;
    file_control TEXT;
    entry_count INTEGER := 0;
    total_debit DECIMAL(12,2) := 0;
    total_credit DECIMAL(12,2) := 0;
    entry_hash BIGINT := 0;
    current_date TEXT := to_char(now(), 'YYMMDD');
    current_time TEXT := to_char(now(), 'HHMM');
    trace_counter INTEGER := 1;
BEGIN
    -- Get batch information
    SELECT ab.*, cs.company_name
    INTO batch_record
    FROM public.ach_batches ab
    JOIN public.company_settings cs ON ab.company_id = cs.id
    WHERE ab.id = batch_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Batch not found';
    END IF;
    
    -- Get company ACH settings
    SELECT * INTO company_record
    FROM public.company_ach_settings
    WHERE company_id = batch_record.company_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Company ACH settings not configured';
    END IF;
    
    -- File Header Record (Type '1')
    file_header := '1' || -- Record Type Code
                  '01' || -- Priority Code
                  rpad(company_record.immediate_destination, 10, ' ') || -- Immediate Destination
                  rpad(company_record.immediate_origin, 10, ' ') || -- Immediate Origin
                  current_date || -- File Creation Date
                  current_time || -- File Creation Time
                  company_record.file_id_modifier || -- File ID Modifier
                  '094' || -- Record Size
                  '10' || -- Blocking Factor
                  '1' || -- Format Code
                  rpad(company_record.immediate_destination, 23, ' ') || -- Immediate Destination Name
                  rpad(company_record.company_name, 23, ' ') || -- Immediate Origin Name
                  rpad('', 8, ' '); -- Reference Code
    
    file_content := file_content || file_header || E'\n';
    
    -- Batch Header Record (Type '5')
    batch_header := '5' || -- Record Type Code
                   '200' || -- Service Class Code (200 = mixed debits and credits)
                   rpad(company_record.company_name, 16, ' ') || -- Company Name
                   rpad('', 20, ' ') || -- Company Discretionary Data
                   company_record.company_identification || -- Company Identification
                   'PPD' || -- Standard Entry Class Code
                   rpad(batch_record.batch_description, 10, ' ') || -- Company Entry Description
                   to_char(batch_record.effective_date, 'YYMMDD') || -- Company Descriptive Date
                   to_char(batch_record.effective_date, 'YYMMDD') || -- Effective Entry Date
                   '   ' || -- Settlement Date
                   '1' || -- Originator Status Code
                   substring(company_record.originating_dfi_routing, 1, 8) || -- Originating DFI Identification
                   lpad(batch_record.batch_number::TEXT, 7, '0'); -- Batch Number
    
    file_content := file_content || batch_header || E'\n';
    
    -- Entry Detail Records (Type '6')
    FOR entry_record IN
        SELECT 
            abe.*,
            CASE eba.account_type 
                WHEN 'checking' THEN '22'
                WHEN 'savings' THEN '32'
                ELSE '22'
            END as transaction_code
        FROM public.ach_batch_entries abe
        JOIN public.employee_bank_accounts eba ON abe.bank_account_id = eba.id
        WHERE abe.batch_id = batch_id
        ORDER BY abe.created_at
    LOOP
        entry_count := entry_count + 1;
        total_credit := total_credit + entry_record.amount;
        
        entry_detail := '6' || -- Record Type Code
                       entry_record.transaction_code || -- Transaction Code
                       substring(entry_record.trace_number, 1, 8) || -- Receiving DFI Identification
                       '0' || -- Check Digit (simplified)
                       rpad('XXXXXXXXXXXX', 17, 'X') || -- DFI Account Number (encrypted/masked)
                       lpad((entry_record.amount * 100)::BIGINT::TEXT, 10, '0') || -- Amount in cents
                       rpad(entry_record.individual_name, 22, ' ') || -- Individual Name
                       rpad('', 2, ' ') || -- Discretionary Data
                       '0' || -- Addenda Record Indicator
                       lpad(trace_counter::TEXT, 15, '0'); -- Trace Number
        
        file_content := file_content || entry_detail || E'\n';
        trace_counter := trace_counter + 1;
    END LOOP;
    
    -- Calculate entry hash (sum of routing numbers)
    SELECT COALESCE(SUM(substring(abe.trace_number, 1, 8)::BIGINT), 0) INTO entry_hash
    FROM public.ach_batch_entries abe
    WHERE abe.batch_id = batch_id;
    
    -- Batch Control Record (Type '8')
    batch_control := '8' || -- Record Type Code
                    '200' || -- Service Class Code
                    lpad(entry_count::TEXT, 6, '0') || -- Entry/Addenda Count
                    lpad((entry_hash % 10000000000)::TEXT, 10, '0') || -- Entry Hash
                    lpad('0', 12, '0') || -- Total Debit Entry Dollar Amount
                    lpad((total_credit * 100)::BIGINT::TEXT, 12, '0') || -- Total Credit Entry Dollar Amount
                    company_record.company_identification || -- Company Identification
                    rpad('', 19, ' ') || -- Message Authentication Code
                    rpad('', 6, ' ') || -- Reserved
                    substring(company_record.originating_dfi_routing, 1, 8) || -- Originating DFI Identification
                    lpad(batch_record.batch_number::TEXT, 7, '0'); -- Batch Number
    
    file_content := file_content || batch_control || E'\n';
    
    -- File Control Record (Type '9')
    file_control := '9' || -- Record Type Code
                   lpad('1', 6, '0') || -- Batch Count
                   lpad((entry_count / 10 + 1)::TEXT, 6, '0') || -- Block Count
                   lpad(entry_count::TEXT, 8, '0') || -- Entry/Addenda Count
                   lpad((entry_hash % 10000000000)::TEXT, 10, '0') || -- Entry Hash
                   lpad('0', 12, '0') || -- Total Debit Entry Dollar Amount
                   lpad((total_credit * 100)::BIGINT::TEXT, 12, '0') || -- Total Credit Entry Dollar Amount
                   rpad('', 39, ' '); -- Reserved
    
    file_content := file_content || file_control || E'\n';
    
    -- Update batch with calculated totals
    UPDATE public.ach_batches
    SET 
        total_credit_amount = total_credit,
        entry_hash = entry_hash,
        total_entries = entry_count,
        nacha_file_content = file_content,
        status = 'generated',
        generated_at = now()
    WHERE id = batch_id;
    
    RETURN file_content;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;