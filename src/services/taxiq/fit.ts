// Federal Income Tax Calculator - IRS 15-T 2024 Percentage Method
import type { TaxInput, FederalTaxResult, TaxBracket } from './types';
import { TAX_YEAR_2024, roundToCents, calculateBracketTax } from './utils';

// 2024 Federal Tax Brackets - Standard Progressive Method
const FEDERAL_BRACKETS_2024 = {
  single: [
    { upTo: 11600, rate: 0.10 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243725, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  married: [
    { upTo: 23200, rate: 0.10 },
    { upTo: 94300, rate: 0.12 },
    { upTo: 201050, rate: 0.22 },
    { upTo: 383900, rate: 0.24 },
    { upTo: 487450, rate: 0.32 },
    { upTo: 731200, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  head: [
    { upTo: 16550, rate: 0.10 },
    { upTo: 63100, rate: 0.12 },
    { upTo: 100500, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243700, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
};

/**
 * Calculate Federal Income Tax using Standard Progressive Method
 */
export function calculateFederalIncomeTax(input: TaxInput): number {
  const { grossPay, payFrequency, federal } = input;
  const multiplier = payFrequency === 'weekly' ? 52 :
    payFrequency === 'biweekly' ? 26 :
    payFrequency === 'semi-monthly' ? 24 : 12;
  const annualWages = grossPay * multiplier;

  // Subtract standard deduction
  const standardDeduction = TAX_YEAR_2024.FEDERAL.STANDARD_DEDUCTION[federal.filingStatus];
  let taxableIncome = annualWages - standardDeduction;

  // Subtract dependent credits
  const dependentCredit = federal.dependents * TAX_YEAR_2024.FEDERAL.DEPENDENT_CREDIT;
  taxableIncome = taxableIncome - dependentCredit;
  taxableIncome = Math.max(0, taxableIncome);

  // Apply progressive tax brackets
  const brackets = FEDERAL_BRACKETS_2024[federal.filingStatus];
  if (!brackets) {
    throw new Error(`Invalid filing status: ${federal.filingStatus}`);
  }

  let tax = 0;
  let previous = 0;

  for (const bracket of brackets) {
    if (taxableIncome > bracket.upTo) {
      tax += (bracket.upTo - previous) * bracket.rate;
      previous = bracket.upTo;
    } else {
      tax += (taxableIncome - previous) * bracket.rate;
      break;
    }
  }

  // Apply Step 2 checkbox multiplier
  if (federal.step2Checkbox) {
    tax *= 2;
  }

  // Convert to per-pay-period and add extra withholding
  const perPeriodTax = tax / multiplier;
  return perPeriodTax + (federal.extraWithholding || 0);
}

export function calculateFederalIncomeTaxDetailed(
  input: TaxInput,
  annualGrossPay: number
): FederalTaxResult {
  const { federal } = input;

  // Step 1: Subtract standard deduction
  const standardDeduction = TAX_YEAR_2024.FEDERAL.STANDARD_DEDUCTION[federal.filingStatus];
  let taxableIncome = annualGrossPay - standardDeduction;

  // Step 2: Subtract dependent credits (using $2,000 per dependent as a flat reduction)
  const dependentCredit = federal.dependents * TAX_YEAR_2024.FEDERAL.DEPENDENT_CREDIT;
  taxableIncome = taxableIncome - dependentCredit;

  taxableIncome = Math.max(0, taxableIncome);

  // Step 3: Apply progressive tax bracket logic
  const brackets = FEDERAL_BRACKETS_2024[federal.filingStatus];
  if (!brackets) {
    throw new Error(`Invalid filing status: ${federal.filingStatus}`);
  }

  let tax = 0;
  let previous = 0;

  for (const bracket of brackets) {
    if (taxableIncome > bracket.upTo) {
      tax += (bracket.upTo - previous) * bracket.rate;
      previous = bracket.upTo;
    } else {
      tax += (taxableIncome - previous) * bracket.rate;
      break;
    }
  }

  // Step 4: Adjust for Step 2 checkbox
  if (federal.step2Checkbox) {
    tax *= 2;
  }

  // Step 5: Add extra withholding (already annualized by pay frequency)
  const extraWithholdingAnnual = federal.extraWithholding * 
    (input.payFrequency === 'weekly' ? 52 :
     input.payFrequency === 'biweekly' ? 26 :
     input.payFrequency === 'semi-monthly' ? 24 : 12);

  const totalAnnualWithholding = tax + extraWithholdingAnnual;

  // Step 6: Convert to per-pay-period amount
  const payPeriods = 
    input.payFrequency === 'weekly' ? 52 :
    input.payFrequency === 'biweekly' ? 26 :
    input.payFrequency === 'semi-monthly' ? 24 : 12;

  const federalIncomeTax = roundToCents(totalAnnualWithholding / payPeriods);

  return {
    federalIncomeTax,
    annualWithholding: totalAnnualWithholding,
  };
}

/**
 * Calculate federal taxable income after deductions
 */
export function calculateFederalTaxableIncome(
  annualGrossPay: number,
  filingStatus: TaxInput['federal']['filingStatus'],
  dependents: number,
  step2Checkbox: boolean
): number {
  let taxableIncome = annualGrossPay;

  // Apply standard deduction
  const standardDeduction = TAX_YEAR_2024.FEDERAL.STANDARD_DEDUCTION[filingStatus];
  taxableIncome = Math.max(0, taxableIncome - standardDeduction);

  // Apply dependent credit if Step 2 checkbox is checked
  if (step2Checkbox && dependents > 0) {
    const dependentCredit = dependents * TAX_YEAR_2024.FEDERAL.DEPENDENT_CREDIT;
    taxableIncome = Math.max(0, taxableIncome - dependentCredit);
  }

  return taxableIncome;
}

/**
 * Get marginal tax rate for a given income and filing status
 */
export function getMarginalTaxRate(
  annualIncome: number,
  filingStatus: TaxInput['federal']['filingStatus']
): number {
  const brackets = FEDERAL_BRACKETS_2024[filingStatus];
  
  let previous = 0;
  for (const bracket of brackets) {
    if (annualIncome > previous && annualIncome <= bracket.upTo) {
      return bracket.rate;
    }
    previous = bracket.upTo;
  }
  
  // If income exceeds all brackets, return highest rate
  return brackets[brackets.length - 1].rate;
}