-- Enhanced account balance calculation with improved matching logic
CREATE OR REPLACE FUNCTION public.calculate_account_balances_enhanced(p_company_id uuid)
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
  
  -- Enhanced matching with pattern recognition
  WITH enhanced_matches AS (
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
        
        -- Account number with space prefix match (e.g., "1001.04 Valley Strong..." matches account_number "1001.04")
        (coa.account_number IS NOT NULL AND (
          gl.account_name LIKE coa.account_number || ' %' OR
          gl.split_account LIKE coa.account_number || ' %'
        )) OR
        
        -- Full account name appears after account number prefix
        (coa.account_number IS NOT NULL AND LENGTH(coa.full_name) > 3 AND (
          gl.account_name LIKE '%' || coa.full_name OR
          gl.split_account LIKE '%' || coa.full_name OR
          gl.account_name LIKE coa.account_number || '%' || coa.full_name || '%' OR
          gl.split_account LIKE coa.account_number || '%' || coa.full_name || '%'
        )) OR
        
        -- Extract account name from GL entries that start with account numbers
        (coa.account_number IS NOT NULL AND (
          TRIM(REGEXP_REPLACE(gl.account_name, '^[0-9.]+\\s+', '')) = coa.full_name OR
          TRIM(REGEXP_REPLACE(gl.split_account, '^[0-9.]+\\s+', '')) = coa.full_name
        )) OR
        
        -- Partial name matching for cases where GL has additional descriptive text
        (LENGTH(coa.full_name) > 10 AND (
          gl.account_name ILIKE '%' || coa.full_name || '%' OR
          gl.split_account ILIKE '%' || coa.full_name || '%'
        ))
      )
    )
    WHERE coa.company_id = p_company_id
    GROUP BY coa.id
  ),
  updated_accounts AS (
    UPDATE chart_of_accounts 
    SET 
      current_balance = em.balance_amount,
      updated_at = now()
    FROM enhanced_matches em
    WHERE chart_of_accounts.id = em.account_id 
    AND (chart_of_accounts.current_balance != em.balance_amount OR chart_of_accounts.current_balance IS NULL)
    RETURNING chart_of_accounts.id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_accounts;
  
  RETURN QUERY SELECT updated_count, total_count;
END;
$function$;