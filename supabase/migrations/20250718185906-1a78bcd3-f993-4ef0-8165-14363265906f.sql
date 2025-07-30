-- Create function to get distinct roles for the microservice
CREATE OR REPLACE FUNCTION public.get_distinct_roles()
RETURNS TABLE(role text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT ur.role::text
  FROM public.user_roles ur
  ORDER BY ur.role::text;
$$;