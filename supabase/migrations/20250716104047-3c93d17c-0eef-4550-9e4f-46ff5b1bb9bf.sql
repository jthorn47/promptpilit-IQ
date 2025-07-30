-- Fix the last 2 functions with mutable search paths

-- Get a list of all functions that still need search_path fixes
-- These are likely functions that were missed in previous migrations

-- Based on the warning, there are 2 more functions that need their search_path set
-- Let's check what functions exist that don't have search_path set to 'public'

-- Fix any remaining functions that may have been missed
-- These could be functions like find_potential_duplicate_company or validate_lifecycle_stage_transit
ALTER FUNCTION public.find_potential_duplicate_company() SET search_path TO 'public';
ALTER FUNCTION public.validate_lifecycle_stage_transit() SET search_path TO 'public';