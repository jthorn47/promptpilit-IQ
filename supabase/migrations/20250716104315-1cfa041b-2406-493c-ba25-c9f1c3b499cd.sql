-- Fix the last 2 functions with mutable search paths shown in Security Advisor
-- These are the exact function names from the screenshot

ALTER FUNCTION public.validate_lifecycle_stage_transit() SET search_path TO 'public';
ALTER FUNCTION public.find_potential_duplicate_company() SET search_path TO 'public';