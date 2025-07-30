-- Fix the last remaining Function Search Path Mutable warnings 
-- Skip the extension fix for now since it has dependencies

-- Drop and recreate the problematic functions to ensure they have proper search paths
DROP FUNCTION IF EXISTS public.validate_lifecycle_stage() CASCADE;
DROP FUNCTION IF EXISTS public.find_potential_duplicates(text, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.log_company_creation() CASCADE;

-- Recreate validate_lifecycle_stage function with proper search path
CREATE OR REPLACE FUNCTION public.validate_lifecycle_stage()
 RETURNS trigger
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Validate lifecycle stage transitions
    IF NEW.lifecycle_stage IS NOT NULL THEN
        -- Ensure valid lifecycle stages
        IF NEW.lifecycle_stage NOT IN ('lead', 'prospect', 'client', 'inactive') THEN
            RAISE EXCEPTION 'Invalid lifecycle stage: %. Valid stages are: lead, prospect, client, inactive', NEW.lifecycle_stage;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Recreate find_potential_duplicates function with proper search path
CREATE OR REPLACE FUNCTION public.find_potential_duplicates(input_name text, threshold numeric DEFAULT 0.8)
 RETURNS TABLE(company_id uuid, company_name text, similarity_score numeric)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        cs.id,
        cs.company_name,
        public.similarity_score(input_name, cs.company_name) as similarity
    FROM public.company_settings cs
    WHERE public.similarity_score(input_name, cs.company_name) >= threshold
    AND cs.company_name != input_name
    ORDER BY similarity DESC
    LIMIT 10;
END;
$function$;

-- Recreate log_company_creation function with proper search path
CREATE OR REPLACE FUNCTION public.log_company_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Log company creation in audit trail if table exists
    BEGIN
        INSERT INTO public.audit_logs (
            user_id,
            company_id,
            action_type,
            resource_type,
            resource_id,
            new_values,
            status,
            details
        ) VALUES (
            auth.uid(),
            NEW.id,
            'created',
            'company_settings',
            NEW.id,
            to_jsonb(NEW),
            'success',
            format('Company "%s" created', NEW.company_name)
        );
    EXCEPTION WHEN undefined_table THEN
        -- Table doesn't exist, skip logging
        NULL;
    END;
    
    RETURN NEW;
END;
$function$;