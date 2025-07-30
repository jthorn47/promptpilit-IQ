import type { TaxBracket, TaxConfiguration } from '../types';

// 2024 Federal Tax Brackets (example - should be updated annually)
export const FEDERAL_TAX_BRACKETS_2024: TaxBracket[] = [
  { min: 0, max: 11000, rate: 0.10 },
  { min: 11000, max: 44725, rate: 0.12 },
  { min: 44725, max: 95375, rate: 0.22 },
  { min: 95375, max: 182050, rate: 0.24 },
  { min: 182050, max: 231250, rate: 0.32 },
  { min: 231250, max: 578125, rate: 0.35 },
  { min: 578125, max: Infinity, rate: 0.37 }
];

// FICA rates for 2024
export const FICA_RATES_2024 = {
  socialSecurity: { rate: 0.062, cap: 160200 },
  medicare: { rate: 0.0145, additionalRate: 0.009, additionalThreshold: 200000 }
};

// FUTA rate for 2024
export const FUTA_RATE_2024 = { rate: 0.006, cap: 7000 };

export const calculateFederalIncomeTax = (
  annualIncome: number,
  brackets: TaxBracket[] = FEDERAL_TAX_BRACKETS_2024
): number => {
  let tax = 0;
  let remainingIncome = annualIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const taxableInThisBracket = Math.min(
      remainingIncome,
      bracket.max - bracket.min
    );

    tax += taxableInThisBracket * bracket.rate;
    remainingIncome -= taxableInThisBracket;
  }

  return Math.round(tax * 100) / 100;
};

export const calculateSocialSecurityTax = (
  income: number,
  rate: number = FICA_RATES_2024.socialSecurity.rate,
  cap: number = FICA_RATES_2024.socialSecurity.cap
): number => {
  const taxableIncome = Math.min(income, cap);
  return Math.round(taxableIncome * rate * 100) / 100;
};

export const calculateMedicareTax = (
  income: number,
  rates = FICA_RATES_2024.medicare
): number => {
  let tax = income * rates.rate;

  // Additional Medicare tax for high earners
  if (income > rates.additionalThreshold!) {
    const additionalTaxableIncome = income - rates.additionalThreshold!;
    tax += additionalTaxableIncome * rates.additionalRate!;
  }

  return Math.round(tax * 100) / 100;
};

export const calculateFUTATax = (
  income: number,
  rate: number = FUTA_RATE_2024.rate,
  cap: number = FUTA_RATE_2024.cap
): number => {
  const taxableIncome = Math.min(income, cap);
  return Math.round(taxableIncome * rate * 100) / 100;
};

export const calculateTotalFederalTaxes = (income: number): {
  federalIncome: number;
  socialSecurity: number;
  medicare: number;
  total: number;
} => {
  const federalIncome = calculateFederalIncomeTax(income);
  const socialSecurity = calculateSocialSecurityTax(income);
  const medicare = calculateMedicareTax(income);
  const total = federalIncome + socialSecurity + medicare;

  return {
    federalIncome,
    socialSecurity,
    medicare,
    total
  };
};

export const calculateEmployerTaxes = (income: number): {
  socialSecurity: number;
  medicare: number;
  futa: number;
  total: number;
} => {
  const socialSecurity = calculateSocialSecurityTax(income);
  const medicare = calculateMedicareTax(income);
  const futa = calculateFUTATax(income);
  const total = socialSecurity + medicare + futa;

  return {
    socialSecurity,
    medicare,
    futa,
    total
  };
};

export const calculateStateTax = (
  income: number,
  stateRate: number
): number => {
  return Math.round(income * stateRate * 100) / 100;
};

export const calculateNetPay = (
  grossPay: number,
  federalTaxes: number,
  stateTaxes: number = 0,
  otherDeductions: number = 0
): number => {
  return Math.round((grossPay - federalTaxes - stateTaxes - otherDeductions) * 100) / 100;
};

export const calculateYearToDateTax = (
  currentPeriodIncome: number,
  ytdIncome: number,
  brackets: TaxBracket[] = FEDERAL_TAX_BRACKETS_2024
): {
  currentPeriodTax: number;
  ytdTax: number;
  projectedAnnualTax: number;
} => {
  const previousYtdIncome = ytdIncome - currentPeriodIncome;
  const previousYtdTax = calculateFederalIncomeTax(previousYtdIncome, brackets);
  const newYtdTax = calculateFederalIncomeTax(ytdIncome, brackets);
  const currentPeriodTax = newYtdTax - previousYtdTax;

  // Project annual tax based on current YTD
  const projectedAnnualIncome = ytdIncome * (365 / new Date().getDate());
  const projectedAnnualTax = calculateFederalIncomeTax(projectedAnnualIncome, brackets);

  return {
    currentPeriodTax,
    ytdTax: newYtdTax,
    projectedAnnualTax
  };
};

export const calculateTaxBracketInfo = (
  income: number,
  brackets: TaxBracket[] = FEDERAL_TAX_BRACKETS_2024
): {
  currentBracket: TaxBracket;
  effectiveRate: number;
  marginalRate: number;
  nextBracketThreshold: number | null;
} => {
  let currentBracket = brackets[0];
  
  for (const bracket of brackets) {
    if (income >= bracket.min && income < bracket.max) {
      currentBracket = bracket;
      break;
    }
  }

  const totalTax = calculateFederalIncomeTax(income, brackets);
  const effectiveRate = income > 0 ? totalTax / income : 0;
  const marginalRate = currentBracket.rate;
  
  const nextBracket = brackets.find(b => b.min > currentBracket.max);
  const nextBracketThreshold = nextBracket ? nextBracket.min : null;

  return {
    currentBracket,
    effectiveRate,
    marginalRate,
    nextBracketThreshold
  };
};