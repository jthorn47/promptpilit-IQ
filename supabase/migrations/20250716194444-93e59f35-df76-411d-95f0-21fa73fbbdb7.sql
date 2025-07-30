-- Update existing module access to enable SBW-9237 for Palms Liquor
UPDATE public.client_module_access 
SET 
    is_enabled = true,
    enabled_at = now(),
    enabled_by = '79038e39-0f9c-4558-a9c3-87d60ec6c41a'
WHERE client_id = 'facf515f-96db-4c26-9833-a609df01d2e5' 
AND module_id = 'sbw_9237';