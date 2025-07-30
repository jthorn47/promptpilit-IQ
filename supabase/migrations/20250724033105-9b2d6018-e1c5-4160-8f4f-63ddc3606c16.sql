-- Pattern-aware account balance calculation
CREATE OR REPLACE FUNCTION public.calculate_account_balances_pattern_match(p_company_id uuid)
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
  
  -- Pattern-aware matching to handle account number + name combinations
  WITH pattern_matches AS (
    SELECT 
      coa.id as account_id,
      COALESCE(SUM(gl.amount), 0) as balance_amount
    FROM chart_of_accounts coa
    LEFT JOIN general_ledger gl ON (
      gl.company_id = p_company_id AND (
        -- Exact matches
        gl.account_name = coa.full_name OR
        gl.split_account = coa.full_name OR
        gl.name = coa.full_name OR
        
        -- Account number exact matches
        (coa.account_number IS NOT NULL AND (
          gl.account_name = coa.account_number OR 
          gl.split_account = coa.account_number
        )) OR
        
        -- Pattern: "account_number full_name" (most common case)
        (coa.account_number IS NOT NULL AND (
          gl.account_name = coa.account_number || ' ' || coa.full_name OR
          gl.split_account = coa.account_number || ' ' || coa.full_name
        )) OR
        
        -- Pattern: "account_number:full_name" 
        (coa.account_number IS NOT NULL AND (
          gl.account_name = coa.account_number || ':' || coa.full_name OR
          gl.split_account = coa.account_number || ':' || coa.full_name
        )) OR
        
        -- Pattern: GL entry starts with account number and contains full name
        (coa.account_number IS NOT NULL AND LENGTH(coa.full_name) > 3 AND (
          gl.account_name LIKE coa.account_number || '%' || coa.full_name || '%' OR
          gl.split_account LIKE coa.account_number || '%' || coa.full_name || '%'
        ))
      )
    )
    WHERE coa.company_id = p_company_id
    GROUP BY coa.id
    LIMIT 100 -- Process first 100 accounts for speed
  ),
  updated_accounts AS (
    UPDATE chart_of_accounts 
    SET 
      current_balance = pm.balance_amount,
      updated_at = now()
    FROM pattern_matches pm
    WHERE chart_of_accounts.id = pm.account_id 
    AND (chart_of_accounts.current_balance != pm.balance_amount OR chart_of_accounts.current_balance IS NULL)
    RETURNING chart_of_accounts.id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_accounts;
  
  RETURN QUERY SELECT updated_count, total_count;
END;
$function$;