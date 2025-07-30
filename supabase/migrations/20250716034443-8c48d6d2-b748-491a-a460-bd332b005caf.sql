-- Check for functions that are marked as STABLE but might perform modifications
SELECT proname, provolatile 
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND provolatile = 's'  -- 's' means STABLE
AND proname LIKE '%insert%' OR proname LIKE '%update%' OR proname LIKE '%audit%' OR proname LIKE '%log%';

-- Fix the log_onboarding_changes function which is incorrectly marked as STABLE
DROP FUNCTION IF EXISTS public.log_onboarding_changes() CASCADE;

CREATE OR REPLACE FUNCTION public.log_onboarding_changes()
RETURNS trigger
LANGUAGE plpgsql
VOLATILE  -- Changed from STABLE to VOLATILE since it performs INSERT operations
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only log updates, not inserts
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.client_onboarding_audit (
      onboarding_profile_id,
      action_type,
      old_value,
      new_value,
      change_summary,
      performed_by
    ) VALUES (
      NEW.id,
      'profile_updated',
      to_jsonb(OLD),
      to_jsonb(NEW),
      'Client onboarding profile updated',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$function$;