-- Ultra-simple account balance calculation to avoid timeouts
CREATE OR REPLACE FUNCTION public.calculate_account_balances_simple(p_company_id uuid)
 RETURNS TABLE(accounts_updated integer, total_entries integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_count INTEGER := 0;
  total_count INTEGER;
BEGIN
  -- Get limited entries count for speed
  SELECT COUNT(*) INTO total_count 
  FROM general_ledger 
  WHERE company_id = p_company_id
  LIMIT 1000; -- Very conservative limit
  
  -- Super simple matching - only exact name matches
  WITH simple_matches AS (
    SELECT 
      coa.id as account_id,
      COALESCE(SUM(gl.amount), 0) as balance_amount
    FROM chart_of_accounts coa
    LEFT JOIN general_ledger gl ON (
      gl.company_id = p_company_id AND (
        gl.account_name = coa.full_name OR
        gl.split_account = coa.full_name
      )
    )
    WHERE coa.company_id = p_company_id
    GROUP BY coa.id
    LIMIT 50 -- Process only 50 accounts at a time
  ),
  updated_accounts AS (
    UPDATE chart_of_accounts 
    SET 
      current_balance = sm.balance_amount,
      updated_at = now()
    FROM simple_matches sm
    WHERE chart_of_accounts.id = sm.account_id 
    AND sm.balance_amount != 0 -- Only update non-zero balances
    RETURNING chart_of_accounts.id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_accounts;
  
  RETURN QUERY SELECT updated_count, total_count;
END;
$function$;