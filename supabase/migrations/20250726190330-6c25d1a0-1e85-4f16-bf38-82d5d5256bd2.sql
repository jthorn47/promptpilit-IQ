-- Fix search_path issues for time policy functions
DROP FUNCTION IF EXISTS public.update_time_policy_updated_at();
DROP FUNCTION IF EXISTS public.log_time_policy_changes();

-- Recreate functions with proper SECURITY DEFINER and search_path
CREATE OR REPLACE FUNCTION public.update_time_policy_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_time_policy_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only log if this is an actual change
  IF TG_OP = 'UPDATE' AND OLD IS NOT DISTINCT FROM NEW THEN
    RETURN NEW;
  END IF;
  
  INSERT INTO public.time_policy_audit_trail (
    policy_id,
    action_type,
    old_values,
    new_values,
    changed_fields,
    performed_by
  )
  VALUES (
    COALESCE(NEW.id, OLD.id),
    CASE TG_OP
      WHEN 'INSERT' THEN 'created'
      WHEN 'UPDATE' THEN 'updated'
      WHEN 'DELETE' THEN 'deleted'
    END,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    CASE 
      WHEN TG_OP = 'UPDATE' THEN 
        ARRAY(
          SELECT key FROM jsonb_each(to_jsonb(NEW)) 
          WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
        )
      ELSE NULL
    END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;