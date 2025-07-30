// California State Income Tax + SDI Calculator - CA DE 44 2024
import type { TaxInput, CaliforniaTaxResult, TaxBracket } from './types';
import { TAX_YEAR_2024, roundToCents, calculateBracketTax, applyWageBaseCap } from './utils';

// CA 2024 Schedule A brackets
const CA_BRACKETS_2024 = [
  { upTo: 10099, rate: 0.01 },
  { upTo: 23942, rate: 0.02 },
  { upTo: 37788, rate: 0.04 },
  { upTo: 52455, rate: 0.06 },
  { upTo: 66295, rate: 0.08 },
  { upTo: 338639, rate: 0.093 },
  { upTo: 406364, rate: 0.103 },
  { upTo: 677275, rate: 0.113 },
  { upTo: 1000000, rate: 0.123 },
  { upTo: Infinity, rate: 0.133 },
];

/**
 * Simple wrapper for California State Tax calculation
 */
export function calculateCaliforniaTax(input: TaxInput): number {
  const multiplier = input.payFrequency === 'weekly' ? 52 :
    input.payFrequency === 'biweekly' ? 26 :
    input.payFrequency === 'semi-monthly' ? 24 : 12;
  const annualGrossPay = input.grossPay * multiplier;
  
  const result = calculateCaliforniaStateTax(input, annualGrossPay);
  return result.californiaStateTax;
}

/**
 * Simple wrapper for California SDI calculation
 */
export function calculateSDI(input: TaxInput): number {
  const result = calculateCaliforniaSDI(input);
  return result.sdi;
}

/**
 * Calculate California State Income Tax using CA DE 44 2024 method
 */
export function calculateCaliforniaStateTax(
  input: TaxInput,
  annualGrossPay: number
): CaliforniaTaxResult {
  const { california } = input;

  // Allowances reduce annual taxable wages
  const allowanceReduction = california.allowances * TAX_YEAR_2024.CALIFORNIA.ALLOWANCE_AMOUNT;
  const adjustedAnnualWages = Math.max(0, annualGrossPay - allowanceReduction);

  // Apply bracket-based tax calculation
  let tax = 0;
  let previous = 0;

  for (const bracket of CA_BRACKETS_2024) {
    if (adjustedAnnualWages > bracket.upTo) {
      tax += (bracket.upTo - previous) * bracket.rate;
      previous = bracket.upTo;
    } else {
      tax += (adjustedAnnualWages - previous) * bracket.rate;
      break;
    }
  }

  // Step 5: Add extra withholding
  const extraWithholdingAnnual = input.california.extraWithholding * 
    (input.payFrequency === 'weekly' ? 52 :
     input.payFrequency === 'biweekly' ? 26 :
     input.payFrequency === 'semi-monthly' ? 24 : 12);

  const totalAnnualStateWithholding = tax + extraWithholdingAnnual;

  // Step 6: Calculate California SDI (State Disability Insurance)
  const sdiResult = calculateCaliforniaSDI(input);

  // Step 7: Convert to per-pay-period amounts
  const payPeriods = 
    input.payFrequency === 'weekly' ? 52 :
    input.payFrequency === 'biweekly' ? 26 :
    input.payFrequency === 'semi-monthly' ? 24 : 12;

  const californiaStateTax = roundToCents(totalAnnualStateWithholding / payPeriods);

  return {
    californiaStateTax,
    sdi: sdiResult.sdi,
    annualStateWithholding: totalAnnualStateWithholding,
    annualSDI: sdiResult.annualSDI,
  };
}

/**
 * Calculate California SDI (State Disability Insurance)
 */
export function calculateCaliforniaSDI(input: TaxInput): { sdi: number; annualSDI: number } {
  const grossPay = input.grossPay;
  
  // SDI wage base cap per pay period
  const payPeriods = 
    input.payFrequency === 'weekly' ? 52 :
    input.payFrequency === 'biweekly' ? 26 :
    input.payFrequency === 'semi-monthly' ? 24 : 12;

  const sdiWageBasePerPeriod = TAX_YEAR_2024.CALIFORNIA.SDI_WAGE_BASE / payPeriods;
  
  // Apply wage base cap
  const taxableWages = Math.min(grossPay, sdiWageBasePerPeriod);
  
  // Calculate SDI tax (0.9% of wages up to wage base)
  const sdi = roundToCents(taxableWages * TAX_YEAR_2024.CALIFORNIA.SDI_RATE);
  const annualSDI = sdi * payPeriods;

  return { sdi, annualSDI };
}

/**
 * Calculate California taxable income after deductions
 */
export function calculateCaliforniaTaxableIncome(
  annualGrossPay: number,
  allowances: number
): number {
  // Apply allowances deduction
  const allowanceDeduction = allowances * TAX_YEAR_2024.CALIFORNIA.ALLOWANCE_AMOUNT;
  const taxableIncome = Math.max(0, annualGrossPay - allowanceDeduction);

  return taxableIncome;
}

/**
 * Get California marginal tax rate for given income
 */
export function getCaliforniaMarginalTaxRate(annualIncome: number): number {
  let previous = 0;
  
  for (const bracket of CA_BRACKETS_2024) {
    if (annualIncome > previous && annualIncome <= bracket.upTo) {
      return bracket.rate;
    }
    previous = bracket.upTo;
  }
  
  // If income exceeds all brackets, return highest rate
  return CA_BRACKETS_2024[CA_BRACKETS_2024.length - 1].rate;
}

/**
 * Check if wages are subject to California SDI
 */
export function isSubjectToCaliforniaSDI(
  grossPay: number,
  ytdEarnings: number
): boolean {
  return ytdEarnings < TAX_YEAR_2024.CALIFORNIA.SDI_WAGE_BASE;
}

/**
 * Calculate effective California tax rate
 */
export function calculateEffectiveCaliforniaTaxRate(
  annualGrossPay: number,
  annualTax: number
): number {
  if (annualGrossPay === 0) return 0;
  return annualTax / annualGrossPay;
}
