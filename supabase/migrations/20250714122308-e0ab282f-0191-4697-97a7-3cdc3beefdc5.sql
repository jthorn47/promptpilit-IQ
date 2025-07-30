-- Update wpv_plan_type constraint to allow 'website' value
ALTER TABLE public.client_sbw9237_modules 
DROP CONSTRAINT client_sbw9237_modules_wpv_plan_type_check;

ALTER TABLE public.client_sbw9237_modules 
ADD CONSTRAINT client_sbw9237_modules_wpv_plan_type_check 
CHECK (wpv_plan_type = ANY (ARRAY['html'::text, 'pdf'::text, 'website'::text]));