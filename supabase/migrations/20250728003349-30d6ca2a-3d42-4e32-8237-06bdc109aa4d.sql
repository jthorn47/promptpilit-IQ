-- Step 1: Enable CRM module access globally
UPDATE client_module_access 
SET is_enabled = true, 
    enabled_at = now(),
    updated_at = now()
WHERE module_id = 'crm' AND module_type = 'platform';

-- Step 2: Add CRM to company modules for existing companies
UPDATE company_settings 
SET modules_enabled = array_append(modules_enabled, 'crm')
WHERE NOT ('crm' = ANY(modules_enabled));

-- Step 3: Insert forecasting feature flags without conflict resolution
INSERT INTO client_module_access (module_id, module_type, client_id, is_enabled, settings, enabled_at)
SELECT 
    'crm-forecasting',
    'feature',
    cs.id,
    true,
    jsonb_build_object(
        'forecasting_enabled', true,
        'forecasting_features', array['pipeline_analytics', 'revenue_forecasting', 'sales_trends']
    ),
    now()
FROM company_settings cs
WHERE NOT EXISTS (
    SELECT 1 FROM client_module_access cma 
    WHERE cma.module_id = 'crm-forecasting' 
    AND cma.client_id = cs.id
);