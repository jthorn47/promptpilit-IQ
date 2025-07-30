-- Fix the last 2 functions with mutable search paths
-- Based on the functions in the database, these are likely the remaining ones

ALTER FUNCTION public.calculate_conversion_rate(date, date) SET search_path TO 'public';
ALTER FUNCTION public.calculate_payroll_for_period(uuid) SET search_path TO 'public';