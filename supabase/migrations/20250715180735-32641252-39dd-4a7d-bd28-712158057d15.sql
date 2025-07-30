-- Add SBW-9237 module to all existing clients that don't have it
INSERT INTO public.client_sbw9237_modules (
    client_id,
    company_id,
    status,
    intro_custom_text,
    created_by
)
SELECT 
    c.id as client_id,
    c.company_settings_id as company_id,
    'unpublished' as status,
    'Welcome to your SB 553 Workplace Violence Prevention Training prepared specifically for ' || c.company_name || '.' as intro_custom_text,
    NULL as created_by
FROM public.clients c
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.client_sbw9237_modules csm 
    WHERE csm.client_id = c.id
);

-- Add SBW-9237 to client_module_access for existing clients
INSERT INTO public.client_module_access (
    client_id,
    module_id,
    module_type,
    is_enabled,
    setup_completed
)
SELECT 
    c.id as client_id,
    'sbw_9237' as module_id,
    'training' as module_type,
    false as is_enabled,
    false as setup_completed
FROM public.clients c
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.client_module_access cma 
    WHERE cma.client_id = c.id 
    AND cma.module_id = 'sbw_9237' 
    AND cma.module_type = 'training'
);