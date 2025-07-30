-- Fix the remaining 6 functions with mutable search paths

-- Functions that still need search_path fixes
ALTER FUNCTION public.handle_proposal_approval_request() SET search_path TO 'public';
ALTER FUNCTION public.handle_proposal_approved() SET search_path TO 'public';
ALTER FUNCTION public.validate_lifecycle_stage_change() SET search_path TO 'public';
ALTER FUNCTION public.log_company_creation() SET search_path TO 'public';
ALTER FUNCTION public.log_company_creation(uuid, uuid, text, text, text, jsonb, boolean, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.update_investment_analysis_updated_at() SET search_path TO 'public';