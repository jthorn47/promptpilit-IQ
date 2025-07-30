-- Remove old Time & Attendance database tables
-- These are being replaced with Swipeclock API integration

-- Drop tables in correct order to handle foreign key dependencies
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.time_entries CASCADE;
DROP TABLE IF EXISTS public.timecard_periods CASCADE;

-- Note: Keeping payroll_time_entries as it's used by payroll module
-- Note: Keeping peo_time_attendance_config as it's used by PEO onboarding
-- Note: Keeping one_time_payments as it's used by payroll module