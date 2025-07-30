// Payroll Domain Types

export interface PayrollPeriod {
  id: string;
  company_id: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  status: 'draft' | 'processing' | 'completed' | 'paid';
  total_gross_pay: number;
  total_net_pay: number;
  total_taxes: number;
  total_deductions: number;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

export interface PayrollEmployee {
  id: string;
  company_id: string;
  location_id?: string;
  employee_number: string;
  instructor_name: string;
  email: string;
  phone?: string;
  hire_date: string;
  regular_hourly_rate: number;
  overtime_hourly_rate?: number;
  pay_frequency: 'weekly' | 'bi_weekly' | 'monthly' | 'semi_monthly';
  pay_type: 'hourly' | 'salary' | 'commission';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayrollCalculation {
  id: string;
  payroll_period_id: string;
  payroll_employee_id: string;
  total_classes: number;
  total_class_pay: number;
  total_regular_hours: number;
  total_overtime_hours: number;
  blended_rate: number;
  overtime_pay: number;
  regular_pay: number;
  gross_pay: number;
  calculation_details: any;
  created_at: string;
  updated_at: string;
}

export interface PayrollTaxCalculation {
  id: string;
  payroll_calculation_id: string;
  employee_id: string;
  gross_pay: number;
  federal_withholding: number;
  state_withholding: number;
  social_security_employee: number;
  medicare_employee: number;
  medicare_additional: number;
  state_disability_insurance: number;
  total_withholdings: number;
  net_pay: number;
  calculation_details: any;
  created_at: string;
  updated_at: string;
}

export interface PayrollDeduction {
  id: string;
  payroll_calculation_id: string;
  employee_id: string;
  deduction_type: string;
  amount: number;
  is_pre_tax: boolean;
  vendor_id?: string;
  garnishment_agency_id?: string;
  description: string;
  calculation_details: any;
  created_at: string;
  updated_at: string;
}

export interface Benefit {
  id: string;
  name: string;
  benefit_type: string;
  description: string;
  provider_name: string;
  is_pre_tax: boolean;
  is_post_tax: boolean;
  employer_contribution_amount: number;
  employer_contribution_percent: number;
  employee_max_contribution: number;
  annual_limit: number;
  coverage_levels: any;
  eligibility_requirements: any;
  enrollment_period_start: string;
  enrollment_period_end: string;
  effective_date: string;
  is_active: boolean;
  requires_medical_exam: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeBenefitAssignment {
  id: string;
  employee_id: string;
  benefit_id: string;
  coverage_level: string;
  employee_contribution_amount: number;
  employer_contribution_amount: number;
  enrollment_date: string;
  effective_date: string;
  end_date: string;
  status: string;
  beneficiaries: any;
  created_at: string;
  updated_at: string;
}

export interface PayType {
  id: string;
  company_id: string;
  name: string;
  code: string;
  pay_category: 'earnings' | 'reimbursement' | 'fringe_benefit' | 'deduction' | 'other';
  description?: string;
  
  // Basic configuration
  rate?: number;
  default_rate_multiplier: number;
  is_active: boolean;
  is_system_default: boolean;
  
  // Wage flags - made optional for backward compatibility
  used_to_pay_tipped_employees?: boolean;
  add_hours_into_total_hours_worked?: boolean;
  include_wage_in_true_gross_pay?: boolean;
  include_in_overtime_calculation?: boolean;
  increase_net_paycheck?: boolean;
  osha_reportable?: boolean;
  add_hours_into_total_hours?: boolean;
  include_in_401k_calculation?: boolean;
  retroactive_pay?: boolean;
  holiday_pay?: boolean;
  floating_holiday_pay?: boolean;
  deductible_pay?: boolean;
  
  // Wage configuration
  tip_status?: 'none' | 'direct' | 'indirect' | 'dual';
  client_gl_code?: string;
  gl_mapping_code: string;
  
  // Tax configuration - made optional for backward compatibility
  independent_contractor_1099?: boolean;
  include_ytd_in_w2_box_14?: boolean;
  tax_treatment?: string;
  tax_rate?: string;
  special_w2_handling_code?: string;
  tax_status?: string;
  
  // Tax flags
  is_taxable_federal: boolean;
  is_taxable_state: boolean;
  is_taxable_fica: boolean;
  is_taxable_medicare: boolean;
  is_taxable_sdi: boolean;
  is_taxable_sui: boolean;
  
  // Legacy compatibility
  is_overtime_eligible?: boolean;
  subject_to_overtime: boolean;
  counts_toward_hours_worked: boolean;
  includable_in_regular_rate: boolean;
  reportable_on_w2: boolean;
  w2_box_code: string;
  state_specific_rules: any;
  
  // Earning Subject To flags - made optional for backward compatibility
  worker_compensation?: boolean;
  federal_wh?: boolean;
  local_wh?: boolean;
  futa?: boolean;
  sdi?: boolean;
  service_charge?: boolean;
  state_wh?: boolean;
  fica_ss?: boolean;
  fica_medicare?: boolean;
  suta?: boolean;
  
  // Additional fields
  comments?: string;
  
  created_at: string;
  updated_at: string;
}