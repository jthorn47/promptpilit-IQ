-- Create NACHA ACH Files table
CREATE TABLE public.ach_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  batch_id UUID REFERENCES public.payroll_batches(id),
  file_name TEXT NOT NULL,
  file_content TEXT, -- NACHA formatted content
  file_hash TEXT,
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'queued', 'transmitted', 'failed', 'cancelled')),
  total_entries INTEGER NOT NULL DEFAULT 0,
  total_credit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_debit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  effective_date DATE NOT NULL,
  transmission_method TEXT CHECK (transmission_method IN ('sftp', 'api', 'manual')),
  transmitted_at TIMESTAMP WITH TIME ZONE,
  transmission_reference TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ACH file entries (detail records)
CREATE TABLE public.ach_file_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ach_file_id UUID NOT NULL REFERENCES public.ach_files(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  bank_routing_number TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings')),
  transaction_code TEXT NOT NULL, -- Standard Entry Class codes
  amount DECIMAL(10,2) NOT NULL,
  trace_number TEXT,
  addenda_record TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'returned', 'failed')),
  return_reason_code TEXT,
  return_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create banking profiles for companies
CREATE TABLE public.banking_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  company_identification TEXT NOT NULL, -- Federal Tax ID
  originating_dfi_id TEXT NOT NULL, -- Bank routing number
  company_account_number TEXT NOT NULL,
  company_account_type TEXT NOT NULL DEFAULT 'checking' CHECK (company_account_type IN ('checking', 'savings')),
  transmission_method TEXT NOT NULL DEFAULT 'sftp' CHECK (transmission_method IN ('sftp', 'api', 'manual')),
  sftp_host TEXT,
  sftp_username TEXT,
  sftp_port INTEGER DEFAULT 22,
  sftp_directory TEXT DEFAULT '/',
  api_endpoint TEXT,
  api_key_hash TEXT,
  processing_schedule TEXT DEFAULT 'bi-weekly' CHECK (processing_schedule IN ('weekly', 'bi-weekly', 'semi-monthly', 'monthly')),
  cutoff_time TIME DEFAULT '15:00:00',
  is_test_mode BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ACH transmission logs
CREATE TABLE public.ach_transmission_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ach_file_id UUID NOT NULL REFERENCES public.ach_files(id),
  company_id UUID NOT NULL,
  transmission_method TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'retry')),
  response_code TEXT,
  response_message TEXT,
  response_data JSONB DEFAULT '{}',
  transmission_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  performed_by UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT
);

-- Create ACH audit logs
CREATE TABLE public.ach_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  ach_file_id UUID,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  action_details JSONB DEFAULT '{}',
  performed_by UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ach_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ach_file_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banking_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ach_transmission_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ach_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ach_files
CREATE POLICY "Company admins can manage ACH files"
ON public.ach_files
FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for ach_file_entries
CREATE POLICY "Company users can view ACH file entries"
ON public.ach_file_entries
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.ach_files af 
  WHERE af.id = ach_file_entries.ach_file_id 
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, af.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Company admins can insert ACH file entries"
ON public.ach_file_entries
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.ach_files af 
  WHERE af.id = ach_file_entries.ach_file_id 
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, af.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Company admins can update ACH file entries"
ON public.ach_file_entries
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.ach_files af 
  WHERE af.id = ach_file_entries.ach_file_id 
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, af.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

CREATE POLICY "Company admins can delete ACH file entries"
ON public.ach_file_entries
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.ach_files af 
  WHERE af.id = ach_file_entries.ach_file_id 
  AND (has_company_role(auth.uid(), 'company_admin'::app_role, af.company_id) OR has_role(auth.uid(), 'super_admin'::app_role))
));

-- RLS Policies for banking_profiles
CREATE POLICY "Company admins can manage banking profiles"
ON public.banking_profiles
FOR ALL
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for ach_transmission_logs
CREATE POLICY "Company admins can view ACH transmission logs"
ON public.ach_transmission_logs
FOR SELECT
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert ACH transmission logs"
ON public.ach_transmission_logs
FOR INSERT
WITH CHECK (true);

-- RLS Policies for ach_audit_logs
CREATE POLICY "Company admins can view their ACH audit logs"
ON public.ach_audit_logs
FOR SELECT
USING (has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "System can insert ACH audit logs"
ON public.ach_audit_logs
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_ach_files_company_id ON public.ach_files(company_id);
CREATE INDEX idx_ach_files_batch_id ON public.ach_files(batch_id);
CREATE INDEX idx_ach_files_status ON public.ach_files(status);
CREATE INDEX idx_ach_files_effective_date ON public.ach_files(effective_date);

CREATE INDEX idx_ach_file_entries_ach_file_id ON public.ach_file_entries(ach_file_id);
CREATE INDEX idx_ach_file_entries_employee_id ON public.ach_file_entries(employee_id);
CREATE INDEX idx_ach_file_entries_routing_number ON public.ach_file_entries(bank_routing_number);

CREATE INDEX idx_banking_profiles_company_id ON public.banking_profiles(company_id);

CREATE INDEX idx_ach_transmission_logs_ach_file_id ON public.ach_transmission_logs(ach_file_id);
CREATE INDEX idx_ach_transmission_logs_company_id ON public.ach_transmission_logs(company_id);
CREATE INDEX idx_ach_transmission_logs_status ON public.ach_transmission_logs(status);

CREATE INDEX idx_ach_audit_logs_company_id ON public.ach_audit_logs(company_id);
CREATE INDEX idx_ach_audit_logs_ach_file_id ON public.ach_audit_logs(ach_file_id);

-- Create triggers for updated_at
CREATE TRIGGER update_ach_files_updated_at
  BEFORE UPDATE ON public.ach_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ach_updated_at_column();

CREATE TRIGGER update_banking_profiles_updated_at
  BEFORE UPDATE ON public.banking_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ach_updated_at_column();

-- Create function to generate ACH file name
CREATE OR REPLACE FUNCTION public.generate_ach_file_name(
  p_company_id UUID,
  p_effective_date DATE
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sequence_num INTEGER;
  file_name TEXT;
BEGIN
  -- Get next sequence number for this company and date
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(file_name FROM '[0-9]+$') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.ach_files
  WHERE company_id = p_company_id
  AND effective_date = p_effective_date;
  
  -- Format: ACH_COMPANYID_YYYYMMDD_###.txt
  file_name := 'ACH_' || 
               LEFT(p_company_id::TEXT, 8) || '_' ||
               TO_CHAR(p_effective_date, 'YYYYMMDD') || '_' ||
               LPAD(sequence_num::TEXT, 3, '0') || '.txt';
  
  RETURN file_name;
END;
$$;

-- Create function to validate routing number
CREATE OR REPLACE FUNCTION public.validate_routing_number(routing_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
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
$$;