-- Fix remaining function search_path issues only
-- Cannot modify auth schema tables as they are Supabase managed

-- Fix the remaining functions without secure search_path
ALTER FUNCTION public.get_pay_group_employee_count(uuid) SET search_path TO 'public';
ALTER FUNCTION public.validate_employee_pay_group_assignment() SET search_path TO 'public';
ALTER FUNCTION public.update_ai_report_jobs_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.process_webhook_queue() SET search_path TO 'public';
ALTER FUNCTION public.generate_staffing_invoice_number() SET search_path TO 'public';
ALTER FUNCTION public.auto_generate_invoice_number() SET search_path TO 'public';
ALTER FUNCTION public.update_proposal_tracking_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.create_default_client_modules() SET search_path TO 'public';
ALTER FUNCTION public.handle_deal_closure() SET search_path TO 'public';
ALTER FUNCTION public.calculate_next_generation_date(text, time without time zone, integer, integer) SET search_path TO 'public';
ALTER FUNCTION public.update_next_generation_date() SET search_path TO 'public';
ALTER FUNCTION public.get_distinct_roles() SET search_path TO 'public';
ALTER FUNCTION public.generate_share_token() SET search_path TO 'public';
ALTER FUNCTION public.use_share_token(text, inet) SET search_path TO 'public';
ALTER FUNCTION public.check_paying_client_downgrade() SET search_path TO 'public';
ALTER FUNCTION public.auto_generate_halobroker_statement_number() SET search_path TO 'public';
ALTER FUNCTION public.get_pay_group_employee_count_v2(uuid) SET search_path TO 'public';
ALTER FUNCTION public.generate_onboarding_code() SET search_path TO 'public';
ALTER FUNCTION public.has_halodata_permission(uuid, text, uuid) SET search_path TO 'public';
ALTER FUNCTION public.handle_risk_assessment_completed() SET search_path TO 'public';
ALTER FUNCTION public.log_audit_event(uuid, text, text, uuid, uuid, jsonb, jsonb, text, text, text, text, text) SET search_path TO 'public';
ALTER FUNCTION public.cleanup_expired_sessions() SET search_path TO 'public';
ALTER FUNCTION public.generate_pay_stub_number(uuid, date) SET search_path TO 'public';
ALTER FUNCTION public.update_halodata_updated_at() SET search_path TO 'public';
ALTER FUNCTION public.validate_single_active_pay_group() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_learning() SET search_path TO 'public';
ALTER FUNCTION public.update_updated_at_video_tables() SET search_path TO 'public';
ALTER FUNCTION public.has_active_paying_clients(uuid) SET search_path TO 'public';
ALTER FUNCTION public.ensure_single_primary_contact() SET search_path TO 'public';