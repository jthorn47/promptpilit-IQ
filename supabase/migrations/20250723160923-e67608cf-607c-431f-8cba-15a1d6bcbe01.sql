-- Function to calculate account balances from general ledger data
CREATE OR REPLACE FUNCTION calculate_account_balances_from_gl(p_company_id UUID)
RETURNS TABLE(
  accounts_updated INTEGER,
  total_entries INTEGER
) AS $$
DECLARE
  account_record RECORD;
  balance_amount NUMERIC;
  updated_count INTEGER := 0;
  total_count INTEGER;
BEGIN
  -- Get total entries count
  SELECT COUNT(*) INTO total_count FROM general_ledger WHERE company_id = p_company_id;
  
  -- Update each chart of accounts balance based on general ledger entries
  FOR account_record IN 
    SELECT id, account_name, account_number 
    FROM chart_of_accounts 
    WHERE company_id = p_company_id
  LOOP
    -- Calculate balance for this account by matching account names
    SELECT COALESCE(SUM(amount), 0) INTO balance_amount
    FROM general_ledger gl
    WHERE gl.company_id = p_company_id
    AND (
      gl.account_name ILIKE '%' || account_record.account_name || '%'
      OR gl.split_account ILIKE '%' || account_record.account_name || '%'
      OR gl.name ILIKE '%' || account_record.account_name || '%'
      OR (account_record.account_number IS NOT NULL AND 
          (gl.account_name ILIKE '%' || account_record.account_number || '%'
           OR gl.split_account ILIKE '%' || account_record.account_number || '%'))
    );
    
    -- Update the account balance if non-zero
    IF balance_amount != 0 THEN
      UPDATE chart_of_accounts 
      SET current_balance = balance_amount, updated_at = now()
      WHERE id = account_record.id;
      updated_count := updated_count + 1;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT updated_count, total_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;