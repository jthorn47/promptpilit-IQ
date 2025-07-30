-- PayMover Phase 3: Disbursement and Banking Layer
-- Core disbursement tracking tables

-- Enhanced disbursement batches table
CREATE TABLE public.disbursement_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pay_run_id UUID REFERENCES public.payroll_pay_runs(id) ON DELETE CASCADE,
  disbursement_type TEXT NOT NULL CHECK (disbursement_type IN ('employee', 'tax', 'vendor', 'garnishment')),
  method TEXT NOT NULL CHECK (method IN ('ACH', 'RTP', 'Check', 'PayCard')),
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'submitted', 'confirmed', 'failed', 'cancelled')),
  funding_required DECIMAL(12,4) NOT NULL DEFAULT 0,
  funding_confirmed BOOLEAN NOT NULL DEFAULT false,
  funding_confirmed_at TIMESTAMP WITH TIME ZONE,
  nacha_file_id TEXT,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique NACHA file IDs per company
  UNIQUE(company_id, nacha_file_id)
);

-- Individual disbursement instructions
CREATE TABLE public.disbursement_instructions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.disbursement_batches(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('employee', 'vendor', 'tax_agency')),
  recipient_id UUID NOT NULL,
  bank_account_id UUID REFERENCES public.employee_bank_accounts(id),
  amount DECIMAL(12,4) NOT NULL,
  memo TEXT,
  reference_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'cancelled')),
  processed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced bank accounts for vendors and agencies
CREATE TABLE public.vendor_bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  vendor_type TEXT NOT NULL CHECK (vendor_type IN ('benefit_provider', 'tax_agency', 'garnishment_agency')),
  account_holder_name TEXT NOT NULL,
  routing_number TEXT NOT NULL,
  account_number_encrypted TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings')),
  memo_format_template TEXT,
  remittance_code_required BOOLEAN NOT NULL DEFAULT false,
  verified_on TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Funding transactions tracking
CREATE TABLE public.funding_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.disbursement_batches(id) ON DELETE CASCADE,
  source_bank_account_id UUID,
  amount DECIMAL(12,4) NOT NULL,
  funding_method TEXT NOT NULL CHECK (funding_method IN ('internal_reserve', 'external_transfer', 'credit_line')),
  status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'confirmed', 'failed', 'cancelled')),
  external_reference TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disbursement routing rules
CREATE TABLE public.disbursement_routing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('employee', 'vendor', 'tax_agency')),
  priority INTEGER NOT NULL DEFAULT 100,
  conditions JSONB NOT NULL DEFAULT '{}',
  routing_method TEXT NOT NULL CHECK (routing_method IN ('ACH', 'RTP', 'Check', 'PayCard')),
  fallback_method TEXT CHECK (fallback_method IN ('ACH', 'RTP', 'Check', 'PayCard')),
  cutoff_time TIME,
  max_amount DECIMAL(12,4),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- OFAC screening logs
CREATE TABLE public.ofac_screening_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instruction_id UUID NOT NULL REFERENCES public.disbursement_instructions(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  screening_result TEXT NOT NULL CHECK (screening_result IN ('clear', 'match', 'potential_match', 'error')),
  match_details JSONB,
  screened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  screened_by TEXT NOT NULL DEFAULT 'system'
);

-- Enhanced ACH batch tracking for disbursements
ALTER TABLE public.ach_batches 
ADD COLUMN disbursement_batch_id UUID REFERENCES public.disbursement_batches(id),
ADD COLUMN funding_confirmed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN cutoff_missed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN fallback_method TEXT;

-- Vendor and agency master data
CREATE TABLE public.disbursement_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.company_settings(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  vendor_type TEXT NOT NULL CHECK (vendor_type IN ('benefit_provider', 'tax_agency', 'garnishment_agency')),
  contact_info JSONB DEFAULT '{}',
  payment_preferences JSONB DEFAULT '{}',
  tax_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(company_id, vendor_name, vendor_type)
);

-- Enable RLS on all new tables
ALTER TABLE public.disbursement_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disbursement_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disbursement_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ofac_screening_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disbursement_vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disbursement tables
CREATE POLICY "Company admins can manage disbursement batches" 
ON public.disbursement_batches 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id));

CREATE POLICY "Super admins can manage all disbursement batches" 
ON public.disbursement_batches 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company users can view disbursement instructions" 
ON public.disbursement_instructions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.disbursement_batches db 
  WHERE db.id = disbursement_instructions.batch_id 
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, db.company_id) 
       OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Company admins can manage disbursement instructions" 
ON public.disbursement_instructions 
FOR INSERT, UPDATE, DELETE 
USING (EXISTS (
  SELECT 1 FROM public.disbursement_batches db 
  WHERE db.id = disbursement_instructions.batch_id 
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, db.company_id) 
       OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Company admins can manage vendor bank accounts" 
ON public.vendor_bank_accounts 
FOR ALL 
USING (has_role(auth.uid(), 'company_admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Company admins can view funding transactions" 
ON public.funding_transactions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.disbursement_batches db 
  WHERE db.id = funding_transactions.batch_id 
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, db.company_id) 
       OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Company admins can manage routing rules" 
ON public.disbursement_routing_rules 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id));

CREATE POLICY "Super admins can manage all routing rules" 
ON public.disbursement_routing_rules 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authorized users can view OFAC logs" 
ON public.ofac_screening_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.disbursement_instructions di
  JOIN public.disbursement_batches db ON db.id = di.batch_id
  WHERE di.id = ofac_screening_logs.instruction_id 
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, db.company_id) 
       OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Company admins can manage vendors" 
ON public.disbursement_vendors 
FOR ALL 
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id))
WITH CHECK (has_company_role(auth.uid(), 'company_admin'::app_role, company_id));

CREATE POLICY "Super admins can manage all vendors" 
ON public.disbursement_vendors 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

-- Triggers for updated_at columns
CREATE TRIGGER update_disbursement_batches_updated_at
BEFORE UPDATE ON public.disbursement_batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disbursement_instructions_updated_at
BEFORE UPDATE ON public.disbursement_instructions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_bank_accounts_updated_at
BEFORE UPDATE ON public.vendor_bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funding_transactions_updated_at
BEFORE UPDATE ON public.funding_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disbursement_routing_rules_updated_at
BEFORE UPDATE ON public.disbursement_routing_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disbursement_vendors_updated_at
BEFORE UPDATE ON public.disbursement_vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function for routing rule evaluation
CREATE OR REPLACE FUNCTION public.evaluate_disbursement_routing(
  p_company_id UUID,
  p_recipient_type TEXT,
  p_amount DECIMAL,
  p_recipient_data JSONB DEFAULT '{}'
)
RETURNS TABLE(
  routing_method TEXT,
  fallback_method TEXT,
  cutoff_time TIME
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    drr.routing_method,
    drr.fallback_method,
    drr.cutoff_time
  FROM public.disbursement_routing_rules drr
  WHERE drr.company_id = p_company_id
    AND drr.recipient_type = p_recipient_type
    AND drr.is_active = true
    AND (drr.max_amount IS NULL OR p_amount <= drr.max_amount)
  ORDER BY drr.priority ASC
  LIMIT 1;
END;
$$;