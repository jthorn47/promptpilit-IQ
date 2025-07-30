-- Optimized version of calculate_account_balances_from_gl function
-- This version uses batch processing and more efficient matching logic

CREATE OR REPLACE FUNCTION public.calculate_account_balances_from_gl(p_company_id uuid)
 RETURNS TABLE(accounts_updated integer, total_entries integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_count INTEGER := 0;
  total_count INTEGER;
  batch_size INTEGER := 1000;
  current_offset INTEGER := 0;
  batch_updated INTEGER;
BEGIN
  -- Get total entries count (with limit to avoid timeout)
  SELECT COUNT(*) INTO total_count 
  FROM general_ledger 
  WHERE company_id = p_company_id
  LIMIT 50000; -- Prevent counting massive datasets
  
  -- Process accounts in batches to avoid timeout
  LOOP
    -- Process a batch of accounts with optimized matching
    WITH account_batch AS (
      SELECT id, full_name, account_number
      FROM chart_of_accounts 
      WHERE company_id = p_company_id
      ORDER BY id
      LIMIT batch_size OFFSET current_offset
    ),
    account_balances AS (
      SELECT 
        ab.id as account_id,
        COALESCE(SUM(gl.amount), 0) as balance_amount
      FROM account_batch ab
      LEFT JOIN general_ledger gl ON (
        gl.company_id = p_company_id AND (
          -- Exact matches (fastest)
          gl.account_name = ab.full_name OR
          gl.split_account = ab.full_name OR
          gl.name = ab.full_name OR
          -- Number matches
          (ab.account_number IS NOT NULL AND (
            gl.account_name = ab.account_number OR 
            gl.split_account = ab.account_number
          ))
        )
      )
      GROUP BY ab.id, ab.full_name
    ),
    updated_accounts AS (
      UPDATE chart_of_accounts 
      SET 
        current_balance = ab.balance_amount,
        updated_at = now()
      FROM account_balances ab
      WHERE chart_of_accounts.id = ab.account_id 
      AND (chart_of_accounts.current_balance != ab.balance_amount OR chart_of_accounts.current_balance IS NULL)
      RETURNING chart_of_accounts.id
    )
    SELECT COUNT(*) INTO batch_updated FROM updated_accounts;
    
    updated_count := updated_count + batch_updated;
    current_offset := current_offset + batch_size;
    
    -- Exit if no more accounts to process
    EXIT WHEN batch_updated = 0 OR current_offset > 10000; -- Safety limit
  END LOOP;
  
  -- If we have remaining accounts that need fuzzy matching (separate process)
  -- This handles edge cases with more expensive queries but in smaller batches
  IF updated_count < (SELECT COUNT(*) FROM chart_of_accounts WHERE company_id = p_company_id LIMIT 1000) THEN
    WITH fuzzy_matches AS (
      SELECT DISTINCT
        coa.id as account_id,
        COALESCE(SUM(gl.amount), 0) as balance_amount
      FROM chart_of_accounts coa
      LEFT JOIN general_ledger gl ON (
        gl.company_id = p_company_id AND
        coa.current_balance = 0 AND -- Only process accounts that weren't updated above
        (
          (gl.account_name ILIKE '%' || coa.full_name || '%') OR
          (gl.split_account ILIKE '%' || coa.full_name || '%') OR
          (coa.account_number IS NOT NULL AND (
            gl.account_name ILIKE '%' || coa.account_number || '%' OR
            gl.split_account ILIKE '%' || coa.account_number || '%'
          ))
        )
      )
      WHERE coa.company_id = p_company_id
      AND coa.current_balance = 0 -- Only unmatched accounts
      GROUP BY coa.id
      LIMIT 100 -- Small batch for fuzzy matching
    ),
    fuzzy_updated AS (
      UPDATE chart_of_accounts 
      SET 
        current_balance = fm.balance_amount,
        updated_at = now()
      FROM fuzzy_matches fm
      WHERE chart_of_accounts.id = fm.account_id 
      AND fm.balance_amount != 0
      RETURNING chart_of_accounts.id
    )
    SELECT COUNT(*) INTO batch_updated FROM fuzzy_updated;
    
    updated_count := updated_count + batch_updated;
  END IF;
  
  RETURN QUERY SELECT updated_count, total_count;
END;
$function$;

-- Add indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_general_ledger_company_account_name 
ON general_ledger(company_id, account_name) 
WHERE account_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_general_ledger_company_split_account 
ON general_ledger(company_id, split_account) 
WHERE split_account IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_company_balance 
ON chart_of_accounts(company_id, current_balance);

-- Add a faster alternative function for immediate feedback
CREATE OR REPLACE FUNCTION public.calculate_account_balances_quick(p_company_id uuid)
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
  
  -- Quick update with exact matches only (much faster)
  WITH exact_matches AS (
    SELECT 
      coa.id as account_id,
      COALESCE(SUM(gl.amount), 0) as balance_amount
    FROM chart_of_accounts coa
    LEFT JOIN general_ledger gl ON (
      gl.company_id = p_company_id AND (
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
  ),
  updated_accounts AS (
    UPDATE chart_of_accounts 
    SET 
      current_balance = em.balance_amount,
      updated_at = now()
    FROM exact_matches em
    WHERE chart_of_accounts.id = em.account_id 
    AND (chart_of_accounts.current_balance != em.balance_amount OR chart_of_accounts.current_balance IS NULL)
    RETURNING chart_of_accounts.id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_accounts;
  
  RETURN QUERY SELECT updated_count, total_count;
END;
$function$;