// Core Payroll Engine Types and Interfaces

export interface PayrollCalculationInput {
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  simulation?: boolean;
  earnings: EarningInput[];
  deductions: DeductionInput[];
  tax_profile: TaxProfile;
}

export interface EarningInput {
  type: 'hourly' | 'salary' | 'bonus' | 'commission' | 'shift_differential' | 'overtime' | 'double_time';
  hours?: number;
  rate?: number;
  amount?: number;
  multiplier?: number; // for overtime calculations
}

export interface DeductionInput {
  type: string;
  amount?: number;
  percentage?: number;
  is_pre_tax: boolean;
  annual_limit?: number;
  current_ytd?: number;
}

export interface TaxProfile {
  filing_status: string;
  allowances: number;
  state: string;
  locality?: string;
  additional_withholding?: number;
  exempt?: boolean;
}

export interface PayrollCalculationOutput {
  gross_pay: number;
  pre_tax_deductions: number;
  taxes_withheld: TaxesWithheld;
  post_tax_deductions: number;
  net_pay: number;
  employer_taxes: EmployerTaxes;
  calculation_details: CalculationDetails;
  metadata?: PayrollCalculationMetadata;
}

export interface PayrollCalculationMetadata {
  engine_source?: string;
  is_mock?: boolean;
  is_simulation?: boolean;
  is_historical?: boolean;
  is_batch?: boolean;
  calculation_source?: string;
  warning?: string;
}

export interface TaxesWithheld {
  federal: number;
  state: number;
  fica: number;
  medicare: number;
  local?: number;
  sdi?: number; // State Disability Insurance
}

export interface EmployerTaxes {
  fica: number;
  medicare: number;
  futa: number;
  suta: number;
  state_unemployment?: number;
}

export interface CalculationDetails {
  engine_version: string;
  calculation_date: string;
  tax_table_version: string;
  earnings_breakdown: EarningResult[];
  deductions_breakdown: DeductionResult[];
  tax_calculations: TaxCalculationDetail[];
}

export interface EarningResult {
  type: string;
  description: string;
  hours?: number;
  rate?: number;
  amount: number;
}

export interface DeductionResult {
  type: string;
  description: string;
  amount: number;
  is_pre_tax: boolean;
  remaining_annual_limit?: number;
}

export interface TaxCalculationDetail {
  type: string;
  taxable_wages: number;
  rate?: number;
  amount: number;
  jurisdiction: string;
}

export interface CalculationContext {
  employee_id: string;
  pay_period: {
    start: Date;
    end: Date;
  };
  simulation: boolean;
  engine_version: string;
  calculation_timestamp: Date;
}