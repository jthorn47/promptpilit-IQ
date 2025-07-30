-- Create general_ledger table for HaaLO IQ FinanceIQ module
CREATE TABLE public.general_ledger (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL,
    reference TEXT,
    name TEXT,
    description TEXT,
    split_account TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    balance NUMERIC(15,2) NOT NULL,
    account_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.general_ledger ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company isolation
CREATE POLICY "Company users can view their general ledger entries" 
ON public.general_ledger 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.company_id = general_ledger.company_id
    )
    OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can insert general ledger entries" 
ON public.general_ledger 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.company_id = general_ledger.company_id
        AND has_company_role(auth.uid(), 'company_admin'::app_role, p.company_id)
    )
    OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can update general ledger entries" 
ON public.general_ledger 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.company_id = general_ledger.company_id
        AND has_company_role(auth.uid(), 'company_admin'::app_role, p.company_id)
    )
    OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can delete general ledger entries" 
ON public.general_ledger 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.company_id = general_ledger.company_id
        AND has_company_role(auth.uid(), 'company_admin'::app_role, p.company_id)
    )
    OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create indexes for better performance
CREATE INDEX idx_general_ledger_company_id ON public.general_ledger(company_id);
CREATE INDEX idx_general_ledger_date ON public.general_ledger(date);
CREATE INDEX idx_general_ledger_account_name ON public.general_ledger(account_name);
CREATE INDEX idx_general_ledger_amount ON public.general_ledger(amount);

-- Create trigger for updating updated_at
CREATE TRIGGER update_general_ledger_updated_at
    BEFORE UPDATE ON public.general_ledger
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();