export interface PayrollEmployee {
  id: string;
  company_id: string;
  
  // Personal Info
  employee_number?: string;
  legal_first_name: string;
  legal_middle_name?: string;
  legal_last_name: string;
  preferred_name?: string;
  ssn_encrypted?: string;
  date_of_birth?: string;
  gender?: string;
  personal_email?: string;
  mobile_phone?: string;
  
  // Address Info
  residential_address?: any;
  work_location_id?: string;
  
  // Employment Status
  employment_status: 'active' | 'on_leave' | 'terminated';
  hire_date: string;
  termination_date?: string;
  termination_reason?: string;
  
  // Pay Setup
  pay_type: 'hourly' | 'salary' | 'commission' | 'flat_rate';
  pay_frequency: 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';
  compensation_rate: number;
  standard_hours_per_week?: number;
  overtime_eligible: boolean;
  shift_differential_rate?: number;
  shift_differential_type: 'percentage' | 'amount';
  pay_group_id?: string;
  
  // Direct Deposit
  direct_deposit_enabled: boolean;
  
  // Tax Setup
  federal_filing_status?: string;
  federal_allowances?: number;
  additional_federal_withholding?: number;
  state_filing_status?: string;
  state_allowances?: number;
  additional_state_withholding?: number;
  local_tax_code?: string;
  sui_state?: string;
  is_exempt_federal: boolean;
  is_exempt_state: boolean;
  tax_classification: 'w2' | '1099';
  
  // Job & Org Info - REQUIRED FOR PAYROLL
  job_title_id?: string; // REQUIRED for active employees
  workers_comp_code_id?: string; // REQUIRED for active employees
  job_title?: string;
  department?: string;
  division?: string;
  region?: string;
  reports_to_id?: string;
  hire_type: 'regular' | 'temp' | 'seasonal' | 'contractor';
  workers_comp_code?: string;
  eeo_job_classification?: string;
  internal_id?: string;
  badge_number?: string;
  
  // Time Tracking Integration
  time_tracking_enabled: boolean;
  time_tracking_pin_hash?: string;
  photo_reference_url?: string;
  badge_qr_code?: string;
  default_location_id?: string;
  last_clock_in_device_id?: string;
  time_tracking_timezone?: string;
  
  // Test Mode
  is_test_employee: boolean;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface PayrollEmployeeDirectDeposit {
  id: string;
  employee_id: string;
  bank_name: string;
  account_type: 'checking' | 'savings';
  routing_number: string;
  account_number_encrypted: string;
  account_number_last_four: string;
  allocation_type: 'percentage' | 'amount' | 'remainder';
  allocation_value: number;
  priority_order: number;
  is_active: boolean;
  is_primary: boolean;
  effective_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollEmployeeDeduction {
  id: string;
  employee_id: string;
  deduction_type_id?: string;
  deduction_name: string;
  deduction_code?: string;
  is_pre_tax: boolean;
  amount_type: 'amount' | 'percentage';
  amount_value: number;
  frequency: 'per_pay_period' | 'monthly' | 'annual';
  max_amount_per_year?: number;
  vendor_name?: string;
  garnishment_agency?: string;
  garnishment_type?: 'child_support' | 'tax_levy' | 'wage_garnishment';
  effective_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayrollEmployeeDocument {
  id: string;
  employee_id: string;
  document_type: 'i9' | 'w4' | 'direct_deposit_form' | 'offer_letter' | 'state_forms';
  document_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  tags?: string[];
  uploaded_by?: string;
  upload_date: string;
  is_confidential: boolean;
  retention_date?: string;
  created_at: string;
}

export interface PayrollEmployeeNote {
  id: string;
  employee_id: string;
  note_text: string;
  note_type: 'general' | 'hr' | 'payroll' | 'performance';
  is_confidential: boolean;
  mentioned_users?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PayGroup {
  id: string;
  name: string;
  description?: string;
  pay_frequency: 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';
  company_id: string;
}

export interface CreatePayrollEmployeeData {
  company_id: string;
  legal_first_name: string;
  legal_last_name: string;
  employment_status: 'active' | 'on_leave' | 'terminated';
  hire_date: string;
  pay_type: 'hourly' | 'salary' | 'commission' | 'flat_rate';
  pay_frequency: 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';
  compensation_rate: number;
  overtime_eligible: boolean;
  direct_deposit_enabled: boolean;
  is_exempt_federal: boolean;
  is_exempt_state: boolean;
  tax_classification: 'w2' | '1099';
  hire_type: 'regular' | 'temp' | 'seasonal' | 'contractor';
  is_test_employee: boolean;
  // REQUIRED for active employees
  job_title_id?: string;
  workers_comp_code_id?: string;
  standard_hours_per_week?: number;
  employee_number?: string;
  legal_middle_name?: string;
  preferred_name?: string;
  personal_email?: string;
  mobile_phone?: string;
  job_title?: string;
  department?: string;
}