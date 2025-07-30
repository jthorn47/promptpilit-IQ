-- Create GL Tables for General Ledger Module

-- 1. GL Journals Table
CREATE TABLE public.gl_journals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    journal_number TEXT NOT NULL,
    date DATE NOT NULL,
    memo TEXT,
    source TEXT NOT NULL DEFAULT 'Manual', -- Manual, Payroll, AP, AR, etc.
    source_id UUID, -- Reference to source transaction
    batch_id UUID, -- Reference to gl_batches
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'Draft', -- Draft, Posted
    posted_at TIMESTAMP WITH TIME ZONE,
    posted_by UUID,
    total_debits DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_credits DECIMAL(15,2) NOT NULL DEFAULT 0,
    is_balanced BOOLEAN NOT NULL DEFAULT false,
    reversal_of UUID, -- If this is a reversal entry
    UNIQUE(company_id, journal_number)
);

-- 2. GL Entries Table
CREATE TABLE public.gl_entries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    journal_id UUID NOT NULL REFERENCES public.gl_journals(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    account_id UUID NOT NULL REFERENCES public.chart_of_accounts(id),
    debit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    credit_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    description TEXT,
    entity_type TEXT, -- Client, Employee, Vendor, Customer, etc.
    entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT check_debit_or_credit CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR 
        (credit_amount > 0 AND debit_amount = 0)
    )
);

-- 3. GL Batches Table
CREATE TABLE public.gl_batches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    batch_name TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Draft', -- Draft, Ready, Posted, Cancelled
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    posted_by UUID,
    posted_at TIMESTAMP WITH TIME ZONE,
    total_journals INTEGER NOT NULL DEFAULT 0,
    total_debits DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_credits DECIMAL(15,2) NOT NULL DEFAULT 0,
    UNIQUE(company_id, batch_number)
);

-- 4. GL Settings Table
CREATE TABLE public.gl_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL UNIQUE,
    default_posting_rules JSONB NOT NULL DEFAULT '{}',
    auto_journal_number_prefix TEXT NOT NULL DEFAULT 'JE',
    next_journal_number INTEGER NOT NULL DEFAULT 1,
    current_period_open DATE,
    next_period_open DATE,
    allow_future_posting BOOLEAN NOT NULL DEFAULT true,
    require_batch_approval BOOLEAN NOT NULL DEFAULT false,
    lock_posted_entries BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key references for batch_id in gl_journals
ALTER TABLE public.gl_journals 
ADD CONSTRAINT fk_gl_journals_batch_id 
FOREIGN KEY (batch_id) REFERENCES public.gl_batches(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_gl_journals_company_id ON public.gl_journals(company_id);
CREATE INDEX idx_gl_journals_date ON public.gl_journals(date);
CREATE INDEX idx_gl_journals_status ON public.gl_journals(status);
CREATE INDEX idx_gl_journals_source ON public.gl_journals(source, source_id);
CREATE INDEX idx_gl_journals_batch_id ON public.gl_journals(batch_id);

CREATE INDEX idx_gl_entries_journal_id ON public.gl_entries(journal_id);
CREATE INDEX idx_gl_entries_account_id ON public.gl_entries(account_id);
CREATE INDEX idx_gl_entries_entity ON public.gl_entries(entity_type, entity_id);

CREATE INDEX idx_gl_batches_company_id ON public.gl_batches(company_id);
CREATE INDEX idx_gl_batches_status ON public.gl_batches(status);
CREATE INDEX idx_gl_batches_created_at ON public.gl_batches(created_at);

-- Enable RLS on all tables
ALTER TABLE public.gl_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gl_journals
CREATE POLICY "Company users can view GL journals" ON public.gl_journals
    FOR SELECT USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role)
    );

CREATE POLICY "Company users can create GL journals" ON public.gl_journals
    FOR INSERT WITH CHECK (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role)
    );

CREATE POLICY "Company users can update GL journals" ON public.gl_journals
    FOR UPDATE USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role)
    );

CREATE POLICY "Company users can delete GL journals" ON public.gl_journals
    FOR DELETE USING (
        (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
         has_role(auth.uid(), 'super_admin'::app_role)) AND
        status = 'Draft'
    );

-- RLS Policies for gl_entries
CREATE POLICY "Company users can view GL entries" ON public.gl_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.gl_journals gj 
            WHERE gj.id = gl_entries.journal_id 
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, gj.company_id) OR 
                 has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

CREATE POLICY "Company users can manage GL entries" ON public.gl_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.gl_journals gj 
            WHERE gj.id = gl_entries.journal_id 
            AND (has_company_role(auth.uid(), 'company_admin'::app_role, gj.company_id) OR 
                 has_role(auth.uid(), 'super_admin'::app_role))
        )
    );

-- RLS Policies for gl_batches
CREATE POLICY "Company users can manage GL batches" ON public.gl_batches
    FOR ALL USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role)
    );

-- RLS Policies for gl_settings
CREATE POLICY "Company users can manage GL settings" ON public.gl_settings
    FOR ALL USING (
        has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
        has_role(auth.uid(), 'super_admin'::app_role)
    );

-- Create triggers for updated_at columns
CREATE TRIGGER update_gl_journals_updated_at
    BEFORE UPDATE ON public.gl_journals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gl_batches_updated_at
    BEFORE UPDATE ON public.gl_batches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gl_settings_updated_at
    BEFORE UPDATE ON public.gl_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate next journal number
CREATE OR REPLACE FUNCTION public.generate_journal_number(p_company_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    settings_record RECORD;
    new_number INTEGER;
    journal_number TEXT;
BEGIN
    -- Get or create settings
    SELECT * INTO settings_record
    FROM public.gl_settings
    WHERE company_id = p_company_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.gl_settings (company_id)
        VALUES (p_company_id)
        RETURNING * INTO settings_record;
    END IF;
    
    -- Get next number and increment
    new_number := settings_record.next_journal_number;
    journal_number := settings_record.auto_journal_number_prefix || '-' || LPAD(new_number::TEXT, 6, '0');
    
    -- Update next number
    UPDATE public.gl_settings
    SET next_journal_number = next_journal_number + 1,
        updated_at = now()
    WHERE company_id = p_company_id;
    
    RETURN journal_number;
END;
$$;

-- Function to validate journal balance
CREATE OR REPLACE FUNCTION public.validate_journal_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    total_debits DECIMAL(15,2);
    total_credits DECIMAL(15,2);
BEGIN
    -- Calculate totals for this journal
    SELECT 
        COALESCE(SUM(debit_amount), 0),
        COALESCE(SUM(credit_amount), 0)
    INTO total_debits, total_credits
    FROM public.gl_entries
    WHERE journal_id = COALESCE(NEW.journal_id, OLD.journal_id);
    
    -- Update journal totals and balance status
    UPDATE public.gl_journals
    SET 
        total_debits = total_debits,
        total_credits = total_credits,
        is_balanced = (total_debits = total_credits),
        updated_at = now()
    WHERE id = COALESCE(NEW.journal_id, OLD.journal_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger to validate journal balance on entry changes
CREATE TRIGGER validate_journal_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.gl_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_journal_balance();

-- Function to update batch totals
CREATE OR REPLACE FUNCTION public.update_batch_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    batch_totals RECORD;
BEGIN
    -- Skip if no batch_id
    IF COALESCE(NEW.batch_id, OLD.batch_id) IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Calculate batch totals
    SELECT 
        COUNT(*) as journal_count,
        COALESCE(SUM(total_debits), 0) as total_debits,
        COALESCE(SUM(total_credits), 0) as total_credits
    INTO batch_totals
    FROM public.gl_journals
    WHERE batch_id = COALESCE(NEW.batch_id, OLD.batch_id);
    
    -- Update batch
    UPDATE public.gl_batches
    SET 
        total_journals = batch_totals.journal_count,
        total_debits = batch_totals.total_debits,
        total_credits = batch_totals.total_credits,
        updated_at = now()
    WHERE id = COALESCE(NEW.batch_id, OLD.batch_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add trigger to update batch totals
CREATE TRIGGER update_batch_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.gl_journals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_batch_totals();