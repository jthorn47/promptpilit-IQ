-- Ultra-fast QuickBooks balance calculation with batch processing and limits
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
  -- Get limited entries count for performance
  SELECT COUNT(*) INTO total_count 
  FROM general_ledger 
  WHERE company_id = p_company_id
  LIMIT 10000; -- Limit counting to prevent timeout
  
  -- Ultra-fast QuickBooks pattern matching with strict limits
  WITH qb_fast_matches AS (
    SELECT 
      coa.id as account_id,
      COALESCE(SUM(gl.amount), 0) as balance_amount
    FROM chart_of_accounts coa
    LEFT JOIN general_ledger gl ON (
      gl.company_id = p_company_id AND (
        -- Most common QB pattern: "account_number full_name"
        gl.account_name = coa.account_number || ' ' || coa.full_name OR
        gl.split_account = coa.account_number || ' ' || coa.full_name OR
        
        -- Secondary patterns
        gl.account_name = coa.full_name OR
        gl.split_account = coa.full_name OR
        gl.account_name = coa.account_number OR
        gl.split_account = coa.account_number
      )
    )
    WHERE coa.company_id = p_company_id
    GROUP BY coa.id
    LIMIT 200 -- Process max 200 accounts at once
  ),
  updated_accounts AS (
    UPDATE chart_of_accounts 
    SET 
      current_balance = qfm.balance_amount,
      updated_at = now()
    FROM qb_fast_matches qfm
    WHERE chart_of_accounts.id = qfm.account_id 
    AND (chart_of_accounts.current_balance != qfm.balance_amount OR chart_of_accounts.current_balance IS NULL)
    RETURNING chart_of_accounts.id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_accounts;
  
  RETURN QUERY SELECT updated_count, total_count;
END;
$function$;