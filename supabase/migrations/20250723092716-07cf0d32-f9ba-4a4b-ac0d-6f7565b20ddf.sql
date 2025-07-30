-- Create enum for account types
CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'income', 'expense');

-- Create chart_of_accounts table
CREATE TABLE public.chart_of_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    account_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_type account_type NOT NULL,
    parent_account_id UUID REFERENCES public.chart_of_accounts(id) ON DELETE SET NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Ensure unique account numbers per company
    UNIQUE(company_id, account_number),
    
    -- Ensure unique account names per company
    UNIQUE(company_id, account_name)
);

-- Enable RLS
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for chart_of_accounts
CREATE POLICY "Company users can view their chart of accounts"
ON public.chart_of_accounts
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.company_id = chart_of_accounts.company_id
    )
    OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company admins can manage their chart of accounts"
ON public.chart_of_accounts
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.company_id = chart_of_accounts.company_id
        AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('company_admin', 'super_admin')
        )
    )
    OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.company_id = chart_of_accounts.company_id
        AND EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('company_admin', 'super_admin')
        )
    )
    OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_chart_of_accounts_updated_at
    BEFORE UPDATE ON public.chart_of_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_chart_of_accounts_company_id ON public.chart_of_accounts(company_id);
CREATE INDEX idx_chart_of_accounts_account_type ON public.chart_of_accounts(account_type);
CREATE INDEX idx_chart_of_accounts_parent_id ON public.chart_of_accounts(parent_account_id);