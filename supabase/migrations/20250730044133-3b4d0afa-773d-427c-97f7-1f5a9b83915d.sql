-- Fix the remaining update_task_status function search path issue
-- Drop the function if it exists and recreate it with proper security settings
DROP FUNCTION IF EXISTS public.update_task_status();

-- Create the function with proper search path security
CREATE OR REPLACE FUNCTION public.update_task_status()
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