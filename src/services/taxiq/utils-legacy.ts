// Legacy TaxIQ Utility Functions - For backwards compatibility only
// These functions use hardcoded values and should be migrated to database-driven versions

/**
 * Round monetary values to cents
 */
export function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Apply wage base cap to earnings
 */
export function applyWageBaseCap(grossPay: number, wageBaseCap: number): number {
  return Math.min(grossPay, wageBaseCap);
}

/**
 * Calculate tax using progressive bracket system
 */
export function calculateBracketTax(
  taxableIncome: number,
  brackets: Array<{ upTo: number; rate: number }>
): number {
  let tax = 0;
  let previousThreshold = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= previousThreshold) break;
    
    const taxableAtThisLevel = Math.min(taxableIncome, bracket.upTo) - previousThreshold;
    tax += taxableAtThisLevel * bracket.rate;
    previousThreshold = bracket.upTo;
    
    if (taxableIncome <= bracket.upTo) break;
  }

  return roundToCents(tax);
}

/**
 * Legacy constants for backwards compatibility - DEPRECATED
 * These will be removed in a future version. Use database functions instead.
 */
export const TAX_YEAR_2024 = {
  FEDERAL: {
    STANDARD_DEDUCTION: {
      single: 14600,
      married: 29200,
      head: 21900,
    },
    DEPENDENT_CREDIT: 2000,
  },
  FICA: {
    SOCIAL_SECURITY_RATE: 0.062,
    SOCIAL_SECURITY_WAGE_BASE: 168600,
    MEDICARE_RATE: 0.0145,
    ADDITIONAL_MEDICARE_RATE: 0.009,
    ADDITIONAL_MEDICARE_THRESHOLD: 250000,
  },
  CALIFORNIA: {
    SDI_RATE: 0.009,
    SDI_WAGE_BASE: 153164,
    ALLOWANCE_AMOUNT: 5200,
  },
};