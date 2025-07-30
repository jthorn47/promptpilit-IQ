/**
 * Supervisor Dashboard Types
 */

export interface EmployeePunchStatus {
  employee_id: string;
  employee_name: string;
  employee_photo?: string;
  status: 'clocked_in' | 'scheduled_not_in' | 'not_scheduled' | 'clocked_out';
  clock_in_time?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  location_name?: string;
  job_code?: string;
  device_name?: string;
  last_punch_device?: string;
  variance_minutes?: number;
  compliance_flags?: string[];
}

export interface TimecardApproval {
  id: string;
  timecard_id: string;
  employee_id: string;
  approved_by: string;
  approved_at: string;
  approval_level: 'supervisor' | 'manager' | 'admin';
  approval_scope: 'daily' | 'weekly' | 'pay_period';
  period_start: string;
  period_end: string;
  notes?: string;
  previous_approval_id?: string;
}

export interface TimecardEdit {
  id: string;
  timecard_id: string;
  employee_id: string;
  edited_by: string;
  edited_at: string;
  edit_type: 'punch_time' | 'hours' | 'job_code' | 'compliance_override' | 'missing_punch';
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  reason: string;
  requires_reapproval: boolean;
}

export interface SupervisorPermissions {
  user_id: string;
  can_view_all_employees: boolean;
  can_edit_timecards: boolean;
  can_approve_timecards: boolean;
  can_override_compliance: boolean;
  supervised_employees: string[];
  supervised_locations: string[];
  supervised_departments: string[];
  approval_limit_hours?: number;
}

export interface TimecardSummary {
  employee_id: string;
  employee_name: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  compliance_status: 'compliant' | 'warning' | 'violation';
  approval_status: 'pending' | 'approved' | 'rejected';
  last_edited_at?: string;
  last_approved_at?: string;
  flags: string[];
}

export interface DashboardFilters {
  location_ids?: string[];
  department_ids?: string[];
  job_codes?: string[];
  status_filter?: 'all' | 'clocked_in' | 'compliance_issues' | 'unapproved';
  date_range?: {
    start: string;
    end: string;
  };
}