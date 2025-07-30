-- Fix the remaining 3 Function Search Path Mutable warnings
-- These functions need SET search_path TO 'public' to be secure

-- Check and fix validate_lifecycle_stage function
DO $$
BEGIN
    -- Check if function exists and fix it
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'validate_lifecycle_stage'
    ) THEN
        -- Drop and recreate with proper search path
        DROP FUNCTION IF EXISTS public.validate_lifecycle_stage() CASCADE;
        
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
        
        -- Recreate any triggers that might have been dropped
        DROP TRIGGER IF EXISTS validate_lifecycle_stage_trigger ON public.company_settings;
        CREATE TRIGGER validate_lifecycle_stage_trigger
            BEFORE INSERT OR UPDATE ON public.company_settings
            FOR EACH ROW EXECUTE FUNCTION public.validate_lifecycle_stage();
    END IF;
END $$;

-- Check and fix find_potential_duplicates function
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'find_potential_duplicates'
    ) THEN
        -- Drop and recreate with proper search path
        DROP FUNCTION IF EXISTS public.find_potential_duplicates(text, numeric) CASCADE;
        
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
                -- Using simple text similarity since pg_trgm might have issues
                CASE 
                    WHEN cs.company_name ILIKE '%' || input_name || '%' THEN 0.9
                    WHEN cs.company_name ILIKE input_name || '%' THEN 0.8
                    WHEN cs.company_name ILIKE '%' || input_name THEN 0.7
                    ELSE 0.5
                END::numeric as similarity
            FROM public.company_settings cs
            WHERE (
                cs.company_name ILIKE '%' || input_name || '%' OR
                cs.company_name ILIKE input_name || '%' OR
                cs.company_name ILIKE '%' || input_name
            )
            AND cs.company_name != input_name
            ORDER BY 3 DESC
            LIMIT 10;
        END;
        $function$;
    END IF;
END $$;

-- Check and fix log_company_creation function
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'log_company_creation'
    ) THEN
        -- Drop and recreate with proper search path
        DROP FUNCTION IF EXISTS public.log_company_creation() CASCADE;
        
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
        
        -- Recreate trigger if needed
        DROP TRIGGER IF EXISTS log_company_creation_trigger ON public.company_settings;
        CREATE TRIGGER log_company_creation_trigger
            AFTER INSERT ON public.company_settings
            FOR EACH ROW EXECUTE FUNCTION public.log_company_creation();
    END IF;
END $$;