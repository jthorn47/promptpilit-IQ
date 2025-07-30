-- Fix the last remaining function search path issue

-- Check if update_task_status function exists and fix it
CREATE OR REPLACE FUNCTION public.update_task_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Also check for any other potential functions that might need fixing
-- Let's also ensure we have proper search_path on any other common trigger functions

CREATE OR REPLACE FUNCTION public.update_halo_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_halobroker_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;