-- Create a temporary function to count companies (bypass RLS for diagnosis)
CREATE OR REPLACE FUNCTION public.count_all_companies()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.company_settings;
$$;

-- Create a function to get sample companies for super admins
CREATE OR REPLACE FUNCTION public.get_sample_companies()
RETURNS TABLE(
  id uuid,
  company_name text,
  subscription_status text,
  created_at timestamp with time zone
)
LANGUAGE SQL
SECURITY DEFINER  
SET search_path = public
AS $$
  SELECT 
    cs.id,
    cs.company_name,
    cs.subscription_status,
    cs.created_at
  FROM public.company_settings cs
  WHERE has_role(auth.uid(), 'super_admin'::app_role)
  ORDER BY cs.created_at DESC
  LIMIT 5;
$$;