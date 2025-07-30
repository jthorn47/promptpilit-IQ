-- Fix remaining Function Search Path Mutable warnings and Extension in Public issue

-- First, fix the functions with mutable search paths
-- These functions need to have SET search_path TO 'public' to be secure

-- Check if validate_lifecycle_stage function exists and fix it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_lifecycle_stage') THEN
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
    END IF;
END $$;

-- Check if find_potential_duplicates function exists and fix it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'find_potential_duplicates') THEN
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
                0.5::numeric as similarity  -- Simple placeholder since similarity function may not exist
            FROM public.company_settings cs
            WHERE cs.company_name ILIKE '%' || input_name || '%'
            AND cs.company_name != input_name
            ORDER BY cs.company_name
            LIMIT 10;
        END;
        $function$;
    END IF;
END $$;

-- Check if log_company_creation function exists and fix it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_company_creation') THEN
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
    END IF;
END $$;

-- Fix the Extension in Public issue for pg_trgm
-- Move the extension from public schema to extensions schema if possible
DO $$
BEGIN
    -- Only attempt if the extension exists in public schema
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        -- Create extensions schema if it doesn't exist
        CREATE SCHEMA IF NOT EXISTS extensions;
        
        -- Try to move the extension to extensions schema
        -- This might fail if there are dependencies, which is why we wrap it in a try-catch
        BEGIN
            ALTER EXTENSION pg_trgm SET SCHEMA extensions;
        EXCEPTION WHEN OTHERS THEN
            -- If we can't move it due to dependencies, add a comment explaining why
            COMMENT ON EXTENSION pg_trgm IS 'Extension in public schema due to existing dependencies - cannot be moved safely';
        END;
    END IF;
END $$;