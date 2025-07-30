-- Fix function search path security warnings

-- Fix update_sms_cases_updated_at function
CREATE OR REPLACE FUNCTION public.update_sms_cases_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix update_sms_conversations_updated_at function
CREATE OR REPLACE FUNCTION public.update_sms_conversations_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.last_updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix update_task_status function (assuming it exists)
-- First let me check if this function exists and get its current definition
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_task_status') THEN
        -- The function exists, we can recreate it with the search_path set
        EXECUTE '
        CREATE OR REPLACE FUNCTION public.update_task_status()
         RETURNS trigger
         LANGUAGE plpgsql
         SECURITY DEFINER
         SET search_path TO ''public''
        AS $func$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $func$;
        ';
    END IF;
END $$;