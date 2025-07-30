-- Add SBW-9237 back to training modules catalog
INSERT INTO public.training_modules_catalog (
    module_id,
    name,
    description,
    category,
    is_premium,
    is_beta,
    is_coming_soon,
    requires_setup,
    icon,
    created_at,
    updated_at
) VALUES (
    'sbw_9237',
    'SBW-9237 Workplace Violence Prevention',
    'California Senate Bill 9237 (SB 553) Workplace Violence Prevention Training - Comprehensive safety training to meet state compliance requirements.',
    'safety',
    true,
    false,
    false,
    true,
    'Shield',
    now(),
    now()
) ON CONFLICT (module_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    is_premium = EXCLUDED.is_premium,
    is_beta = EXCLUDED.is_beta,
    is_coming_soon = EXCLUDED.is_coming_soon,
    requires_setup = EXCLUDED.requires_setup,
    icon = EXCLUDED.icon,
    updated_at = now();