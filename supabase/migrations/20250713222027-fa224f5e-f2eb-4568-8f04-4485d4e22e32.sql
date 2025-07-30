-- Fix Function Search Path Mutable warnings for remaining functions

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 STABLE
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_client_onboarding_updated_at function  
CREATE OR REPLACE FUNCTION public.update_client_onboarding_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 STABLE
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$function$;

-- Fix log_onboarding_changes function
CREATE OR REPLACE FUNCTION public.log_onboarding_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 STABLE
 SET search_path = 'public'
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