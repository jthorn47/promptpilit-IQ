-- Publish the SBW-9237 module for Palms Liquor
UPDATE public.client_sbw9237_modules 
SET 
    status = 'published',
    published_at = now(),
    published_by = '79038e39-0f9c-4558-a9c3-87d60ec6c41a'
WHERE client_id = 'facf515f-96db-4c26-9833-a609df01d2e5';