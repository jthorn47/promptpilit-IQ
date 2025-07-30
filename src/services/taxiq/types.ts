// TaxIQ Types - Tax Calculation Interfaces
// Federal Income Tax + FICA + California State Tax + SDI

export interface TaxInput {
  grossPay: number;
  payFrequency: 'weekly' | 'biweekly' | 'semi-monthly' | 'monthly';
  year: number;
  federal: {
    filingStatus: 'single' | 'married' | 'head';
    step2Checkbox: boolean;
    dependents: number;
    extraWithholding: number;
  };
  california: {
    allowances: number;
    extraWithholding: number;
  };
}

export interface TaxOutput {
  netPay: number;
  taxes: {
    federalIncomeTax: number;
    socialSecurity: number;
    medicare: number;
    additionalMedicare: number;
    californiaStateTax: number;
    sdi: number;
  };
}

// Supporting calculation types
export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  baseAmount: number;
}

export interface FICARates {
  socialSecurityRate: number;
  socialSecurityWageBase: number;
  medicareRate: number;
  additionalMedicareRate: number;
  additionalMedicareThreshold: number;
}

export interface PayFrequencyMultiplier {
  annual: number;
  periods: number;
}

export interface TaxCalculationContext {
  annualGrossPay: number;
  federalTaxableIncome: number;
  californiaTaxableIncome: number;
  payFrequencyMultiplier: PayFrequencyMultiplier;
}

export interface FederalTaxResult {
  federalIncomeTax: number;
  annualWithholding: number;
}

export interface FICATaxResult {
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
}

export interface CaliforniaTaxResult {
  californiaStateTax: number;
  sdi: number;
  annualStateWithholding: number;
  annualSDI: number;
}