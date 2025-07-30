-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_company_settings_name_search 
ON public.company_settings USING gin(to_tsvector('english', company_name));

CREATE INDEX IF NOT EXISTS idx_company_settings_status 
ON public.company_settings (subscription_status);

CREATE INDEX IF NOT EXISTS idx_company_settings_created_at 
ON public.company_settings (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invitations_search 
ON public.invitations USING gin(
  to_tsvector('english', company_name || ' ' || contact_name || ' ' || contact_email)
);

CREATE INDEX IF NOT EXISTS idx_invitations_status 
ON public.invitations (status);

CREATE INDEX IF NOT EXISTS idx_invitations_invited_at 
ON public.invitations (invited_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
ON public.user_roles (user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role 
ON public.user_roles (role);

-- Add function for efficient company search
CREATE OR REPLACE FUNCTION public.search_companies(search_term text, status_filter text DEFAULT 'all', limit_count int DEFAULT 50)
RETURNS TABLE (
  id uuid,
  company_name text,
  company_logo_url text,
  primary_color text,
  certificate_template text,
  email_notifications boolean,
  max_employees integer,
  subscription_status text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.id,
    cs.company_name,
    cs.company_logo_url,
    cs.primary_color,
    cs.certificate_template,
    cs.email_notifications,
    cs.max_employees,
    cs.subscription_status,
    cs.created_at,
    cs.updated_at
  FROM public.company_settings cs
  WHERE 
    (search_term = '' OR cs.company_name ILIKE '%' || search_term || '%')
    AND (status_filter = 'all' OR cs.subscription_status = status_filter)
  ORDER BY cs.created_at DESC
  LIMIT limit_count;
END;
$$;