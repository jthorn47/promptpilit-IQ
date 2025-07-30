// FICA Tax Calculator - Social Security and Medicare
import type { TaxInput, FICATaxResult } from './types';
import { TAX_YEAR_2024, roundToCents, applyWageBaseCap } from './utils';

/**
 * Calculate FICA taxes (Social Security + Medicare + Additional Medicare)
 */
export function calculateFICA(input: TaxInput): {
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
} {
  const multiplier = input.payFrequency === 'weekly' ? 52 :
    input.payFrequency === 'biweekly' ? 26 :
    input.payFrequency === 'semi-monthly' ? 24 : 12;
  const annualGrossPay = input.grossPay * multiplier;
  
  return calculateFICATaxes(input, annualGrossPay);
}

export function calculateFICATaxes(
  input: TaxInput,
  annualGrossPay: number
): FICATaxResult {
  const grossPay = input.grossPay;

  // Social Security Tax (6.2% up to wage base)
  const socialSecurityWages = applyWageBaseCap(
    grossPay,
    TAX_YEAR_2024.FICA.SOCIAL_SECURITY_WAGE_BASE / 
    (input.payFrequency === 'weekly' ? 52 :
     input.payFrequency === 'biweekly' ? 26 :
     input.payFrequency === 'semi-monthly' ? 24 : 12)
  );
  
  const socialSecurity = roundToCents(
    socialSecurityWages * TAX_YEAR_2024.FICA.SOCIAL_SECURITY_RATE
  );

  // Medicare Tax (1.45% on all wages)
  const medicare = roundToCents(
    grossPay * TAX_YEAR_2024.FICA.MEDICARE_RATE
  );

  // Additional Medicare Tax (0.9% on wages above threshold)
  let additionalMedicare = 0;
  if (annualGrossPay > TAX_YEAR_2024.FICA.ADDITIONAL_MEDICARE_THRESHOLD) {
    const excessWages = annualGrossPay - TAX_YEAR_2024.FICA.ADDITIONAL_MEDICARE_THRESHOLD;
    const payPeriods = 
      input.payFrequency === 'weekly' ? 52 :
      input.payFrequency === 'biweekly' ? 26 :
      input.payFrequency === 'semi-monthly' ? 24 : 12;
    
    additionalMedicare = roundToCents(
      (excessWages / payPeriods) * TAX_YEAR_2024.FICA.ADDITIONAL_MEDICARE_RATE
    );
  }

  return {
    socialSecurity,
    medicare,
    additionalMedicare,
  };
}

/**
 * Calculate Social Security tax with wage base cap
 */
export function calculateSocialSecurityTax(
  grossPay: number,
  payFrequency: TaxInput['payFrequency'],
  ytdEarnings = 0
): number {
  const payPeriods = 
    payFrequency === 'weekly' ? 52 :
    payFrequency === 'biweekly' ? 26 :
    payFrequency === 'semi-monthly' ? 24 : 12;

  const wageBasePerPeriod = TAX_YEAR_2024.FICA.SOCIAL_SECURITY_WAGE_BASE / payPeriods;
  const remainingWageBase = Math.max(0, wageBasePerPeriod - (ytdEarnings / payPeriods));
  
  const taxableWages = Math.min(grossPay, remainingWageBase);
  
  return roundToCents(taxableWages * TAX_YEAR_2024.FICA.SOCIAL_SECURITY_RATE);
}

/**
 * Calculate Medicare tax (no wage base limit)
 */
export function calculateMedicareTax(grossPay: number): number {
  return roundToCents(grossPay * TAX_YEAR_2024.FICA.MEDICARE_RATE);
}

/**
 * Calculate Additional Medicare tax for high earners
 */
export function calculateAdditionalMedicareTax(
  annualGrossPay: number,
  payFrequency: TaxInput['payFrequency']
): number {
  if (annualGrossPay <= TAX_YEAR_2024.FICA.ADDITIONAL_MEDICARE_THRESHOLD) {
    return 0;
  }

  const excessWages = annualGrossPay - TAX_YEAR_2024.FICA.ADDITIONAL_MEDICARE_THRESHOLD;
  const payPeriods = 
    payFrequency === 'weekly' ? 52 :
    payFrequency === 'biweekly' ? 26 :
    payFrequency === 'semi-monthly' ? 24 : 12;

  const excessPerPeriod = excessWages / payPeriods;
  
  return roundToCents(excessPerPeriod * TAX_YEAR_2024.FICA.ADDITIONAL_MEDICARE_RATE);
}

/**
 * Check if wages are subject to Social Security tax
 */
export function isSubjectToSocialSecurityTax(
  grossPay: number,
  ytdEarnings: number
): boolean {
  return ytdEarnings < TAX_YEAR_2024.FICA.SOCIAL_SECURITY_WAGE_BASE;
}

/**
 * Check if wages are subject to Additional Medicare tax
 */
export function isSubjectToAdditionalMedicareTax(
  annualGrossPay: number
): boolean {
  return annualGrossPay > TAX_YEAR_2024.FICA.ADDITIONAL_MEDICARE_THRESHOLD;
}