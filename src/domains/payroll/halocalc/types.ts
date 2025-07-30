// HALOcalc Payroll Engine Types
import { PayrollCalculationInput, PayrollCalculationOutput } from '../engine/types';

// Enhanced input for HALOcalc
export interface HALOcalcInput extends PayrollCalculationInput {
  timecards: TimecardEntry[];
  garnishments: Garnishment[];
  fixed_wages: FixedWage[];
  bonuses: Bonus[];
  simulation_config?: SimulationConfig;
  validation_rules?: ValidationRule[];
}

export interface TimecardEntry {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string;
  clock_out: string;
  hours_worked: number;
  overtime_hours?: number;
  double_time_hours?: number;
  break_minutes?: number;
  department?: string;
  location?: string;
  job_code?: string;
  approved_by?: string;
  notes?: string;
}

export interface Garnishment {
  id: string;
  type: 'child_support' | 'wage_levy' | 'student_loan' | 'bankruptcy' | 'other';
  amount?: number;
  percentage?: number;
  max_per_period?: number;
  priority: number;
  court_order_number?: string;
  remaining_balance?: number;
  is_active: boolean;
}

export interface FixedWage {
  id: string;
  type: 'salary' | 'hourly' | 'piece_rate';
  amount: number;
  frequency: 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'annual';
  effective_date: string;
  end_date?: string;
}

export interface Bonus {
  id: string;
  type: 'performance' | 'retention' | 'signing' | 'holiday' | 'commission' | 'other';
  amount: number;
  description: string;
  is_taxable: boolean;
  approval_required: boolean;
  approved_by?: string;
  approved_at?: string;
}

export interface SimulationConfig {
  mode: 'wage_change' | 'bonus_impact' | 'deduction_change' | 'tax_scenario';
  scenarios: SimulationScenario[];
  compare_to_baseline: boolean;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  changes: {
    wage_adjustments?: { [key: string]: number };
    bonus_additions?: Bonus[];
    deduction_changes?: { [key: string]: number };
    tax_profile_changes?: Partial<any>;
  };
}

export interface ValidationRule {
  id: string;
  name: string;
  type: 'timecard' | 'wage' | 'deduction' | 'tax' | 'garnishment';
  rule_definition: {
    conditions: ValidationCondition[];
    action: 'warn' | 'block' | 'auto_correct';
    message: string;
  };
}

export interface ValidationCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'contains';
  value: any;
  logical_operator?: 'and' | 'or';
}

// Enhanced output for HALOcalc
export interface HALOcalcOutput extends PayrollCalculationOutput {
  validation_results: ValidationResult[];
  gl_mappings: GLMapping[];
  paystub_data: PaystubData;
  calculation_steps: CalculationStep[];
  simulation_results?: SimulationResult[];
  error_log: ProcessingError[];
  performance_metrics: PerformanceMetrics;
}

export interface ValidationResult {
  rule_id: string;
  rule_name: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  affected_fields: string[];
  suggested_action?: string;
}

export interface GLMapping {
  account_code: string;
  account_name: string;
  amount: number;
  debit_credit: 'debit' | 'credit';
  cost_center?: string;
  department?: string;
  project?: string;
}

export interface PaystubData {
  employee_info: {
    name: string;
    employee_id: string;
    pay_period: string;
    pay_date: string;
  };
  earnings_section: PaystubLineItem[];
  deductions_section: PaystubLineItem[];
  taxes_section: PaystubLineItem[];
  garnishments_section?: PaystubLineItem[];
  net_pay_section: PaystubLineItem[];
  ytd_totals: { [key: string]: number };
}

export interface PaystubLineItem {
  description: string;
  current_amount: number;
  ytd_amount: number;
  rate?: number;
  hours?: number;
  units?: number;
}

export interface CalculationStep {
  step_number: number;
  step_name: string;
  description: string;
  input_values: { [key: string]: any };
  output_values: { [key: string]: any };
  formula_used?: string;
  explanation: string;
  ai_explanation?: string;
}

export interface SimulationResult {
  scenario_id: string;
  scenario_name: string;
  baseline_comparison: {
    gross_pay_difference: number;
    net_pay_difference: number;
    tax_difference: number;
    percentage_change: number;
  };
  detailed_breakdown: HALOcalcOutput;
}

export interface ProcessingError {
  error_id: string;
  error_type: 'validation' | 'calculation' | 'system' | 'external_api';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  error_code?: string;
  affected_employee?: string;
  resolution_steps?: string[];
  timestamp: string;
}

export interface PerformanceMetrics {
  total_processing_time_ms: number;
  validation_time_ms: number;
  calculation_time_ms: number;
  api_calls_made: number;
  memory_usage_mb?: number;
  employees_processed: number;
  errors_encountered: number;
}

// API Request/Response Types
export interface HALOcalcCalculateRequest {
  inputs: HALOcalcInput[];
  options?: {
    enable_simulation: boolean;
    enable_ai_explanations: boolean;
    validation_level: 'basic' | 'standard' | 'strict';
    async_processing: boolean;
  };
}

export interface HALOcalcCalculateResponse {
  job_id?: string; // For async processing
  results?: HALOcalcOutput[];
  status: 'completed' | 'processing' | 'failed';
  message?: string;
  processing_summary?: {
    total_employees: number;
    successful: number;
    failed: number;
    warnings: number;
  };
}

export interface HALOcalcSimulateRequest {
  baseline_inputs: HALOcalcInput[];
  simulation_config: SimulationConfig;
  options?: {
    include_detailed_breakdown: boolean;
    enable_ai_explanations: boolean;
  };
}

export interface HALOcalcJobStatus {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  estimated_completion_time?: string;
  results_url?: string;
  error_message?: string;
}