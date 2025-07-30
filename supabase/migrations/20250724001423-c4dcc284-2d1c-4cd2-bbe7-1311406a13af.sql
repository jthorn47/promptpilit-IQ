-- Enhanced account balance calculation with smarter matching logic
CREATE OR REPLACE FUNCTION public.calculate_account_balances_smart(p_company_id uuid)
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
  
  -- Smart matching with improved logic
  WITH smart_matches AS (
    SELECT 
      coa.id as account_id,
      COALESCE(SUM(gl.amount), 0) as balance_amount
    FROM chart_of_accounts coa
    LEFT JOIN general_ledger gl ON (
      gl.company_id = p_company_id AND (
        -- Exact matches (fastest)
        gl.account_name = coa.full_name OR
        gl.split_account = coa.full_name OR
        gl.name = coa.full_name OR
        -- Account number matches
        (coa.account_number IS NOT NULL AND (
          gl.account_name = coa.account_number OR 
          gl.split_account = coa.account_number OR
          gl.account_name LIKE coa.account_number || '%' OR
          gl.split_account LIKE coa.account_number || '%'
        )) OR
        -- Smart partial matches - check if GL entry contains the chart account name
        (LENGTH(coa.full_name) > 5 AND (
          gl.account_name LIKE '%' || coa.full_name || '%' OR
          gl.split_account LIKE '%' || coa.full_name || '%'
        )) OR
        -- Match by removing account number prefix from GL entries
        (coa.account_number IS NOT NULL AND (
          SUBSTRING(gl.account_name FROM '[0-9.]+\\s+(.*)') = coa.full_name OR
          SUBSTRING(gl.split_account FROM '[0-9.]+\\s+(.*)') = coa.full_name
        ))
      )
    )
    WHERE coa.company_id = p_company_id
    GROUP BY coa.id
  ),
  updated_accounts AS (
    UPDATE chart_of_accounts 
    SET 
      current_balance = sm.balance_amount,
      updated_at = now()
    FROM smart_matches sm
    WHERE chart_of_accounts.id = sm.account_id 
    AND (chart_of_accounts.current_balance != sm.balance_amount OR chart_of_accounts.current_balance IS NULL)
    RETURNING chart_of_accounts.id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_accounts;
  
  RETURN QUERY SELECT updated_count, total_count;
END;
$function$;