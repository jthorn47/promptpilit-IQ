// Pay Stub Generator Types

export interface PayStub {
  id: string;
  employee_id: string;
  payroll_period_id: string;
  payroll_calculation_id: string;
  company_id: string;
  stub_number: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  
  // Employee Information (Legally Required)
  employee_name: string;
  employee_ssn_last_four?: string;
  employee_id_number?: string;
  employee_address?: EmployeeAddress;
  
  // Employer Information (Legally Required)
  employer_legal_name: string;
  employer_address: EmployerAddress;
  employer_ein: string;
  employer_phone?: string;
  employer_uBI_number?: string; // WA state requirement
  
  // Pay Information (Legally Required)
  regular_hours: number;
  regular_rate: number;
  overtime_hours?: number;
  overtime_rate?: number;
  double_time_hours?: number;
  double_time_rate?: number;
  
  // Pay Totals
  gross_pay: number;
  net_pay: number;
  total_deductions: number;
  total_taxes: number;
  
  // YTD Totals (Legally Required)
  ytd_gross_pay: number;
  ytd_net_pay: number;
  ytd_taxes: number;
  ytd_deductions: number;
  
  // Detailed Breakdowns
  earnings_breakdown: EarningsBreakdown[];
  deductions_breakdown: DeductionsBreakdown[];
  taxes_breakdown: TaxesBreakdown[];
  employer_contributions: EmployerContribution[];
  
  // Leave Balances (State-Specific Requirements)
  pto_balance?: number;
  sick_leave_balance?: number; // Required in CA, NY, WA
  vacation_balance?: number;
  
  // Payment Method
  direct_deposit_breakdown?: DirectDepositBreakdown[];
  check_number?: string;
  
  // Compliance & Metadata
  state_jurisdiction: string;
  pdf_file_path?: string;
  pdf_generated_at?: string;
  status: PayStubStatus;
  metadata: PayStubMetadata;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Legacy compatibility
  employees?: any[];
  employee_count?: number;
  period_start?: string;
  period_end?: string;
  total_gross_pay?: number;
}

export interface EmployeeAddress {
  street: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface EmployerAddress {
  legal_name: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
}

export interface EarningsBreakdown {
  code: string;
  description: string;
  hours?: number;
  rate?: number;
  amount: number;
  ytd_amount: number;
  type: 'regular' | 'overtime' | 'double_time' | 'bonus' | 'commission' | 'holiday' | 'vacation' | 'sick' | 'other';
  is_taxable: boolean;
  state_specific_notes?: string; // For state-specific requirements
}

export interface DeductionsBreakdown {
  code: string;
  description: string;
  amount: number;
  ytd_amount: number;
  is_pre_tax: boolean;
  vendor_name?: string;
  type: 'benefits' | 'garnishment' | 'retirement' | 'hsa_fsa' | 'union_dues' | 'other';
  is_legally_required: boolean; // Distinguish required vs voluntary
  category: 'voluntary' | 'mandatory' | 'court_ordered';
}

export interface TaxesBreakdown {
  code: string;
  description: string;
  amount: number;
  ytd_amount: number;
  tax_type: 'federal' | 'state' | 'local' | 'fica_ss' | 'fica_medicare' | 'sdi' | 'futa' | 'sui' | 'medicare_additional';
  rate?: number;
  taxable_wages?: number; // Wages subject to this tax
  jurisdiction?: string; // For local taxes
}

export interface EmployerContribution {
  code: string;
  description: string;
  amount: number;
  ytd_amount: number;
  type: 'health_insurance' | 'dental_insurance' | 'vision_insurance' | 'life_insurance' | 'retirement_match' | 'other';
  is_taxable_to_employee: boolean;
  vendor_name?: string;
}

export interface DirectDepositBreakdown {
  account_type: 'checking' | 'savings';
  account_last_four: string;
  bank_name?: string;
  routing_number_last_four?: string;
  amount: number;
  percentage?: number;
  is_remainder: boolean;
  bank_verification_status?: 'verified' | 'pending' | 'failed';
}

export interface PayStubAccessLog {
  id: string;
  pay_stub_id: string;
  accessed_by: string;
  access_type: 'view' | 'download' | 'email';
  ip_address?: string;
  user_agent?: string;
  accessed_at: string;
  company_id: string;
}

export interface PayStubGenerationRequest {
  payroll_period_id: string;
  employee_ids?: string[]; // If empty, generate for all employees in period
  company_id: string;
  generate_pdf?: boolean;
  email_to_employees?: boolean;
}

export interface PayStubGenerationResult {
  success: boolean;
  generated_count: number;
  failed_count: number;
  pay_stub_ids: string[];
  errors: PayStubGenerationError[];
}

export interface PayStubGenerationError {
  employee_id: string;
  employee_name: string;
  error_code: string;
  error_message: string;
}

export interface PayStubPDFOptions {
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  includeCompanyLogo?: boolean;
  includeWatermark?: boolean;
  customFooter?: string;
}

export interface PayStubDisplaySettings {
  showYTDTotals: boolean;
  showDirectDeposit: boolean;
  showTaxDetails: boolean;
  groupSimilarEarnings: boolean;
  customCompanyInfo?: {
    legal_name: string;
    address: EmployerAddress;
    ein: string;
    phone?: string;
    logo_url?: string;
    uBI_number?: string; // Washington state
  };
  state_specific_settings?: StateSpecificSettings;
}

export interface StateSpecificSettings {
  state_code: string;
  show_sick_leave_balance: boolean;
  show_overtime_breakdown: boolean;
  show_employer_uBI: boolean;
  required_disclaimers: string[];
  wage_statement_frequency: 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';
}

export interface PayStubMetadata extends Record<string, any> {
  compliance_version: string;
  state_jurisdiction: string;
  local_jurisdictions?: string[];
  ada_compliant: boolean;
  generation_source: 'automatic' | 'manual' | 'correction';
  correction_reason?: string;
  previous_stub_id?: string;
}

export interface EmployeePayStubSummary {
  employee_id: string;
  employee_name: string;
  total_stubs: number;
  latest_pay_date: string;
  ytd_gross_pay: number;
  ytd_net_pay: number;
  ytd_taxes: number;
}

export interface PayStubMetrics {
  total_generated: number;
  total_downloaded: number;
  total_viewed: number;
  generation_date_range: {
    start: string;
    end: string;
  };
  average_gross_pay: number;
  total_payroll_amount: number;
  employee_count: number;
}

export type PayStubStatus = 'generated' | 'pdf_ready' | 'emailed' | 'viewed' | 'error';

export type PayStubPermission = 'admin' | 'payroll_view' | 'employee_self_service';

export interface PayStubSearchFilters {
  employee_name?: string;
  employee_id?: string;
  pay_date_start?: string;
  pay_date_end?: string;
  status?: PayStubStatus;
  min_amount?: number;
  max_amount?: number;
  company_id?: string;
  state_jurisdiction?: string;
  stub_number?: string;
}

export interface PayStubBatchOperation {
  operation: 'download' | 'email' | 'regenerate' | 'compliance_check';
  pay_stub_ids: string[];
  options?: {
    email_template?: string;
    pdf_options?: PayStubPDFOptions;
    notification_settings?: {
      send_to_admin: boolean;
      send_to_employees: boolean;
    };
    compliance_standards?: string[]; // e.g., ['federal', 'california', 'ada']
  };
}

export interface PayStubComplianceCheck {
  stub_id: string;
  is_compliant: boolean;
  federal_compliance: boolean;
  state_compliance: boolean;
  ada_compliance: boolean;
  missing_fields: string[];
  warnings: string[];
  recommendations: string[];
  last_checked_at: string;
}