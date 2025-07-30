-- Fix the last 2 functions with mutable search paths
-- Using the correct function names from the database query

ALTER FUNCTION public.find_potential_duplicate_companies(text, text, double precision) SET search_path TO 'public';
ALTER FUNCTION public.find_potential_duplicate_companies(text, text, text, double precision) SET search_path TO 'public';
ALTER FUNCTION public.validate_lifecycle_stage_transition() SET search_path TO 'public';