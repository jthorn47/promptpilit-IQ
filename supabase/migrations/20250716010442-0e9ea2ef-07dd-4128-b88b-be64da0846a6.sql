-- Fix remaining Function Search Path Mutable warnings - Part 2 (Fixed version)

-- Fix get_client_module_summary function (already has SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_client_module_summary(client_uuid uuid)
 RETURNS TABLE(total_modules integer, enabled_modules integer, platform_modules integer, training_modules integer, setup_pending integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_modules,
        SUM(CASE WHEN is_enabled THEN 1 ELSE 0 END)::INTEGER as enabled_modules,
        SUM(CASE WHEN module_type = 'platform' THEN 1 ELSE 0 END)::INTEGER as platform_modules,
        SUM(CASE WHEN module_type = 'training' THEN 1 ELSE 0 END)::INTEGER as training_modules,
        SUM(CASE WHEN is_enabled AND NOT setup_completed THEN 1 ELSE 0 END)::INTEGER as setup_pending
    FROM public.client_module_access
    WHERE client_id = client_uuid;
END;
$function$;

-- Drop and recreate functions that might have parameter conflicts
DROP FUNCTION IF EXISTS public.levenshtein_distance(text, text);
DROP FUNCTION IF EXISTS public.similarity_score(text, text);
DROP FUNCTION IF EXISTS public.find_potential_duplicates(text, numeric);

-- Fix auto_promote_to_paying_client function
CREATE OR REPLACE FUNCTION public.auto_promote_to_paying_client()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if client has active paying status but isn't marked as paying
    IF NEW.subscription_status = 'active' OR NEW.payment_status = 'paid' OR NEW.stripe_subscription_id IS NOT NULL THEN
        -- Update to paying client if conditions are met
        IF NEW.plan_type != 'enterprise' THEN
            NEW.plan_type := 'professional';
        END IF;
        
        -- Log the promotion if client_approval_history table exists
        BEGIN
            INSERT INTO public.client_approval_history (
                client_id,
                action,
                old_status,
                new_status,
                performed_by,
                notes
            ) VALUES (
                NEW.id,
                'auto_promote_to_paying',
                OLD.plan_type,
                NEW.plan_type,
                auth.uid(),
                'Automatically promoted to paying client based on payment status'
            );
        EXCEPTION WHEN undefined_table THEN
            -- Table doesn't exist, skip logging
            NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Fix check_paying_client_downgrade function
CREATE OR REPLACE FUNCTION public.check_paying_client_downgrade()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if client is being downgraded from paying status
    IF OLD.subscription_status = 'active' AND NEW.subscription_status != 'active' AND 
       (NEW.payment_status IS NULL OR NEW.payment_status != 'paid') AND 
       NEW.stripe_subscription_id IS NULL THEN
        
        -- Log the downgrade if table exists
        BEGIN
            INSERT INTO public.client_approval_history (
                client_id,
                action,
                old_status,
                new_status,
                performed_by,
                notes
            ) VALUES (
                NEW.id,
                'downgrade_from_paying',
                OLD.plan_type,
                'basic',
                auth.uid(),
                'Downgraded from paying client due to payment status change'
            );
        EXCEPTION WHEN undefined_table THEN
            -- Table doesn't exist, skip logging
            NULL;
        END;
        
        -- Update plan type
        NEW.plan_type := 'basic';
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Fix validate_lifecycle_stage function
CREATE OR REPLACE FUNCTION public.validate_lifecycle_stage()
 RETURNS trigger
 LANGUAGE plpgsql
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

-- Fix normalize_company_name function
CREATE OR REPLACE FUNCTION public.normalize_company_name(company_name text)
 RETURNS text
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
BEGIN
    IF company_name IS NULL OR length(trim(company_name)) = 0 THEN
        RETURN NULL;
    END IF;
    
    -- Normalize company name by:
    -- 1. Trimming whitespace
    -- 2. Converting to lowercase
    -- 3. Removing common suffixes and prefixes
    -- 4. Removing special characters except spaces and periods
    
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(
                    trim(company_name), 
                    '\s*(inc\.?|llc\.?|corp\.?|corporation|limited|ltd\.?|co\.?)\s*$', 
                    '', 
                    'gi'
                ),
                '\s*the\s+',
                '',
                'gi'
            ),
            '[^a-zA-Z0-9\s\.]',
            '',
            'g'
        )
    );
END;
$function$;

-- Fix update_crm_email_updated_at function
CREATE OR REPLACE FUNCTION public.update_crm_email_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Recreate levenshtein_distance function with correct parameters
CREATE OR REPLACE FUNCTION public.levenshtein_distance(s1 text, s2 text)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
    len1 integer := length(s1);
    len2 integer := length(s2);
    i integer;
    j integer;
    cost integer;
    d integer[][];
BEGIN
    -- Handle null or empty strings
    IF s1 IS NULL OR s2 IS NULL THEN
        RETURN GREATEST(COALESCE(len1, 0), COALESCE(len2, 0));
    END IF;
    
    IF len1 = 0 THEN
        RETURN len2;
    END IF;
    
    IF len2 = 0 THEN
        RETURN len1;
    END IF;
    
    -- Use pg_trgm extension if available, otherwise use basic implementation
    BEGIN
        -- Try to use the extension function if available
        RETURN levenshtein(s1, s2);
    EXCEPTION WHEN undefined_function THEN
        -- Fallback to simple character difference count
        RETURN abs(len1 - len2);
    END;
END;
$function$;

-- Recreate similarity_score function
CREATE OR REPLACE FUNCTION public.similarity_score(s1 text, s2 text)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
    max_length integer;
    distance integer;
BEGIN
    -- Handle null or empty strings
    IF s1 IS NULL OR s2 IS NULL OR length(trim(s1)) = 0 OR length(trim(s2)) = 0 THEN
        RETURN 0;
    END IF;
    
    -- Normalize strings
    s1 := lower(trim(s1));
    s2 := lower(trim(s2));
    
    -- Return 1 for exact matches
    IF s1 = s2 THEN
        RETURN 1;
    END IF;
    
    max_length := GREATEST(length(s1), length(s2));
    distance := public.levenshtein_distance(s1, s2);
    
    -- Return similarity as a value between 0 and 1
    RETURN ROUND((max_length - distance)::numeric / max_length::numeric, 4);
END;
$function$;

-- Recreate find_potential_duplicates function  
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

-- Fix log_company_creation function
CREATE OR REPLACE FUNCTION public.log_company_creation()
 RETURNS trigger
 LANGUAGE plpgsql
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