// Payroll Batch Processor Types

export interface PayrollBatch {
  id: string;
  company_id: string;
  batch_name: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  status: BatchStatus;
  total_employees: number;
  processed_employees: number;
  failed_employees: number;
  total_gross_pay: number;
  total_net_pay: number;
  total_taxes: number;
  payroll_groups: PayrollGroup[];
  processing_metadata: BatchProcessingMetadata;
  error_summary: BatchError[];
  created_by: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface PayrollBatchEmployee {
  id: string;
  batch_id: string;
  employee_id: string;
  company_id: string;
  employee_name: string;
  payroll_group?: string;
  status: EmployeeBatchStatus;
  gross_pay: number;
  net_pay: number;
  total_taxes: number;
  calculation_data: EmployeeCalculationData;
  error_details?: EmployeeError;
  retry_count: number;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollBatchAuditLog {
  id: string;
  batch_id: string;
  action_type: BatchActionType;
  action_details: Record<string, any>;
  performed_by: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  company_id: string;
}

export interface PayrollGroup {
  id: string;
  name: string;
  description?: string;
  employee_count: number;
  total_gross_estimate: number;
}

export interface BatchProcessingMetadata {
  started_at?: string;
  estimated_completion?: string;
  processing_chunks: ProcessingChunk[];
  current_chunk_index: number;
  total_chunks: number;
  processing_speed?: number; // employees per minute
  queue_position?: number;
}

export interface ProcessingChunk {
  chunk_index: number;
  employee_ids: string[];
  status: 'pending' | 'processing' | 'complete' | 'failed';
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface BatchError {
  employee_id: string;
  employee_name: string;
  error_code: string;
  error_message: string;
  error_details: Record<string, any>;
  retry_count: number;
  timestamp: string;
}

export interface EmployeeError {
  error_code: string;
  error_message: string;
  error_details: Record<string, any>;
  stage: 'timesheet' | 'calculation' | 'tax' | 'benefits' | 'deductions' | 'validation';
  is_retryable: boolean;
}

export interface EmployeeCalculationData {
  timesheet_data?: TimesheetData;
  earnings: EarningItem[];
  deductions: DeductionItem[];
  taxes: TaxItem[];
  benefits: BenefitItem[];
  gross_pay_breakdown: GrossPayBreakdown;
  tax_calculations: TaxCalculations;
  net_pay_breakdown: NetPayBreakdown;
}

export interface TimesheetData {
  regular_hours: number;
  overtime_hours: number;
  double_time_hours?: number;
  sick_hours?: number;
  vacation_hours?: number;
  holiday_hours?: number;
  total_hours: number;
}

export interface EarningItem {
  code: string;
  description: string;
  amount: number;
  hours?: number;
  rate?: number;
  type: 'regular' | 'overtime' | 'bonus' | 'commission' | 'other';
}

export interface DeductionItem {
  code: string;
  description: string;
  amount: number;
  is_pre_tax: boolean;
  deduction_type: 'benefits' | 'garnishment' | 'retirement' | 'other';
}

export interface TaxItem {
  code: string;
  description: string;
  amount: number;
  rate?: number;
  tax_type: 'federal' | 'state' | 'local' | 'fica' | 'futa' | 'sui';
}

export interface BenefitItem {
  code: string;
  description: string;
  employee_amount: number;
  employer_amount: number;
  is_pre_tax: boolean;
}

export interface GrossPayBreakdown {
  regular_pay: number;
  overtime_pay: number;
  bonus_pay: number;
  commission_pay: number;
  other_pay: number;
  total_gross: number;
}

export interface TaxCalculations {
  federal_income_tax: number;
  state_income_tax: number;
  local_tax: number;
  social_security_tax: number;
  medicare_tax: number;
  medicare_additional: number;
  state_disability: number;
  federal_unemployment: number;
  state_unemployment: number;
  total_taxes: number;
}

export interface NetPayBreakdown {
  gross_pay: number;
  pre_tax_deductions: number;
  taxable_income: number;
  total_taxes: number;
  post_tax_deductions: number;
  net_pay: number;
}

export interface BatchCreationRequest {
  company_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  payroll_groups: string[]; // Array of payroll group IDs
  include_employees?: string[]; // Optional specific employee IDs
  exclude_employees?: string[]; // Optional employee IDs to exclude
  processing_options?: BatchProcessingOptions;
}

// Additional exports for compatibility
export interface BatchCalculation extends EmployeeCalculationData {}
export interface PayrollPeriod {
  id: string;
  company_id: string;
  period_start: string;
  period_end: string;
  status: string;
  employee_count: number;
  created_at: string;
  updated_at: string;
}
export interface BatchGenerationRequest extends BatchCreationRequest {}

export interface BatchProcessingOptions {
  auto_submit?: boolean;
  send_notifications?: boolean;
  generate_pay_stubs?: boolean;
  create_ach_files?: boolean;
  validate_only?: boolean; // Run validation without saving
}

export interface BatchSubmissionRequest {
  batch_id: string;
  processing_options?: BatchProcessingOptions;
  schedule_for?: string; // ISO date string to schedule processing
}

export interface BatchProcessingResult {
  success: boolean;
  batch_id: string;
  processing_summary: BatchProcessingSummary;
  errors: BatchError[];
  warnings: string[];
}

export interface BatchProcessingSummary {
  total_employees: number;
  successful_employees: number;
  failed_employees: number;
  skipped_employees: number;
  total_gross_pay: number;
  total_net_pay: number;
  total_taxes: number;
  processing_time_seconds: number;
  pay_stubs_generated: number;
  ach_records_created: number;
}

export interface BatchRetryRequest {
  batch_id: string;
  employee_ids?: string[]; // If empty, retry all failed employees
  reset_retry_count?: boolean;
}

export interface BatchRollbackRequest {
  batch_id: string;
  rollback_reason: string;
  rollback_pay_stubs?: boolean;
  rollback_ach_files?: boolean;
}

export interface BatchPreview {
  estimated_employees: number;
  estimated_gross_pay: number;
  estimated_net_pay: number;
  estimated_taxes: number;
  payroll_groups: PayrollGroupPreview[];
  warnings: string[];
  validation_errors: string[];
}

export interface PayrollGroupPreview {
  group_id: string;
  group_name: string;
  employee_count: number;
  estimated_gross_pay: number;
  employees: EmployeePreview[];
}

export interface EmployeePreview {
  employee_id: string;
  employee_name: string;
  estimated_gross_pay: number;
  estimated_net_pay: number;
  warnings: string[];
}

export interface BatchHealthStatus {
  status: 'ok' | 'warning' | 'error';
  version: string;
  timestamp: string;
  queue_status: QueueStatus;
  active_batches: number;
  system_metrics: SystemMetrics;
}

export interface QueueStatus {
  pending_jobs: number;
  processing_jobs: number;
  failed_jobs: number;
  queue_health: 'healthy' | 'degraded' | 'unhealthy';
}

export interface SystemMetrics {
  memory_usage_mb: number;
  cpu_usage_percent: number;
  disk_usage_percent: number;
  database_connections: number;
}

export interface BatchSearchFilters {
  company_id?: string;
  status?: BatchStatus;
  date_from?: string;
  date_to?: string;
  created_by?: string;
  payroll_group?: string;
  min_employees?: number;
  max_employees?: number;
}

export type BatchStatus = 'draft' | 'processing' | 'complete' | 'failed' | 'cancelled';

export type EmployeeBatchStatus = 'pending' | 'processing' | 'complete' | 'failed' | 'skipped';

export type BatchActionType = 'created' | 'submitted' | 'completed' | 'failed' | 'cancelled' | 'retried' | 'rollback';

export type BatchPermission = 'admin' | 'payroll_admin';

// Webhook/Event types for integration
export interface BatchWebhookPayload {
  event_type: 'batch.created' | 'batch.processing' | 'batch.completed' | 'batch.failed';
  batch_id: string;
  company_id: string;
  timestamp: string;
  data: PayrollBatch;
}