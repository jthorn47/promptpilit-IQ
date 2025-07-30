/**
 * Scheduling System Types
 */

export interface Shift {
  id: string;
  employee_id: string;
  company_id: string;
  location_id?: string;
  job_code?: string;
  start_time: string;
  end_time: string;
  scheduled_break_minutes: number;
  recurrence_rule?: RecurrenceRule;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface RecurrenceRule {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  frequency: number; // Every X days/weeks/months
  days_of_week?: number[]; // 0-6 (Sunday-Saturday)
  end_date?: string;
  exceptions?: string[]; // Dates to skip
}

export interface ShiftTemplate {
  id: string;
  company_id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  job_code?: string;
  is_active: boolean;
}

export interface ShiftEnforcementRules {
  company_id: string;
  allow_early_clockin_minutes: number;
  allow_late_clockin_minutes: number;
  block_unscheduled_punches: boolean;
  auto_clockout_enabled: boolean;
  auto_clockout_delay_minutes: number;
  require_schedule_to_punch: boolean;
  flag_late_arrivals: boolean;
  flag_early_departures: boolean;
}

export interface AttendanceVariance {
  employee_id: string;
  shift_id: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  variance_type: 'late_arrival' | 'early_departure' | 'no_show' | 'unscheduled' | 'early_clockin';
  variance_minutes: number;
  date: string;
}

export interface ScheduleWeekView {
  employee_id: string;
  employee_name: string;
  shifts: {
    [date: string]: Shift[];
  };
  total_scheduled_hours: number;
}

export interface AttendanceReport {
  date: string;
  variances: AttendanceVariance[];
  summary: {
    total_scheduled: number;
    total_present: number;
    total_late: number;
    total_no_shows: number;
    total_unscheduled: number;
  };
}