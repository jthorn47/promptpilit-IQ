-- Precise account balance calculation with exact pattern matching
CREATE OR REPLACE FUNCTION public.calculate_account_balances_precise(p_company_id uuid)
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
  WHERE company_id = p_company_id
  LIMIT 10000;
  
  -- Precise matching based on actual data patterns observed
  WITH precise_matches AS (
    SELECT 
      coa.id as account_id,
      COALESCE(SUM(gl.amount), 0) as balance_amount
    FROM chart_of_accounts coa
    LEFT JOIN general_ledger gl ON (
      gl.company_id = p_company_id AND (
        -- Exact full name match
        gl.account_name = coa.full_name OR
        gl.split_account = coa.full_name OR
        gl.name = coa.full_name OR
        
        -- Account number only match
        gl.account_name = coa.account_number OR
        gl.split_account = coa.account_number OR
        
        -- The most common pattern: "account_number full_name" (space separated)
        gl.account_name = coa.account_number || ' ' || coa.full_name OR
        gl.split_account = coa.account_number || ' ' || coa.full_name OR
        
        -- Alternative pattern: "account_number:full_name" (colon separated)  
        gl.account_name = coa.account_number || ':' || coa.full_name OR
        gl.split_account = coa.account_number || ':' || coa.full_name
      )
    )
    WHERE coa.company_id = p_company_id
    GROUP BY coa.id
  ),
  updated_accounts AS (
    UPDATE chart_of_accounts 
    SET 
      current_balance = pm.balance_amount,
      updated_at = now()
    FROM precise_matches pm
    WHERE chart_of_accounts.id = pm.account_id 
    AND (chart_of_accounts.current_balance != pm.balance_amount OR chart_of_accounts.current_balance IS NULL)
    RETURNING chart_of_accounts.id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_accounts;
  
  RETURN QUERY SELECT updated_count, total_count;
END;
$function$;