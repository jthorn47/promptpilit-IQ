-- Fix the final 16 remaining functions without secure search_path

-- Query the exact function names and fix them
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Get all functions in public schema that don't have search_path set to public
    FOR func_record IN 
        SELECT 
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname NOT LIKE 'pg_%'
        AND p.proname NOT LIKE 'information_schema_%'
        AND (p.proconfig IS NULL OR NOT EXISTS (
            SELECT 1 FROM unnest(p.proconfig) AS config 
            WHERE config LIKE 'search_path=public'
        ))
    LOOP
        -- Execute ALTER FUNCTION for each function
        EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path TO ''public''', 
                      func_record.function_name, 
                      func_record.args);
        
        RAISE NOTICE 'Fixed function: %', func_record.function_name;
    END LOOP;
END $$;