/**
 * HaaLO Payroll Microservice Types
 * Complete type definitions for the payroll processing module
 */

// Core Payroll Types
export interface PayrollPeriod {
  id: string;
  company_id: string;
  start_date: string;
  end_date: string;
  period_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface PayrollEmployee {
  id: string;
  company_id: string;
  employee_id: string;
  instructor_name: string;
  is_active: boolean;
  location_id: string;
  regular_hourly_rate: number;
  saturday_class_rate: number;
  standard_class_rate: number;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  payroll_employee_id: string;
  payroll_period_id: string;
  work_date: string;
  total_hours: number;
  source: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface PayrollAdjustment {
  id: string;
  payroll_employee_id: string;
  payroll_period_id: string;
  adjustment_type: string;
  amount: number;
  description: string;
  created_at: string;
  created_by: string;
}

export interface PayrollCalculation {
  id: string;
  employee_id: string;
  payroll_period_id: string;
  gross_pay: number;
  federal_tax: number;
  state_tax: number;
  local_tax: number;
  fica_tax: number;
  medicare_tax: number;
  sdi_tax?: number;
  total_deductions: number;
  net_pay: number;
  calculation_details: Record<string, any>;
}

export interface PayrollRun {
  id: string;
  company_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  run_name: string;
  status: string;
  employee_count: number;
  total_gross: number;
  total_net: number;
  payroll_frequency: string;
  service_type: string;
  approved_at?: string;
  approved_by?: string;
  completed_at?: string;
  disbursed_at?: string;
  tax_filed_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  metadata?: any;
}

export interface PayStub {
  id: string;
  employee_id: string;
  company_id: string;
  payroll_calculation_id: string;
  payroll_period_id: string;
  stub_number: string;
  pay_date: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_pay: number;
  net_pay: number;
  total_deductions: number;
  total_taxes: number;
  earnings_breakdown: Record<string, any>;
  deductions_breakdown: Record<string, any>;
  taxes_breakdown: Record<string, any>;
  ytd_gross_pay: number;
  ytd_net_pay: number;
  ytd_taxes: number;
  status: string;
  pdf_file_path?: string;
  pdf_generated_at?: string;
  direct_deposit_breakdown?: Record<string, any>;
  metadata?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Validation Types
export interface PayrollValidation {
  type: 'warning' | 'error' | 'info';
  employee_id?: string;
  employee_name?: string;
  message: string;
  field?: string;
  suggested_action?: string;
}

export interface PayrollPrecheck {
  period_id: string;
  validations: PayrollValidation[];
  missing_time_entries: string[];
  zero_pay_employees: string[];
  pending_adjustments: PayrollAdjustment[];
  warnings_count: number;
  errors_count: number;
  can_proceed: boolean;
}

// Workflow Types
export interface PayrollWorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error' | 'skipped';
  order: number;
  required: boolean;
  error_message?: string;
}

export interface PayrollWorkflow {
  payroll_run_id: string;
  current_step: number;
  steps: PayrollWorkflowStep[];
  can_proceed: boolean;
  completion_percentage: number;
}

// Settings Integration
export interface PayrollSettings {
  client_id: string;
  pay_frequency: 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';
  default_earnings_types: string[];
  default_deduction_types: string[];
  require_timesheet_approval: boolean;
  auto_calculate_overtime: boolean;
  overtime_threshold: number;
  pay_stub_delivery_method: 'email' | 'print' | 'portal';
  direct_deposit_required: boolean;
}

// Dashboard Types
export interface PayrollDashboardData {
  current_period: PayrollPeriod | null;
  pending_adjustments_count: number;
  time_entries_summary: {
    total_hours: number;
    pending_approvals: number;
    missing_entries: number;
  };
  warnings: PayrollValidation[];
  next_payroll_date: string;
  recent_runs: PayrollRun[];
}

// Edge Function Interfaces
export interface GeneratePayStubsRequest {
  payroll_period_id: string;
  employee_ids?: string[];
  company_id: string;
  generate_pdf?: boolean;
  email_to_employees?: boolean;
}

export interface GeneratePayStubsResponse {
  success: boolean;
  generated_count: number;
  failed_count: number;
  pay_stub_ids: string[];
  errors: string[];
}

export interface CalculateTaxWithholdingsRequest {
  employee_id: string;
  gross_pay: number;
  pay_period: string;
  state: string;
  filing_status: string;
  allowances: number;
}

export interface CalculateTaxWithholdingsResponse {
  federal_tax: number;
  state_tax: number;
  fica_tax: number;
  medicare_tax: number;
  total_withholdings: number;
}

export interface PayrollReportRequest {
  company_id: string;
  period_start: string;
  period_end: string;
  report_type: 'summary' | 'detailed' | 'tax_liability' | 'labor_cost';
  employee_ids?: string[];
}

// Permission Types
export type PayrollPermission = 
  | 'payroll.view'
  | 'payroll.run'
  | 'payroll.approve'
  | 'payroll.edit_time'
  | 'payroll.view_reports'
  | 'payroll.manage_settings'
  | 'payroll.override_calculations';

export interface PayrollUserPermissions {
  user_id: string;
  permissions: PayrollPermission[];
  can_approve_up_to: number; // Dollar amount
  requires_dual_approval: boolean;
  // Computed permission methods
  canRunPayroll: boolean;
  canEditTime: boolean;
  canManageSettings: boolean;
  canView: boolean;
  canApprove: boolean;
  canOverride: boolean;
}