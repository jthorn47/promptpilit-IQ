-- Fix the mutable search path warning for the payroll function
CREATE OR REPLACE FUNCTION public.update_payroll_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;