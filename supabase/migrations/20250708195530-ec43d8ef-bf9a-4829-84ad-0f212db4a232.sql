-- Add wpv_plan_content column to company_settings table
ALTER TABLE public.company_settings 
ADD COLUMN wpv_plan_content TEXT DEFAULT NULL;