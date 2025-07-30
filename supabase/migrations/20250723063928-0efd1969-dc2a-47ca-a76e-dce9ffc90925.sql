-- Update account number validation to allow longer hierarchical account numbers
CREATE OR REPLACE FUNCTION public.validate_account_number(account_num TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Allow hierarchical account numbers like 1001.00, 7000.04.02, etc.
    RETURN account_num ~ '^[0-9]{4}(\.[0-9]{2})*$';
END;
$$;