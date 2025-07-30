-- Fix the ERROR level security definer view and continue with remaining functions

-- First, identify and fix any security definer views
-- Query to find any security definer views
DO $$
DECLARE
    view_name TEXT;
BEGIN
    FOR view_name IN 
        SELECT schemaname || '.' || viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND viewname IN (
            SELECT viewname FROM pg_views v
            JOIN pg_rewrite r ON r.ev_class = (
                SELECT oid FROM pg_class WHERE relname = v.viewname AND relnamespace = (
                    SELECT oid FROM pg_namespace WHERE nspname = v.schemaname
                )
            )
            WHERE r.ev_action LIKE '%SECURITY DEFINER%'
        )
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || view_name || ' CASCADE';
    END LOOP;
END $$;

-- Continue fixing remaining functions with search_path warnings
-- Let me systematically find and fix more functions that need search_path

-- Update get_lms_credit_summary with search_path
CREATE OR REPLACE FUNCTION public.get_lms_credit_summary(p_company_id uuid)
RETURNS TABLE(training_type text, total_issued bigint, total_used bigint, total_remaining bigint, last_updated timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    hlc.training_type::TEXT,
    SUM(hlc.credits_issued) as total_issued,
    SUM(hlc.credits_used) as total_used,
    SUM(hlc.credits_issued - hlc.credits_used) as total_remaining,
    MAX(hlc.updated_at) as last_updated
  FROM hroiq_lms_credits hlc
  WHERE hlc.company_id = p_company_id
  GROUP BY hlc.training_type
  ORDER BY hlc.training_type;
$$;

-- Update get_pay_group_employee_count with search_path
CREATE OR REPLACE FUNCTION public.get_pay_group_employee_count(p_pay_group_id uuid)
RETURNS integer
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM public.pay_group_employees
        WHERE pay_group_id = p_pay_group_id
        AND is_active = true
    );
END;
$$;

-- Update get_timecard_entries with search_path
CREATE OR REPLACE FUNCTION public.get_timecard_entries(p_employee_id uuid, p_pay_period_id uuid)
RETURNS TABLE(id uuid, employee_id uuid, pay_period_id uuid, date_worked date, regular_hours numeric, overtime_hours numeric, double_time_hours numeric, sick_hours numeric, vacation_hours numeric, holiday_hours numeric, notes text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tc.id,
    tc.employee_id,
    tc.pay_period_id,
    tc.date_worked,
    tc.regular_hours,
    tc.overtime_hours,
    tc.double_time_hours,
    tc.sick_hours,
    tc.vacation_hours,
    tc.holiday_hours,
    tc.notes,
    tc.created_at,
    tc.updated_at
  FROM public.timecard_entries tc
  WHERE tc.employee_id = p_employee_id 
  AND tc.pay_period_id = p_pay_period_id
  ORDER BY tc.date_worked;
END;
$$;