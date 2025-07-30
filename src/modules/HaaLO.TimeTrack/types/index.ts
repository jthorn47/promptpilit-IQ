// TimeTrack Module Types

export interface TimeEntry {
  id: string;
  employee_id: string;
  company_id: string;
  date: string;
  project_id?: string;
  time_code_id?: string;
  hours: number;
  hours_worked: number;
  start_time?: string;
  end_time?: string;
  break_minutes?: number;
  notes?: string;
  tags: string[];
  is_billable: boolean;
  hourly_rate?: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  location?: string;
  is_remote: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeProject {
  id: string;
  company_id: string;
  name: string;
  client_name?: string;
  project_code?: string;
  description?: string;
  is_billable: boolean;
  is_active: boolean;
  default_hourly_rate?: number;
  budget_hours?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TimeCode {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description?: string;
  category: 'work' | 'pto' | 'training' | 'admin' | 'other';
  is_paid: boolean;
  is_billable: boolean;
  is_active: boolean;
  requires_approval: boolean;
  color_code?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TimeSettings {
  id: string;
  company_id: string;
  overtime_threshold_daily?: number;
  overtime_threshold_weekly?: number;
  auto_break_minutes?: number;
  require_notes_for_overtime: boolean;
  require_project_for_billable: boolean;
  allow_mobile_entry: boolean;
  require_manager_approval: boolean;
  require_time_approval: boolean;
  allow_future_entries: boolean;
  auto_submit_timesheet: boolean;
  enforce_break_rules: boolean;
  max_hours_per_day: number;
  minimum_break_minutes: number;
  time_entry_method: 'clock' | 'manual' | 'both';
  reminder_enabled: boolean;
  reminder_time?: string;
  reminder_days: string[];
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface TimeApproval {
  id: string;
  company_id: string;
  employee_id: string;
  approver_id: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  notes?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// Weekly timesheet structure for batch entry
export interface TimeTrackFilters {
  dateRange?: { start: string; end: string };
  projectId?: string;
  employeeId?: string;
  status?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTimeEntryRequest extends Omit<TimeEntry, 'id' | 'created_at' | 'updated_at'> {}

export interface UpdateTimeEntryRequest extends Partial<TimeEntry> {
  id: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'overtime' | 'break' | 'hours';
  message: string;
  employeeId: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TimeSummary {
  totalHours: number;
  billableHours: number;
  overtimeHours: number;
  regularHours: number;
}

export interface WeeklyTimesheet {
  employeeId: string;
  weekStart: string;
  entries: {
    [date: string]: {
      [projectId: string]: {
        hours: number;
        timeCodeId?: string;
        notes?: string;
        tags: string[];
        isRemote: boolean;
      };
    };
  };
  totalHours: number;
  status: 'draft' | 'submitted' | 'approved';
}

export interface TimesheetRow {
  id: string;
  projectId?: string;
  timeCodeId?: string;
  tags: string[];
  notes?: string;
  dailyHours: { [date: string]: number };
  totalHours: number;
}

export interface WeeklyTimesheetData {
  weekStart: string;
  rows: TimesheetRow[];
  totalHours: number;
  status: 'draft' | 'submitted' | 'approved';
  complianceIssues: ComplianceIssue[];
}

export interface ComplianceIssue {
  type: 'missing_time' | 'excessive_hours' | 'required_field';
  message: string;
  severity: 'warning' | 'error';
  rowId?: string;
  date?: string;
}

// Team Management Types
export interface TeamTimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  department?: string;
  weekStart: string;
  totalHours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  dailyHours: { [date: string]: number };
  entries: TimeEntry[];
  complianceIssues: ComplianceIssue[];
}

export interface TeamTimeFilters {
  department?: string;
  status?: 'submitted' | 'not_submitted' | 'approved' | 'rejected' | 'all';
  projectId?: string;
  searchTerm?: string;
}

export interface BulkTimeAction {
  action: 'approve' | 'reject';
  employeeIds: string[];
  weekStart: string;
  reason?: string;
}

// Time Summary Types
export interface TimeSummaryData {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  ptoHours: number;
  sickHours: number;
  holidayHours: number;
  timeCodeBreakdown: TimeCodeSummary[];
  dailyBreakdown: DailySummary[];
  complianceFlags: ComplianceFlag[];
  weeklyTarget: number;
}

export interface TimeCodeSummary {
  timeCodeId: string;
  timeCodeName: string;
  hours: number;
  percentage: number;
  color?: string;
}

export interface DailySummary {
  date: string;
  dayName: string;
  hours: number;
  target: number;
  isCompliant: boolean;
}

export interface ComplianceFlag {
  type: 'missing_time' | 'overtime' | 'over_limit' | 'under_limit';
  severity: 'warning' | 'error';
  message: string;
  value?: number;
  threshold?: number;
  dates?: string[];
}

// Report Types
export type ReportType = 
  | 'time_by_employee' 
  | 'time_by_project' 
  | 'time_by_client' 
  | 'overtime_report' 
  | 'missed_entries';

export interface ReportConfig {
  type: ReportType;
  name: string;
  description: string;
  fields: ReportField[];
}

export interface ReportField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'hours';
  sortable?: boolean;
  exportable?: boolean;
}

export interface ReportFilters {
  reportType: ReportType;
  dateRange: {
    from: Date;
    to: Date;
  };
  employeeIds?: string[];
  projectIds?: string[];
  clientIds?: string[];
  departmentIds?: string[];
  timeCodeIds?: string[];
}

export interface ReportData {
  id: string;
  type: ReportType;
  title: string;
  filters: ReportFilters;
  columns: ReportColumn[];
  rows: ReportRow[];
  summary?: ReportSummary;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  generatedAt: string;
}

export interface ReportColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'hours';
  sortable: boolean;
  width?: string;
}

export interface ReportRow {
  id: string;
  [key: string]: any;
}

export interface ReportSummary {
  totalHours: number;
  totalCost: number;
  averageHours: number;
  recordCount: number;
  [key: string]: any;
}

export interface ReportExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  includeCharts?: boolean;
  includeSummary?: boolean;
}
export interface TimeReportMetric {
  metric: string;
  value: string | number;
  details: string;
}

export interface ProjectTimeReport {
  projectId: string;
  projectName: string;
  hours: number;
  billableHours: number;
  revenue: number;
}

export interface TimeCodeReport {
  code: string;
  name: string;
  hours: number;
  percentage: number;
}

// Dashboard summary types
export interface TimeDashboardSummary {
  totalHours: number;
  billableHours: number;
  overtime: number;
  pendingApprovals: number;
  complianceAlerts: number;
}

// API request/response types
export interface TimeEntryCreateRequest {
  employee_id: string;
  company_id: string;
  date: string;
  project_id?: string;
  time_code_id?: string;
  hours: number;
  notes?: string;
  tags?: string[];
  is_billable: boolean;
  hourly_rate?: number;
  location?: string;
  is_remote: boolean;
}

export interface TimeEntryUpdateRequest extends Partial<TimeEntryCreateRequest> {
  id: string;
}

export interface TimeProjectCreateRequest {
  company_id: string;
  name: string;
  client_name?: string;
  project_code?: string;
  description?: string;
  is_billable: boolean;
  is_active: boolean;
  default_hourly_rate?: number;
  budget_hours?: number;
  created_by: string;
}

export interface TimeCodeCreateRequest {
  company_id: string;
  code: string;
  name: string;
  description?: string;
  category: 'work' | 'pto' | 'training' | 'admin' | 'other';
  is_paid: boolean;
  is_billable: boolean;
  is_active: boolean;
  requires_approval: boolean;
  color_code?: string;
  sort_order: number;
}

// Query options for API calls
export interface TimeEntryQueryOptions {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  projectId?: string;
  status?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

// Sync Types for PayrollIQ and ProjectIQ integration
export type SyncStatus = 'pending' | 'synced' | 'error' | 'retry';

export interface TimeSyncLog {
  id: string;
  time_entry_id: string;
  sync_destination: 'payroll' | 'jobcost' | 'both';
  sync_status: SyncStatus;
  sync_attempts: number;
  last_sync_attempt?: string;
  last_sync_success?: string;
  error_message?: string;
  payroll_entry_id?: string;
  jobcost_entry_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollEarningsEntry {
  employee_id: string;
  date: string;
  hours: number;
  time_code: string;
  hourly_rate?: number;
  tags?: string[];
}

export interface JobCostEntry {
  employee_id: string;
  project_id: string;
  client_name?: string;
  date: string;
  hours: number;
  time_code: string;
  billable: boolean;
  hourly_rate?: number;
  tags?: string[];
}

export interface SyncRequest {
  time_entry_ids: string[];
  destinations: ('payroll' | 'jobcost')[];
  force_resync?: boolean;
}

// Pulse Alert Types
export type PulseAlertType = 'overtime' | 'missed_break' | 'undertime' | 'unapproved_pto';

export interface PulseAlert {
  id: string;
  employee_id: string;
  type: PulseAlertType;
  date: string;
  severity: 'low' | 'medium' | 'high';
  linked_entry_id: string;
  message: string;
  sent_to_pulse: boolean;
  pulse_alert_id?: string;
  created_at: string;
}

// Time Score Types
export interface TimeScore {
  id: string;
  company_id: string;
  employee_id: string;
  week_start: string;
  week_end: string;
  total_score: number;
  breakdown_json: ScoreBreakdown;
  calculation_factors: ScoreFactors;
  submitted_on_time: boolean;
  no_missing_days: boolean;
  entries_match_schedule: boolean;
  notes_included: boolean;
  approved_without_changes: boolean;
  overtime_violations: number;
  missed_days: number;
  manager_flags: number;
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface ScoreBreakdown {
  base_points: number;
  submitted_on_time: number;
  no_missing_days: number;
  entries_match_schedule: number;
  notes_included: number;
  approved_without_changes: number;
  overtime_penalty: number;
  missed_day_penalty: number;
  manager_flag_penalty: number;
  total: number;
}

export interface ScoreFactors {
  submission_deadline: string;
  expected_work_days: number;
  actual_work_days: number;
  schedule_variance_threshold: number;
  notes_required_count: number;
  notes_provided_count: number;
  approval_changes_made: boolean;
}

export type ScoreLevel = 'excellent' | 'good' | 'needs_improvement';

export interface ScoreDisplayConfig {
  score: number;
  level: ScoreLevel;
  color: string;
  bgColor: string;
  icon: string;
  message: string;
}

export interface PulseAlertRequest {
  employee_id: string;
  type: PulseAlertType;
  date: string;
  severity: 'low' | 'medium' | 'high';
  linked_entry_id: string;
  message: string;
}

export interface SyncResult {
  success: boolean;
  synced_count: number;
  failed_count: number;
  errors: string[];
  sync_logs: TimeSyncLog[];
}

// Time Policy Types for state/company overtime rules
export interface TimePolicy {
  id: string;
  company_id: string;
  policy_name: string;
  state: string;
  daily_overtime_threshold: number;
  daily_doubletime_threshold: number;
  weekly_overtime_threshold: number;
  seven_day_rule: boolean;
  workweek_start_day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  custom_rules: CustomTimeRule[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CustomTimeRule {
  id: string;
  rule_type: 'overtime' | 'doubletime' | 'premium' | 'holiday' | 'break';
  condition: string;
  threshold: number;
  multiplier: number;
  description: string;
  is_active: boolean;
}

export interface TimePolicyAuditTrail {
  id: string;
  policy_id: string;
  action_type: 'created' | 'updated' | 'activated' | 'deactivated' | 'deleted';
  old_values?: any;
  new_values?: any;
  changed_fields?: string[];
  performed_by?: string;
  created_at: string;
}

export interface TimeComplianceViolation {
  id: string;
  company_id: string;
  employee_id: string;
  policy_id: string;
  violation_type: 'daily_overtime' | 'daily_doubletime' | 'weekly_overtime' | 'seven_day_violation' | 'custom_rule';
  violation_date: string;
  hours_worked: number;
  threshold_exceeded: number;
  overtime_hours?: number;
  doubletime_hours?: number;
  violation_details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface TimePolicyCreateRequest {
  company_id: string;
  policy_name: string;
  state: string;
  daily_overtime_threshold: number;
  daily_doubletime_threshold: number;
  weekly_overtime_threshold: number;
  seven_day_rule: boolean;
  workweek_start_day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  custom_rules?: CustomTimeRule[];
}

export interface TimePolicyUpdateRequest extends Partial<TimePolicyCreateRequest> {
  id: string;
}

// Overtime calculation utilities
export interface OvertimeCalculationResult {
  regularHours: number;
  overtimeHours: number;
  doubletimeHours: number;
  totalHours: number;
  violations: TimeComplianceViolation[];
  appliedRules: string[];
}