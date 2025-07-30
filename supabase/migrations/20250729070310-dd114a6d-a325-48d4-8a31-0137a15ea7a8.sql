-- Fix the Security Definer View error and remaining security issues

-- 1. Fix the Security Definer View for crm_metrics
-- Drop the security definer view and recreate as a regular view or function
DROP VIEW IF EXISTS public.crm_metrics;

-- Create a secure function instead of a security definer view
CREATE OR REPLACE FUNCTION public.get_crm_metrics()
RETURNS TABLE(
  total_leads bigint,
  total_deals bigint,
  total_activities bigint,
  conversion_rate numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    (SELECT count(*) FROM public.leads) as total_leads,
    (SELECT count(*) FROM public.deals) as total_deals,
    (SELECT count(*) FROM public.activities) as total_activities,
    CASE 
      WHEN (SELECT count(*) FROM public.leads) > 0 
      THEN round((SELECT count(*) FROM public.deals WHERE status = 'won')::numeric / (SELECT count(*) FROM public.leads)::numeric * 100, 2)
      ELSE 0
    END as conversion_rate;
$$;

-- 2. Fix remaining functions that need search_path

-- Update all functions to include proper search_path
CREATE OR REPLACE FUNCTION public.update_article_view_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.knowledge_base_articles 
  SET view_count = view_count + 1,
      last_viewed_at = NEW.viewed_at
  WHERE id = NEW.article_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_case_documents_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_case_share_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN 'inv_' || encode(gen_random_bytes(32), 'base64url');
END;
$$;