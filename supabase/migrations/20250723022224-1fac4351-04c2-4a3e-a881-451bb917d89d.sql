
-- Create the chart_of_accounts table
CREATE TABLE public.chart_of_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    account_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
    detail_type TEXT,
    description TEXT,
    initial_balance DECIMAL(15,2) DEFAULT 0.00,
    current_balance DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    parent_account_id UUID REFERENCES public.chart_of_accounts(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID,
    UNIQUE(company_id, account_number)
);

-- Add indexes for performance
CREATE INDEX idx_chart_of_accounts_company_id ON public.chart_of_accounts(company_id);
CREATE INDEX idx_chart_of_accounts_account_type ON public.chart_of_accounts(account_type);
CREATE INDEX idx_chart_of_accounts_parent_id ON public.chart_of_accounts(parent_account_id);
CREATE INDEX idx_chart_of_accounts_number ON public.chart_of_accounts(account_number);

-- Enable RLS
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company admins can manage their chart of accounts"
ON public.chart_of_accounts
FOR ALL
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company users can view their chart of accounts"
ON public.chart_of_accounts
FOR SELECT
USING (
    has_company_role(auth.uid(), 'company_admin'::app_role, company_id) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_chart_of_accounts_updated_at
    BEFORE UPDATE ON public.chart_of_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit log trigger
CREATE TRIGGER chart_of_accounts_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.chart_of_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.log_org_structure_changes();

-- Create function to get account hierarchy
CREATE OR REPLACE FUNCTION public.get_account_hierarchy(p_company_id UUID)
RETURNS TABLE(
    id UUID,
    account_number TEXT,
    full_name TEXT,
    account_type TEXT,
    detail_type TEXT,
    description TEXT,
    initial_balance DECIMAL,
    current_balance DECIMAL,
    is_active BOOLEAN,
    parent_account_id UUID,
    sort_order INTEGER,
    level INTEGER,
    path TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE account_tree AS (
        -- Base case: root accounts (no parent)
        SELECT 
            coa.id,
            coa.account_number,
            coa.full_name,
            coa.account_type,
            coa.detail_type,
            coa.description,
            coa.initial_balance,
            coa.current_balance,
            coa.is_active,
            coa.parent_account_id,
            coa.sort_order,
            0 as level,
            ARRAY[coa.account_number] as path
        FROM public.chart_of_accounts coa
        WHERE coa.company_id = p_company_id 
        AND coa.parent_account_id IS NULL
        
        UNION ALL
        
        -- Recursive case: child accounts
        SELECT 
            coa.id,
            coa.account_number,
            coa.full_name,
            coa.account_type,
            coa.detail_type,
            coa.description,
            coa.initial_balance,
            coa.current_balance,
            coa.is_active,
            coa.parent_account_id,
            coa.sort_order,
            at.level + 1,
            at.path || coa.account_number
        FROM public.chart_of_accounts coa
        INNER JOIN account_tree at ON coa.parent_account_id = at.id
        WHERE coa.company_id = p_company_id
    )
    SELECT * FROM account_tree
    ORDER BY path, sort_order, account_number;
END;
$$;

-- Create function to validate account number format
CREATE OR REPLACE FUNCTION public.validate_account_number(account_num TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if account number matches pattern like 1001.00, 2000, etc.
    RETURN account_num ~ '^[0-9]{4}(\.[0-9]{2})?$';
END;
$$;

-- Add validation trigger
CREATE OR REPLACE FUNCTION public.validate_chart_of_accounts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate account number format
    IF NOT validate_account_number(NEW.account_number) THEN
        RAISE EXCEPTION 'Invalid account number format. Use format like 1001.00 or 1001';
    END IF;
    
    -- Set updated_by
    NEW.updated_by = auth.uid();
    
    -- If inserting, set created_by
    IF TG_OP = 'INSERT' THEN
        NEW.created_by = COALESCE(NEW.created_by, auth.uid());
        NEW.current_balance = COALESCE(NEW.current_balance, NEW.initial_balance, 0.00);
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER validate_chart_of_accounts_trigger
    BEFORE INSERT OR UPDATE ON public.chart_of_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_chart_of_accounts();
