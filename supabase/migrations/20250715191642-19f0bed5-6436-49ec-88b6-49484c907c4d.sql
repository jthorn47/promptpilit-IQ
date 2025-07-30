-- Add client module access for SBW-9237 to Palms Liquor
INSERT INTO public.client_module_access (
    client_id,
    module_id,
    module_type,
    is_enabled,
    enabled_at,
    setup_completed,
    created_at,
    updated_at
) VALUES (
    '96c1ca74-9a84-4040-880f-249a464dd18d',
    'sbw_9237',
    'training',
    true,
    now(),
    false,
    now(),
    now()
) ON CONFLICT (client_id, module_id) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    enabled_at = EXCLUDED.enabled_at,
    updated_at = now();