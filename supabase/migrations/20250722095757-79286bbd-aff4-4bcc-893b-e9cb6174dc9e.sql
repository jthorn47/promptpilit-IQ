-- Remove all legacy case management tables
-- These are no longer needed with the new Pulse Case Management System

-- Drop tables in order to handle any potential dependencies
DROP TABLE IF EXISTS public.case_sla_tracking CASCADE;
DROP TABLE IF EXISTS public.case_performance_metrics CASCADE;
DROP TABLE IF EXISTS public.client_case_trends CASCADE;
DROP TABLE IF EXISTS public.case_alerts CASCADE;
DROP TABLE IF EXISTS public.case_client_updates CASCADE;
DROP TABLE IF EXISTS public.case_client_feedback CASCADE;
DROP TABLE IF EXISTS public.case_client_visibility CASCADE;
DROP TABLE IF EXISTS public.email_case_links CASCADE;
DROP TABLE IF EXISTS public.case_notes CASCADE;
DROP TABLE IF EXISTS public.case_tasks CASCADE;
DROP TABLE IF EXISTS public.case_attachments CASCADE;
DROP TABLE IF EXISTS public.case_activity_logs CASCADE;
DROP TABLE IF EXISTS public.case_email_threads CASCADE;
DROP TABLE IF EXISTS public.case_activities CASCADE;
DROP TABLE IF EXISTS public.case_files CASCADE;
DROP TABLE IF EXISTS public.case_auto_tags CASCADE;
DROP TABLE IF EXISTS public.case_automation_rules CASCADE;
DROP TABLE IF EXISTS public.case_sla_configs CASCADE;
DROP TABLE IF EXISTS public.cases CASCADE;

-- Drop any related types that might have been used by these tables
DROP TYPE IF EXISTS public.case_status CASCADE;
DROP TYPE IF EXISTS public.case_priority CASCADE;
DROP TYPE IF EXISTS public.case_type CASCADE;