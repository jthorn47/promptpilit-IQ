-- Harden SQL functions by setting explicit search_path
-- This prevents implicit access to unintended schemas and potential injection attacks

-- Update get_brand_email_domain function to use explicit search_path
ALTER FUNCTION public.get_brand_email_domain(text, text)
SET search_path = public;

-- Update all other custom functions to use explicit search_path for security
ALTER FUNCTION public.update_risk_level()
SET search_path = public;

ALTER FUNCTION public.update_cases_updated_at()
SET search_path = public;

ALTER FUNCTION public.update_proposal_expiry()
SET search_path = public;

ALTER FUNCTION public.user_has_permission(uuid, text)
SET search_path = public;

ALTER FUNCTION public.update_ai_report_jobs_updated_at()
SET search_path = public;

ALTER FUNCTION public.log_vault_action(uuid, text, jsonb)
SET search_path = public;

ALTER FUNCTION public.update_article_view_count()
SET search_path = public;

ALTER FUNCTION public.update_case_documents_updated_at()
SET search_path = public;

ALTER FUNCTION public.update_time_policy_updated_at()
SET search_path = public;

ALTER FUNCTION public.generate_case_share_token()
SET search_path = public;

ALTER FUNCTION public.log_time_policy_changes()
SET search_path = public;

ALTER FUNCTION public.update_navigation_layouts_updated_at()
SET search_path = public;

ALTER FUNCTION public.update_opportunity_stage_timestamp()
SET search_path = public;

ALTER FUNCTION public.update_client_time_settings_updated_at()
SET search_path = public;

ALTER FUNCTION public.create_default_client_time_settings()
SET search_path = public;

ALTER FUNCTION public.update_org_updated_at_column()
SET search_path = public;

ALTER FUNCTION public.log_org_structure_changes()
SET search_path = public;

ALTER FUNCTION public.update_timecard_entry(uuid, jsonb)
SET search_path = public;

ALTER FUNCTION public.has_crm_access(uuid, uuid)
SET search_path = public;

ALTER FUNCTION public.generate_journal_number(uuid)
SET search_path = public;

ALTER FUNCTION public.validate_journal_balance()
SET search_path = public;

ALTER FUNCTION public.update_batch_totals()
SET search_path = public;

ALTER FUNCTION public.validate_employee_pay_group_assignment()
SET search_path = public;

ALTER FUNCTION public.update_consultant_capacity()
SET search_path = public;

ALTER FUNCTION public.update_halo_updated_at()
SET search_path = public;

ALTER FUNCTION public.generate_employee_qr_code()
SET search_path = public;

ALTER FUNCTION public.ensure_client_notification_settings(uuid)
SET search_path = public;

ALTER FUNCTION public.get_pay_group_employee_count(uuid)
SET search_path = public;

ALTER FUNCTION public.get_timecard_entries(uuid, uuid)
SET search_path = public;

ALTER FUNCTION public.handle_employee_status_change()
SET search_path = public;

ALTER FUNCTION public.update_email_logs_updated_at()
SET search_path = public;

ALTER FUNCTION public.calculate_account_balances_quick(uuid)
SET search_path = public;

ALTER FUNCTION public.create_employee_registration_token(uuid, integer)
SET search_path = public;

ALTER FUNCTION public.generate_registration_token()
SET search_path = public;

ALTER FUNCTION public.has_company_role(uuid, app_role, uuid)
SET search_path = public;

ALTER FUNCTION public.log_time_tracking_action(uuid, text, uuid, text, jsonb, jsonb, text, text, inet, text, uuid)
SET search_path = public;

ALTER FUNCTION public.auto_log_time_tracking_changes()
SET search_path = public;

ALTER FUNCTION public.update_search_vector()
SET search_path = public;

ALTER FUNCTION public.validate_employee_org_assignment()
SET search_path = public;

ALTER FUNCTION public.calculate_account_balances_smart(uuid)
SET search_path = public;

ALTER FUNCTION public.inherit_brand_identity()
SET search_path = public;

ALTER FUNCTION public.check_state_tax_support()
SET search_path = public;

ALTER FUNCTION public.log_admin_action(uuid, uuid, text, text, uuid, jsonb, jsonb, jsonb)
SET search_path = public;

ALTER FUNCTION public.update_user_brand_identity()
SET search_path = public;

ALTER FUNCTION public.handle_company_to_client_conversion()
SET search_path = public;

ALTER FUNCTION public.get_enum_values(text)
SET search_path = public;

ALTER FUNCTION public.generate_ai_insight(uuid, text, text, text, numeric, text, text, text[], text)
SET search_path = public;

ALTER FUNCTION public.create_policy_version()
SET search_path = public;

ALTER FUNCTION public.generate_wage_compliance_alert(uuid, text, text, text, text, jsonb, uuid[], text, text[])
SET search_path = public;

ALTER FUNCTION public.update_hroiq_policies_updated_at()
SET search_path = public;

ALTER FUNCTION public.validate_brand_identity_deletion()
SET search_path = public;

ALTER FUNCTION public.validate_migration_integrity()
SET search_path = public;

ALTER FUNCTION public.resolve_wage_compliance_alert(uuid, text)
SET search_path = public;

ALTER FUNCTION public.get_vaultpay_ar_aging(uuid)
SET search_path = public;

ALTER FUNCTION public.get_lms_credit_summary(uuid)
SET search_path = public;

ALTER FUNCTION public.cache_metric_data(text, jsonb, integer, uuid)
SET search_path = public;

ALTER FUNCTION public.validate_payroll_readiness(uuid)
SET search_path = public;

ALTER FUNCTION public.validate_payroll_employee_requirements()
SET search_path = public;

ALTER FUNCTION public.auto_generate_vaultpay_invoice()
SET search_path = public;