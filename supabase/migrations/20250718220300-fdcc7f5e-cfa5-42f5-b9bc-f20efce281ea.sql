-- HaaLO Tax Filing & Compliance Engine Database Schema
-- Module 18: Tax Filing & Compliance Engine

-- Tax Profiles table for company tax configuration
CREATE TABLE public.tax_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  
  -- Federal identifiers
  fein TEXT NOT NULL,
  
  -- State tax identifiers
  state_tax_ids JSONB DEFAULT '{}',
  
  -- Local tax jurisdictions
  local_jurisdictions JSONB DEFAULT '[]',
  
  -- Unemployment identifiers
  futa_number TEXT,
  suta_numbers JSONB DEFAULT '{}',
  
  -- Deposit frequencies by tax type
  federal_deposit_frequency TEXT DEFAULT 'monthly' CHECK (federal_deposit_frequency IN ('monthly', 'semi-weekly', 'quarterly')),
  state_deposit_frequencies JSONB DEFAULT '{}',
  
  -- E-filing settings
  efiling_enabled BOOLEAN DEFAULT false,
  efiling_provider TEXT,
  efiling_config JSONB DEFAULT '{}',
  
  -- Status and metadata
  is_active BOOLEAN DEFAULT true,
  setup_completed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID,
  updated_by UUID
);

-- Tax Filing Calendar table
CREATE TABLE public.tax_filing_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  
  -- Filing details
  filing_type TEXT NOT NULL, -- '941', '940', 'W2', '1099', 'state_quarterly', etc.
  agency TEXT NOT NULL, -- 'IRS', 'CA_EDD', 'NY_DOL', etc.
  jurisdiction TEXT NOT NULL, -- 'federal', 'state', 'local'
  
  -- Period information
  tax_year INTEGER NOT NULL,
  tax_quarter INTEGER, -- 1, 2, 3, 4 (null for annual filings)
  tax_month INTEGER, -- 1-12 (for monthly filings)
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  
  -- Due dates
  due_date DATE NOT NULL,
  extended_due_date DATE,
  
  -- Status tracking
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'filed', 'overdue', 'amended')),
  filed_date TIMESTAMP WITH TIME ZONE,
  confirmation_number TEXT,
  
  -- Alerts and reminders
  alert_days_before INTEGER DEFAULT 14,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tax Liabilities table
CREATE TABLE public.tax_liabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  payroll_run_id UUID,
  
  -- Period information
  tax_year INTEGER NOT NULL,
  tax_quarter INTEGER,
  tax_month INTEGER,
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  
  -- Liability details
  liability_type TEXT NOT NULL, -- 'federal_income', 'fica_employee', 'fica_employer', 'futa', 'suta', etc.
  agency TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  
  -- Amounts
  employee_tax_amount DECIMAL(12,2) DEFAULT 0.00,
  employer_tax_amount DECIMAL(12,2) DEFAULT 0.00,
  total_liability DECIMAL(12,2) NOT NULL,
  
  -- Wages and basis
  taxable_wages DECIMAL(12,2) DEFAULT 0.00,
  tax_rate DECIMAL(5,4) DEFAULT 0.0000,
  
  -- Status
  status TEXT DEFAULT 'calculated' CHECK (status IN ('calculated', 'filed', 'paid', 'adjusted')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tax Filings table
CREATE TABLE public.tax_filings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  calendar_entry_id UUID REFERENCES public.tax_filing_calendar(id),
  
  -- Filing details
  filing_type TEXT NOT NULL,
  agency TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  
  -- Period information
  tax_year INTEGER NOT NULL,
  tax_quarter INTEGER,
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  
  -- Filing data
  filing_data JSONB NOT NULL DEFAULT '{}',
  calculated_liability DECIMAL(12,2) DEFAULT 0.00,
  total_tax_due DECIMAL(12,2) DEFAULT 0.00,
  
  -- Submission details
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'submitted', 'accepted', 'rejected', 'amended')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID,
  
  -- E-filing details
  efiling_transaction_id TEXT,
  efiling_confirmation TEXT,
  efiling_status TEXT,
  efiling_response JSONB,
  
  -- Document storage
  filing_document_url TEXT,
  confirmation_document_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tax Payments table
CREATE TABLE public.tax_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  filing_id UUID REFERENCES public.tax_filings(id),
  
  -- Payment details
  payment_type TEXT NOT NULL, -- 'federal_deposit', 'state_deposit', 'quarterly_payment', etc.
  agency TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  
  -- Amount and method
  payment_amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT DEFAULT 'ach' CHECK (payment_method IN ('ach', 'wire', 'check', 'online')),
  
  -- Scheduling
  due_date DATE NOT NULL,
  scheduled_date DATE,
  payment_date DATE,
  
  -- Status tracking
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'pending', 'completed', 'failed', 'cancelled')),
  
  -- Bank and confirmation details
  bank_account_id UUID,
  confirmation_number TEXT,
  trace_number TEXT,
  
  -- Response data
  payment_response JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID
);

-- Tax Notices and Correspondence table
CREATE TABLE public.tax_notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  filing_id UUID REFERENCES public.tax_filings(id),
  
  -- Notice details
  notice_type TEXT NOT NULL, -- 'audit', 'penalty', 'adjustment', 'inquiry', 'refund'
  agency TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  
  -- Notice information
  notice_number TEXT,
  notice_date DATE NOT NULL,
  response_due_date DATE,
  
  -- Content
  subject TEXT NOT NULL,
  description TEXT,
  notice_document_url TEXT,
  
  -- Financial impact
  penalty_amount DECIMAL(12,2) DEFAULT 0.00,
  interest_amount DECIMAL(12,2) DEFAULT 0.00,
  adjustment_amount DECIMAL(12,2) DEFAULT 0.00,
  
  -- Status and resolution
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'under_review', 'responded', 'resolved', 'escalated')),
  resolution_notes TEXT,
  resolution_date DATE,
  resolved_by UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID
);

-- Tax Filing Archive table
CREATE TABLE public.tax_filing_archive (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  filing_id UUID REFERENCES public.tax_filings(id),
  
  -- Archive details
  filing_type TEXT NOT NULL,
  tax_year INTEGER NOT NULL,
  agency TEXT NOT NULL,
  
  -- Document storage
  document_type TEXT NOT NULL, -- 'filing', 'confirmation', 'correspondence'
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_size_bytes INTEGER,
  
  -- Metadata
  archived_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  archived_by UUID,
  retention_until DATE, -- For compliance retention requirements
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tax Compliance Audit Log
CREATE TABLE public.tax_compliance_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  
  -- Audit details
  action_type TEXT NOT NULL, -- 'filing_submitted', 'payment_made', 'notice_received', etc.
  resource_type TEXT NOT NULL, -- 'tax_filing', 'tax_payment', 'tax_notice'
  resource_id UUID,
  
  -- Action details
  action_details JSONB NOT NULL DEFAULT '{}',
  old_values JSONB,
  new_values JSONB,
  
  -- User and system info
  performed_by UUID,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_tax_profiles_company_id ON public.tax_profiles(company_id);
CREATE INDEX idx_tax_filing_calendar_company_id ON public.tax_filing_calendar(company_id);
CREATE INDEX idx_tax_filing_calendar_due_date ON public.tax_filing_calendar(due_date);
CREATE INDEX idx_tax_filing_calendar_status ON public.tax_filing_calendar(status);
CREATE INDEX idx_tax_liabilities_company_id ON public.tax_liabilities(company_id);
CREATE INDEX idx_tax_liabilities_payroll_run_id ON public.tax_liabilities(payroll_run_id);
CREATE INDEX idx_tax_filings_company_id ON public.tax_filings(company_id);
CREATE INDEX idx_tax_filings_calendar_entry_id ON public.tax_filings(calendar_entry_id);
CREATE INDEX idx_tax_payments_company_id ON public.tax_payments(company_id);
CREATE INDEX idx_tax_payments_filing_id ON public.tax_payments(filing_id);
CREATE INDEX idx_tax_payments_due_date ON public.tax_payments(due_date);
CREATE INDEX idx_tax_notices_company_id ON public.tax_notices(company_id);
CREATE INDEX idx_tax_notices_status ON public.tax_notices(status);
CREATE INDEX idx_tax_filing_archive_company_id ON public.tax_filing_archive(company_id);
CREATE INDEX idx_tax_filing_archive_tax_year ON public.tax_filing_archive(tax_year);
CREATE INDEX idx_tax_compliance_audit_company_id ON public.tax_compliance_audit(company_id);

-- Row Level Security (RLS) Policies

-- Tax Profiles
ALTER TABLE public.tax_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can manage tax profiles" 
ON public.tax_profiles 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Tax Filing Calendar
ALTER TABLE public.tax_filing_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can view tax calendar" 
ON public.tax_filing_calendar 
FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can manage tax calendar" 
ON public.tax_filing_calendar 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Tax Liabilities
ALTER TABLE public.tax_liabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can view tax liabilities" 
ON public.tax_liabilities 
FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can manage tax liabilities" 
ON public.tax_liabilities 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Tax Filings
ALTER TABLE public.tax_filings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can manage tax filings" 
ON public.tax_filings 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Tax Payments
ALTER TABLE public.tax_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can manage tax payments" 
ON public.tax_payments 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Tax Notices
ALTER TABLE public.tax_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can manage tax notices" 
ON public.tax_notices 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Tax Filing Archive
ALTER TABLE public.tax_filing_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can view tax archives" 
ON public.tax_filing_archive 
FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can manage tax archives" 
ON public.tax_filing_archive 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Tax Compliance Audit
ALTER TABLE public.tax_compliance_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company admins can view tax audit logs" 
ON public.tax_compliance_audit 
FOR SELECT 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert tax audit logs" 
ON public.tax_compliance_audit 
FOR INSERT 
WITH CHECK (true);

-- Triggers for automatic timestamps
CREATE OR REPLACE FUNCTION public.update_tax_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tax_profiles_updated_at
  BEFORE UPDATE ON public.tax_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tax_updated_at();

CREATE TRIGGER update_tax_filing_calendar_updated_at
  BEFORE UPDATE ON public.tax_filing_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tax_updated_at();

CREATE TRIGGER update_tax_liabilities_updated_at
  BEFORE UPDATE ON public.tax_liabilities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tax_updated_at();

CREATE TRIGGER update_tax_filings_updated_at
  BEFORE UPDATE ON public.tax_filings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tax_updated_at();

CREATE TRIGGER update_tax_payments_updated_at
  BEFORE UPDATE ON public.tax_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tax_updated_at();

CREATE TRIGGER update_tax_notices_updated_at
  BEFORE UPDATE ON public.tax_notices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tax_updated_at();

-- Function to generate tax calendar entries for a company
CREATE OR REPLACE FUNCTION public.generate_tax_calendar_entries(
  p_company_id UUID,
  p_tax_year INTEGER
)
RETURNS VOID AS $$
DECLARE
  quarter_rec RECORD;
  quarter_num INTEGER;
  quarter_start DATE;
  quarter_end DATE;
  quarter_due DATE;
BEGIN
  -- Generate quarterly 941 filings
  FOR quarter_num IN 1..4 LOOP
    quarter_start := DATE(p_tax_year || '-' || ((quarter_num - 1) * 3 + 1)::TEXT || '-01');
    quarter_end := quarter_start + INTERVAL '3 months' - INTERVAL '1 day';
    quarter_due := quarter_end + INTERVAL '1 month' + INTERVAL '15 days';
    
    INSERT INTO public.tax_filing_calendar (
      company_id, filing_type, agency, jurisdiction,
      tax_year, tax_quarter, period_start_date, period_end_date, due_date
    ) VALUES (
      p_company_id, '941', 'IRS', 'federal',
      p_tax_year, quarter_num, quarter_start, quarter_end, quarter_due
    ) ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Generate annual 940 filing
  INSERT INTO public.tax_filing_calendar (
    company_id, filing_type, agency, jurisdiction,
    tax_year, period_start_date, period_end_date, due_date
  ) VALUES (
    p_company_id, '940', 'IRS', 'federal',
    p_tax_year, 
    DATE(p_tax_year || '-01-01'), 
    DATE(p_tax_year || '-12-31'),
    DATE((p_tax_year + 1) || '-01-31')
  ) ON CONFLICT DO NOTHING;
  
  -- Generate W-2 filing
  INSERT INTO public.tax_filing_calendar (
    company_id, filing_type, agency, jurisdiction,
    tax_year, period_start_date, period_end_date, due_date
  ) VALUES (
    p_company_id, 'W2', 'IRS', 'federal',
    p_tax_year, 
    DATE(p_tax_year || '-01-01'), 
    DATE(p_tax_year || '-12-31'),
    DATE((p_tax_year + 1) || '-01-31')
  ) ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;