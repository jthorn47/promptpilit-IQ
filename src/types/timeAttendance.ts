// Time & Attendance Types for Swipeclock Integration
export interface TimeEntry {
  id: string;
  employee_id: string;
  company_id: string;
  entry_date: string;
  punch_in_time: string | null;
  punch_out_time: string | null;
  break_start_time: string | null;
  break_end_time: string | null;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  notes?: string;
  location_id?: string;
  job_code?: string;
  is_holiday: boolean;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

export interface PTORequest {
  id: string;
  employee_id: string;
  company_id: string;
  request_type: 'vacation' | 'sick' | 'personal' | 'holiday' | 'bereavement';
  start_date: string;
  end_date: string;
  hours_requested: number;
  status: 'pending' | 'approved' | 'denied' | 'cancelled';
  reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PTOBalance {
  id: string;
  employee_id: string;
  company_id: string;
  pto_type: string;
  available_hours: number;
  used_hours: number;
  accrued_hours: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface TimecardPeriod {
  id: string;
  company_id: string;
  period_start: string;
  period_end: string;
  period_name: string;
  status: 'open' | 'processing' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  job_title?: string;
  manager_id?: string;
  location_id?: string;
  status: 'active' | 'inactive';
}

export interface TimeClockState {
  is_clocked_in: boolean;
  current_punch_in?: string;
  is_on_break: boolean;
  break_start_time?: string;
  last_activity: string;
}

export interface WeeklyTimecard {
  employee_id: string;
  week_start: string;
  week_end: string;
  total_regular_hours: number;
  total_overtime_hours: number;
  total_hours: number;
  entries: TimeEntry[];
  pto_hours: number;
  status: 'pending' | 'approved' | 'rejected';
  exceptions: string[];
}

export interface ComplianceAlert {
  id: string;
  employee_id: string;
  alert_type: 'missed_break' | 'overtime_violation' | 'missing_punch' | 'early_departure';
  date: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
}