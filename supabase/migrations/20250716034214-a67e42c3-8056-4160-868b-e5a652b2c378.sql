-- Fix functions that are incorrectly marked as STABLE but perform INSERT operations
-- The update_updated_at_column function should be VOLATILE since it modifies data

-- Drop and recreate the function with correct volatility
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
VOLATILE  -- Changed from STABLE to VOLATILE since it modifies data
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Recreate any triggers that were dropped
CREATE OR REPLACE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON public.company_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Also fix the client onboarding function if it exists
DROP FUNCTION IF EXISTS public.update_client_onboarding_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_client_onboarding_updated_at()
RETURNS trigger
LANGUAGE plpgsql
VOLATILE  -- Changed from STABLE to VOLATILE since it modifies data
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$function$;