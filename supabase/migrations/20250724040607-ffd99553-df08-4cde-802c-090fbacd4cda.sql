-- Enhanced function specifically for QuickBooks data patterns
CREATE OR REPLACE FUNCTION public.calculate_account_balances_from_gl(p_company_id uuid)
 RETURNS TABLE(accounts_updated integer, total_entries integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_count INTEGER := 0;
  total_count INTEGER;
BEGIN
  -- Get total entries count
  SELECT COUNT(*) INTO total_count 
  FROM general_ledger 
  WHERE company_id = p_company_id;
  
  -- QuickBooks-optimized matching with exact patterns
  WITH qb_matches AS (
    SELECT 
      coa.id as account_id,
      COALESCE(SUM(gl.amount), 0) as balance_amount
    FROM chart_of_accounts coa
    LEFT JOIN general_ledger gl ON (
      gl.company_id = p_company_id AND (
        -- Pattern 1: GL has "account_number full_name" format
        gl.account_name = coa.account_number || ' ' || coa.full_name OR
        gl.split_account = coa.account_number || ' ' || coa.full_name OR
        
        -- Pattern 2: Exact full name match
        gl.account_name = coa.full_name OR
        gl.split_account = coa.full_name OR
        gl.name = coa.full_name OR
        
        -- Pattern 3: Account number only match
        gl.account_name = coa.account_number OR
        gl.split_account = coa.account_number OR
        
        -- Pattern 4: Name field matches
        gl.name = coa.account_number || ' ' || coa.full_name
      )
    )
    WHERE coa.company_id = p_company_id
    GROUP BY coa.id
  ),
  updated_accounts AS (
    UPDATE chart_of_accounts 
    SET 
      current_balance = qm.balance_amount,
      updated_at = now()
    FROM qb_matches qm
    WHERE chart_of_accounts.id = qm.account_id 
    AND (chart_of_accounts.current_balance != qm.balance_amount OR chart_of_accounts.current_balance IS NULL)
    RETURNING chart_of_accounts.id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_accounts;
  
  RETURN QUERY SELECT updated_count, total_count;
END;
$function$;