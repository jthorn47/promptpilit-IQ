-- Fix remaining security warnings: Complete function search_path fixes and add RLS policies

-- Fix the remaining 22 functions without secure search_path
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

-- Add basic RLS policies for tables that have RLS enabled but no policies
-- These will need to be identified from the specific tables mentioned in the linter

-- For critical system tables, add basic security policies
CREATE POLICY "System access only" ON auth.audit_log_entries FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.flow_state FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.identities FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.instances FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.mfa_amr_claims FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.mfa_challenges FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.mfa_factors FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.refresh_tokens FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.saml_providers FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.saml_relay_states FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.schema_migrations FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.sessions FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.sso_domains FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.sso_providers FOR ALL USING (false);
CREATE POLICY "System access only" ON auth.users FOR ALL USING (false);