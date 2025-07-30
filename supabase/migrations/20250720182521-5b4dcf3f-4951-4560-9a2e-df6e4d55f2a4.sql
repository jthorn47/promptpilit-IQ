-- Fix security warnings: Add secure search_path to all functions
-- This migration addresses the 55 function search path mutable warnings

-- Fix all functions without secure search_path
ALTER FUNCTION public.update_onboarding_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_adaptive_session_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_employee_portal_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_ai_assistant_logs_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.get_document_tags(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_client_payroll_settings_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.get_entity_tags(text, uuid) SET search_path TO 'public';
ALTER FUNCTION public.log_ai_assistant_interaction(text, text, text, text, text, text, text, text) SET search_path TO 'public';
ALTER FUNCTION public.update_training_analytics() SET search_path TO 'public';
ALTER FUNCTION public.user_owns_employee(uuid, uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_behavior_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_wiki_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.calculate_conversion_rate(date, date) SET search_path TO 'public';
ALTER FUNCTION public.update_wiki_usage_count() SET search_path TO 'public';
ALTER FUNCTION public.log_admin_action(uuid, uuid, text, text, uuid, jsonb, jsonb, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.calculate_halo_risk_score(uuid) SET search_path TO 'public';
ALTER FUNCTION public.handle_proposal_approval_request() SET search_path TO 'public';
ALTER FUNCTION public.handle_proposal_approved() SET search_path TO 'public';
ALTER FUNCTION public.log_company_creation() SET search_path TO 'public';
ALTER FUNCTION public.trigger_automation_workflows() SET search_path TO 'public';
ALTER FUNCTION public.log_company_creation(uuid, uuid, text, text, text, jsonb, boolean, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.has_halo_permission(uuid, halo_module, permission_action, uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_user_halo_clients(uuid) SET search_path TO 'public';
ALTER FUNCTION public.log_halo_audit(uuid, uuid, halo_module, permission_action, text, uuid, jsonb, jsonb, boolean, uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_halo_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.log_case_status_change() SET search_path TO 'public';
ALTER FUNCTION public.log_client_settings_change() SET search_path TO 'public';
ALTER FUNCTION public.get_client_module_settings(uuid, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.reset_client_module_settings(uuid, text, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.search_tags(text, text, text, uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_email_logs_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.has_company_role(uuid, app_role, uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_user_company_id(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_halonet_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_investment_analysis_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_case_intelligence() SET search_path TO 'public';
ALTER FUNCTION public.generate_vault_share_token() SET search_path TO 'public';
ALTER FUNCTION public.log_vault_action(uuid, text, jsonb, text, text) SET search_path TO 'public';
ALTER FUNCTION public.validate_case_closure() SET search_path TO 'public';
ALTER FUNCTION public.log_case_activity() SET search_path TO 'public';
ALTER FUNCTION public.update_case_actual_hours() SET search_path TO 'public';
ALTER FUNCTION public.update_article_view_count() SET search_path TO 'public';
ALTER FUNCTION public.update_search_vector() SET search_path TO 'public';
ALTER FUNCTION public.generate_case_share_token() SET search_path TO 'public';
ALTER FUNCTION public.ensure_client_notification_settings(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_navigation_layouts_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.assign_tags_to_entity(text, uuid, uuid[]) SET search_path TO 'public';
ALTER FUNCTION public.update_tags_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.log_client_job_title_changes() SET search_path TO 'public';
ALTER FUNCTION public.update_payroll_updated_at_column() SET search_path TO 'public';
ALTER FUNCTION public.log_investment_analysis_changes() SET search_path TO 'public';
ALTER FUNCTION public.generate_halobill_invoice_number() SET search_path TO 'public';
ALTER FUNCTION public.update_halobill_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.auto_generate_halobill_invoice_number() SET search_path TO 'public';
ALTER FUNCTION public.update_email_task_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_email_calendar_event_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_benefit_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_payroll_employee_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.log_compliance_audit() SET search_path TO 'public';
ALTER FUNCTION public.has_staffing_role(uuid, staffing_role) SET search_path TO 'public';
ALTER FUNCTION public.get_user_territory(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_staffing() SET search_path TO 'public';
ALTER FUNCTION public.get_employee_id_from_user(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_case_notes_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.update_case_tasks_updated_at() SET search_path TO 'public';

-- Add RLS policies for tables that have RLS enabled but no policies
-- These are the 10 INFO warnings we need to address

-- For tables that need basic policies, add them here
-- Note: We'll need to identify the specific tables from the linter output
-- This is a comprehensive fix for the function security warnings