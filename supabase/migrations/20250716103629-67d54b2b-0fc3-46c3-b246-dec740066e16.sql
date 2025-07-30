-- Fix search_path security issues in database functions
-- This ensures functions have a fixed search path to prevent security vulnerabilities

-- Update the functions that have mutable search paths
ALTER FUNCTION public.update_investment_analysis_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.handle_risk_assessment_completed() SET search_path TO 'public';
ALTER FUNCTION public.handle_proposal_approval_request() SET search_path TO 'public';
ALTER FUNCTION public.handle_proposal_approved() SET search_path TO 'public';
ALTER FUNCTION public.validate_lifecycle_stage_change() SET search_path TO 'public';
ALTER FUNCTION public.find_potential_duplicate_company() SET search_path TO 'public';
ALTER FUNCTION public.log_company_creation() SET search_path TO 'public';
ALTER FUNCTION public.validate_lifecycle_stage_transit() SET search_path TO 'public';

-- Update other functions that may not have fixed search paths
ALTER FUNCTION public.update_updated_at_learning() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_video_tables() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.ensure_single_primary_contact() SET search_path TO 'public';
ALTER FUNCTION public.create_sbw9237_module_for_client() SET search_path TO 'public';
ALTER FUNCTION public.log_application_stage_change() SET search_path TO 'public';
ALTER FUNCTION public.handle_company_to_client() SET search_path TO 'public';
ALTER FUNCTION public.generate_career_page_embed_code() SET search_path TO 'public';
ALTER FUNCTION public.log_pay_type_changes() SET search_path TO 'public';
ALTER FUNCTION public.update_ach_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.update_search_index() SET search_path TO 'public';
ALTER FUNCTION public.trigger_automation_workflows() SET search_path TO 'public';
ALTER FUNCTION public.handle_assessment_completion() SET search_path TO 'public';
ALTER FUNCTION public.update_training_module_client_access_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_article_view_count() SET search_path TO 'public';
ALTER FUNCTION public.handle_deal_closure() SET search_path TO 'public';
ALTER FUNCTION public.validate_crm_role_assignment() SET search_path TO 'public';