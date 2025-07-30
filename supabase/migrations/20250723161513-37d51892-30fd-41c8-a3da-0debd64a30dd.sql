-- Drop the old function first
DROP FUNCTION IF EXISTS calculate_account_balances_from_gl(UUID);

-- Create a much more efficient version using bulk operations
CREATE OR REPLACE FUNCTION calculate_account_balances_from_gl(p_company_id UUID)
RETURNS TABLE(
  accounts_updated INTEGER,
  total_entries INTEGER
) AS $$
DECLARE
  updated_count INTEGER := 0;
  total_count INTEGER;
BEGIN
  -- Get total entries count
  SELECT COUNT(*) INTO total_count FROM general_ledger WHERE company_id = p_company_id;
  
  -- Use a single bulk update with CTE for much better performance
  WITH account_balances AS (
    SELECT 
      coa.id as account_id,
      COALESCE(SUM(gl.amount), 0) as balance_amount
    FROM chart_of_accounts coa
    LEFT JOIN general_ledger gl ON (
      gl.company_id = p_company_id AND (
        -- Exact matches first (fastest)
        gl.account_name = coa.full_name OR
        gl.split_account = coa.full_name OR
        gl.name = coa.full_name OR
        -- Number matches
        (coa.account_number IS NOT NULL AND (
          gl.account_name = coa.account_number OR 
          gl.split_account = coa.account_number
        )) OR
        -- Fuzzy matches last (slower but necessary)
        (gl.account_name ILIKE '%' || coa.full_name || '%') OR
        (gl.split_account ILIKE '%' || coa.full_name || '%') OR
        (gl.name ILIKE '%' || coa.full_name || '%') OR
        (coa.account_number IS NOT NULL AND (
          gl.account_name ILIKE '%' || coa.account_number || '%' OR
          gl.split_account ILIKE '%' || coa.account_number || '%'
        ))
      )
    )
    WHERE coa.company_id = p_company_id
    GROUP BY coa.id, coa.full_name
  ),
  updated_accounts AS (
    UPDATE chart_of_accounts 
    SET 
      current_balance = ab.balance_amount,
      updated_at = now()
    FROM account_balances ab
    WHERE chart_of_accounts.id = ab.account_id 
    AND ab.balance_amount != 0
    RETURNING chart_of_accounts.id
  )
  SELECT COUNT(*) INTO updated_count FROM updated_accounts;
  
  RETURN QUERY SELECT updated_count, total_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;