-- Fix Function Search Path Mutable issues by setting proper search paths

-- Update log_application_stage_change function
CREATE OR REPLACE FUNCTION public.log_application_stage_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Only log if stage actually changed
    IF OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
        INSERT INTO public.ats_application_activities (
            application_id,
            user_id,
            activity_type,
            description,
            old_stage,
            new_stage
        ) VALUES (
            NEW.id,
            auth.uid(),
            'stage_change',
            'Application stage changed from ' || COALESCE(OLD.current_stage::text, 'none') || ' to ' || NEW.current_stage::text,
            OLD.current_stage,
            NEW.current_stage
        );
    END IF;
    RETURN NEW;
END;
$function$;

-- Update generate_career_page_embed_code function
CREATE OR REPLACE FUNCTION public.generate_career_page_embed_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.embed_code := '<iframe src="https://your-domain.com/careers/' || NEW.company_id || '" width="100%" height="600" frameborder="0" style="border: none;"></iframe>';
    RETURN NEW;
END;
$function$;

-- Update log_pay_type_changes function
CREATE OR REPLACE FUNCTION public.log_pay_type_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only log if this is an actual change
  IF TG_OP = 'UPDATE' AND OLD IS NOT DISTINCT FROM NEW THEN
    RETURN NEW;
  END IF;
  
  INSERT INTO public.pay_type_audit_trail (
    pay_type_id,
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
      WHEN 'DELETE' THEN 'disabled'
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
$function$;

-- Update update_ach_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_ach_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update validate_routing_number function
CREATE OR REPLACE FUNCTION public.validate_routing_number(routing_number text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
    sum_total INTEGER := 0;
    digit INTEGER;
    multiplier INTEGER;
BEGIN
    -- Must be exactly 9 digits
    IF length(routing_number) != 9 OR routing_number !~ '^[0-9]+$' THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate checksum: (3×d1 + 7×d2 + 1×d3 + 3×d4 + 7×d5 + 1×d6 + 3×d7 + 7×d8 + 1×d9) mod 10 = 0
    FOR i IN 1..9 LOOP
        digit := substring(routing_number FROM i FOR 1)::INTEGER;
        CASE (i - 1) % 3
            WHEN 0 THEN multiplier := 3;
            WHEN 1 THEN multiplier := 7;
            WHEN 2 THEN multiplier := 1;
        END CASE;
        sum_total := sum_total + (digit * multiplier);
    END LOOP;
    
    RETURN (sum_total % 10) = 0;
END;
$function$;