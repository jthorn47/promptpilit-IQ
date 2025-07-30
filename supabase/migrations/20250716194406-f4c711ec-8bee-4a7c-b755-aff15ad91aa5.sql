-- Ensure the SBW-9237 module is enabled for Palms Liquor
INSERT INTO public.client_module_access (client_id, module_id, module_type, is_enabled, enabled_at, enabled_by)
VALUES ('facf515f-96db-4c26-9833-a609df01d2e5', 'sbw_9237', 'platform', true, now(), '79038e39-0f9c-4558-a9c3-87d60ec6c41a')
ON CONFLICT (client_id, module_id, module_type) 
DO UPDATE SET 
    is_enabled = true,
    enabled_at = now(),
    enabled_by = '79038e39-0f9c-4558-a9c3-87d60ec6c41a';