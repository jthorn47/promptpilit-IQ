-- Function to get unmatched GL entries
CREATE OR REPLACE FUNCTION public.get_unmatched_gl_entries(p_company_id uuid)
 RETURNS TABLE(
   account_name text,
   split_account text,
   name text,
   entry_count bigint,
   total_amount numeric
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH mapped_gl_names AS (
    -- Get all GL account names that already have mappings
    SELECT DISTINCT gam.gl_account_name
    FROM gl_account_mappings gam
    WHERE gam.company_id = p_company_id
  ),
  auto_matched_names AS (
    -- Get GL names that match automatically
    SELECT DISTINCT gl.account_name as gl_name
    FROM general_ledger gl
    JOIN chart_of_accounts coa ON (
      coa.company_id = p_company_id AND (
        gl.account_name = coa.full_name OR
        gl.account_name = coa.account_number OR
        gl.account_name = coa.account_number || ' ' || coa.full_name OR
        gl.account_name = coa.account_number || ':' || coa.full_name
      )
    )
    WHERE gl.company_id = p_company_id
    
    UNION
    
    SELECT DISTINCT gl.split_account as gl_name
    FROM general_ledger gl
    JOIN chart_of_accounts coa ON (
      coa.company_id = p_company_id AND (
        gl.split_account = coa.full_name OR
        gl.split_account = coa.account_number OR
        gl.split_account = coa.account_number || ' ' || coa.full_name OR
        gl.split_account = coa.account_number || ':' || coa.full_name
      )
    )
    WHERE gl.company_id = p_company_id
    
    UNION
    
    SELECT DISTINCT gl.name as gl_name
    FROM general_ledger gl
    JOIN chart_of_accounts coa ON (
      coa.company_id = p_company_id AND (
        gl.name = coa.full_name OR
        gl.name = coa.account_number OR
        gl.name = coa.account_number || ' ' || coa.full_name OR
        gl.name = coa.account_number || ':' || coa.full_name
      )
    )
    WHERE gl.company_id = p_company_id
  )
  SELECT 
    gl.account_name,
    gl.split_account,
    gl.name,
    COUNT(*) as entry_count,
    SUM(gl.amount) as total_amount
  FROM general_ledger gl
  WHERE gl.company_id = p_company_id
  AND gl.account_name NOT IN (SELECT gl_account_name FROM mapped_gl_names)
  AND gl.split_account NOT IN (SELECT gl_account_name FROM mapped_gl_names)
  AND gl.name NOT IN (SELECT gl_account_name FROM mapped_gl_names)
  AND gl.account_name NOT IN (SELECT gl_name FROM auto_matched_names)
  AND gl.split_account NOT IN (SELECT gl_name FROM auto_matched_names)  
  AND gl.name NOT IN (SELECT gl_name FROM auto_matched_names)
  GROUP BY gl.account_name, gl.split_account, gl.name
  ORDER BY COUNT(*) DESC, ABS(SUM(gl.amount)) DESC;
END;
$function$;