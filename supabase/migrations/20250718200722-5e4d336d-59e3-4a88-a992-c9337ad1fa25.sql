-- Fix remaining deprecated roles that weren't properly migrated
UPDATE public.user_roles 
SET role = 'admin'::app_role, updated_at = now()
WHERE role = 'internal_staff'::app_role;

-- Verify no deprecated roles remain
-- This should return 0 rows
DO $$
DECLARE
    deprecated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO deprecated_count 
    FROM public.user_roles 
    WHERE role::text IN ('internal_staff', 'sales_rep', 'moderator');
    
    IF deprecated_count > 0 THEN
        RAISE EXCEPTION 'Still found % deprecated roles after migration', deprecated_count;
    END IF;
    
    RAISE NOTICE 'Migration completed successfully - no deprecated roles remain';
END;
$$;