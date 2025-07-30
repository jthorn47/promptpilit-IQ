-- Create table for manual GL to COA mappings
CREATE TABLE public.gl_account_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  gl_account_name TEXT NOT NULL,
  gl_field_type TEXT NOT NULL DEFAULT 'account_name', -- 'account_name', 'split_account', or 'name'
  chart_account_id UUID NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, gl_account_name, gl_field_type)
);

-- Enable RLS
ALTER TABLE public.gl_account_mappings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Company users can view their mappings" 
ON public.gl_account_mappings 
FOR SELECT 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company users can create mappings" 
ON public.gl_account_mappings 
FOR INSERT 
WITH CHECK (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company users can update their mappings" 
ON public.gl_account_mappings 
FOR UPDATE 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Company users can delete their mappings" 
ON public.gl_account_mappings 
FOR DELETE 
USING (
  has_company_role(auth.uid(), 'company_admin'::app_role, company_id) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_gl_account_mappings_updated_at
    BEFORE UPDATE ON public.gl_account_mappings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function that uses manual mappings for balance calculation
CREATE OR REPLACE FUNCTION public.calculate_account_balances_with_mappings(p_company_id uuid)
 RETURNS TABLE(accounts_updated integer, total_entries integer, mapped_entries integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_count INTEGER := 0;
  total_count INTEGER;
  mapped_count INTEGER := 0;
BEGIN
  -- Get total entries count
  SELECT COUNT(*) INTO total_count 
  FROM general_ledger 
  WHERE company_id = p_company_id;
  
  -- Calculate balances using both automatic matching and manual mappings
  WITH all_matches AS (
    SELECT 
      coa.id as account_id,
      COALESCE(SUM(gl.amount), 0) as balance_amount
    FROM chart_of_accounts coa
    LEFT JOIN general_ledger gl ON (
      gl.company_id = p_company_id AND (
        -- Manual mappings (highest priority)
        EXISTS (
          SELECT 1 FROM gl_account_mappings gam 
          WHERE gam.company_id = p_company_id 
          AND gam.chart_account_id = coa.id
          AND (
            (gam.gl_field_type = 'account_name' AND gam.gl_account_name = gl.account_name) OR
            (gam.gl_field_type = 'split_account' AND gam.gl_account_name = gl.split_account) OR
            (gam.gl_field_type = 'name' AND gam.gl_account_name = gl.name)
          )
        ) OR
        
        -- Automatic matching (fallback for unmapped accounts)
        (
          NOT EXISTS (
            SELECT 1 FROM gl_account_mappings gam 
            WHERE gam.company_id = p_company_id 
            AND (
              gam.gl_account_name = gl.account_name OR 
              gam.gl_account_name = gl.split_account OR 
              gam.gl_account_name = gl.name
            )
          ) AND (
            -- Exact full name match
            gl.account_name = coa.full_name OR
            gl.split_account = coa.full_name OR
            gl.name = coa.full_name OR
            
            -- Account number only match
            gl.account_name = coa.account_number OR
            gl.split_account = coa.account_number OR
            
            -- Pattern: "account_number full_name" (space separated)
            gl.account_name = coa.account_number || ' ' || coa.full_name OR
            gl.split_account = coa.account_number || ' ' || coa.full_name OR
            
            -- Pattern: "account_number:full_name" (colon separated)  
            gl.account_name = coa.account_number || ':' || coa.full_name OR
            gl.split_account = coa.account_number || ':' || coa.full_name
          )
        )
      )
    )
    WHERE coa.company_id = p_company_id
    GROUP BY coa.id
  ),
  updated_accounts AS (
    UPDATE chart_of_accounts 
    SET 
      current_balance = am.balance_amount,
      updated_at = now()
    FROM all_matches am
    WHERE chart_of_accounts.id = am.account_id 
    AND (chart_of_accounts.current_balance != am.balance_amount OR chart_of_accounts.current_balance IS NULL)
    RETURNING chart_of_accounts.id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_accounts;
  
  -- Count entries that used manual mappings
  SELECT COUNT(DISTINCT gl.id) INTO mapped_count
  FROM general_ledger gl
  JOIN gl_account_mappings gam ON (
    gam.company_id = p_company_id AND
    gl.company_id = p_company_id AND (
      (gam.gl_field_type = 'account_name' AND gam.gl_account_name = gl.account_name) OR
      (gam.gl_field_type = 'split_account' AND gam.gl_account_name = gl.split_account) OR
      (gam.gl_field_type = 'name' AND gam.gl_account_name = gl.name)
    )
  );
  
  RETURN QUERY SELECT updated_count, total_count, mapped_count;
END;
$function$;