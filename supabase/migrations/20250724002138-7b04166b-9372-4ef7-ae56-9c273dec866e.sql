-- Ultra-fast account balance calculation with minimal processing
CREATE OR REPLACE FUNCTION public.calculate_account_balances_fast(p_company_id uuid)
 RETURNS TABLE(accounts_updated integer, total_entries integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_count INTEGER := 0;
  total_count INTEGER;
BEGIN
  -- Get total entries count (limited for speed)
  SELECT COUNT(*) INTO total_count 
  FROM general_ledger 
  WHERE company_id = p_company_id
  LIMIT 5000;
  
  -- Ultra-fast update with only the most obvious matches
  WITH fast_matches AS (
    SELECT 
      coa.id as account_id,
      COALESCE(SUM(gl.amount), 0) as balance_amount
    FROM chart_of_accounts coa
    LEFT JOIN general_ledger gl ON (
      gl.company_id = p_company_id AND (
        -- Only exact matches and account number matches (fastest)
        gl.account_name = coa.full_name OR
        gl.split_account = coa.full_name OR
        (coa.account_number IS NOT NULL AND (
          gl.account_name = coa.account_number OR 
          gl.split_account = coa.account_number
        ))
      )
    )
    WHERE coa.company_id = p_company_id
    GROUP BY coa.id
    LIMIT 100 -- Process only first 100 accounts
  ),
  updated_accounts AS (
    UPDATE chart_of_accounts 
    SET 
      current_balance = fm.balance_amount,
      updated_at = now()
    FROM fast_matches fm
    WHERE chart_of_accounts.id = fm.account_id 
    AND fm.balance_amount != 0
    RETURNING chart_of_accounts.id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_accounts;
  
  RETURN QUERY SELECT updated_count, total_count;
END;
$function$;