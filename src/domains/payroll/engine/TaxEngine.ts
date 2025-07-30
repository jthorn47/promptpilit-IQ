
import { PayType } from '../types';
import { PayTypeEngine } from './PayTypeEngine';

export interface TaxCalculationInput {
  grossWages: number;
  preTaxDeductions: number;
  payTypeBreakdown: Array<{ payType: PayType; amount: number }>;
  filingStatus: string;
  allowances: number;
  additionalWithholding: number;
  state: string;
  ytdWages?: number;
  ytdTaxes?: number;
}

export interface TaxCalculationResult {
  federalIncomeTax: number;
  stateIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  stateDisabilityTax: number;
  totalTaxes: number;
  taxableWages: {
    federal: number;
    state: number;
    socialSecurity: number;
    medicare: number;
  };
}

export class TaxEngine {
  private static readonly SOCIAL_SECURITY_RATE = 0.062;
  private static readonly MEDICARE_RATE = 0.0145;
  private static readonly ADDITIONAL_MEDICARE_RATE = 0.009;
  private static readonly ADDITIONAL_MEDICARE_THRESHOLD = 200000;
  private static readonly SOCIAL_SECURITY_WAGE_BASE = 160200; // 2024 limit

  /**
   * Calculate all taxes using pay type flags
   */
  static calculateTaxes(input: TaxCalculationInput): TaxCalculationResult {
    // Calculate taxable wages by tax type using pay type flags
    const taxableWages = this.calculateTaxableWages(input);
    
    // Calculate individual taxes
    const federalIncomeTax = this.calculateFederalIncomeTax(
      taxableWages.federal,
      input.filingStatus,
      input.allowances,
      input.additionalWithholding
    );

    const stateIncomeTax = this.calculateStateIncomeTax(
      taxableWages.state,
      input.state,
      input.filingStatus
    );

    const socialSecurityTax = this.calculateSocialSecurityTax(
      taxableWages.socialSecurity,
      input.ytdWages || 0
    );

    const medicareTax = this.calculateMedicareTax(taxableWages.medicare);
    
    const additionalMedicareTax = this.calculateAdditionalMedicareTax(
      taxableWages.medicare,
      input.ytdWages || 0,
      input.filingStatus
    );

    const stateDisabilityTax = this.calculateStateDisabilityTax(
      taxableWages.state,
      input.state
    );

    const totalTaxes = federalIncomeTax + stateIncomeTax + socialSecurityTax + 
                      medicareTax + additionalMedicareTax + stateDisabilityTax;

    return {
      federalIncomeTax,
      stateIncomeTax,
      socialSecurityTax,
      medicareTax,
      additionalMedicareTax,
      stateDisabilityTax,
      totalTaxes,
      taxableWages
    };
  }

  /**
   * Calculate taxable wages by tax type using pay type flags
   */
  private static calculateTaxableWages(input: TaxCalculationInput): {
    federal: number;
    state: number;
    socialSecurity: number;
    medicare: number;
  } {
    let federalTaxableWages = 0;
    let stateTaxableWages = 0;
    let socialSecurityWages = 0;
    let medicareWages = 0;

    for (const { payType, amount } of input.payTypeBreakdown) {
      // Check federal tax eligibility
      if (PayTypeEngine.shouldIncludeInCalculation(payType, 'federal_tax')) {
        federalTaxableWages += amount;
      }

      // Check state tax eligibility
      if (PayTypeEngine.shouldIncludeInCalculation(payType, 'state_tax')) {
        stateTaxableWages += amount;
      }

      // Check FICA Social Security eligibility
      if (PayTypeEngine.shouldIncludeInCalculation(payType, 'fica_ss')) {
        socialSecurityWages += amount;
      }

      // Check Medicare eligibility
      if (PayTypeEngine.shouldIncludeInCalculation(payType, 'medicare')) {
        medicareWages += amount;
      }
    }

    // Subtract pre-tax deductions from taxable wages
    federalTaxableWages = Math.max(0, federalTaxableWages - input.preTaxDeductions);
    stateTaxableWages = Math.max(0, stateTaxableWages - input.preTaxDeductions);
    socialSecurityWages = Math.max(0, socialSecurityWages - input.preTaxDeductions);
    medicareWages = Math.max(0, medicareWages - input.preTaxDeductions);

    return {
      federal: federalTaxableWages,
      state: stateTaxableWages,
      socialSecurity: socialSecurityWages,
      medicare: medicareWages
    };
  }

  /**
   * Calculate federal income tax
   */
  private static calculateFederalIncomeTax(
    taxableWages: number,
    filingStatus: string,
    allowances: number,
    additionalWithholding: number
  ): number {
    // Simplified federal tax calculation
    // In a real implementation, this would use IRS tax tables
    let taxRate = 0.12; // Default 12% bracket
    
    switch (filingStatus.toLowerCase()) {
      case 'single':
        if (taxableWages > 40525) taxRate = 0.22;
        if (taxableWages > 86375) taxRate = 0.24;
        break;
      case 'married_filing_jointly':
        if (taxableWages > 81050) taxRate = 0.22;
        if (taxableWages > 172750) taxRate = 0.24;
        break;
    }

    const annualizedWages = taxableWages * 26; // Bi-weekly assumption
    const allowanceReduction = allowances * 4300; // Standard allowance amount
    const taxableIncome = Math.max(0, annualizedWages - allowanceReduction);
    
    const annualTax = taxableIncome * taxRate;
    const periodTax = annualTax / 26;
    
    return Math.round((periodTax + additionalWithholding) * 100) / 100;
  }

  /**
   * Calculate state income tax
   */
  private static calculateStateIncomeTax(
    taxableWages: number,
    state: string,
    filingStatus: string
  ): number {
    // State tax rates vary significantly
    const stateTaxRates: Record<string, number> = {
      'CA': 0.08,
      'NY': 0.065,
      'TX': 0.0, // No state income tax
      'FL': 0.0, // No state income tax
      'WA': 0.0, // No state income tax
      // Default rate for other states
      'DEFAULT': 0.05
    };

    const rate = stateTaxRates[state] || stateTaxRates.DEFAULT;
    return Math.round(taxableWages * rate * 100) / 100;
  }

  /**
   * Calculate Social Security tax with wage base limit
   */
  private static calculateSocialSecurityTax(taxableWages: number, ytdWages: number): number {
    const currentYtdWages = ytdWages + taxableWages;
    
    if (ytdWages >= this.SOCIAL_SECURITY_WAGE_BASE) {
      return 0; // Already exceeded wage base
    }
    
    const taxableAmount = Math.min(
      taxableWages,
      this.SOCIAL_SECURITY_WAGE_BASE - ytdWages
    );
    
    return Math.round(taxableAmount * this.SOCIAL_SECURITY_RATE * 100) / 100;
  }

  /**
   * Calculate Medicare tax
   */
  private static calculateMedicareTax(taxableWages: number): number {
    return Math.round(taxableWages * this.MEDICARE_RATE * 100) / 100;
  }

  /**
   * Calculate additional Medicare tax for high earners
   */
  private static calculateAdditionalMedicareTax(
    taxableWages: number,
    ytdWages: number,
    filingStatus: string
  ): number {
    let threshold = this.ADDITIONAL_MEDICARE_THRESHOLD;
    
    // Adjust threshold based on filing status
    if (filingStatus.toLowerCase() === 'married_filing_jointly') {
      threshold = 250000;
    } else if (filingStatus.toLowerCase() === 'married_filing_separately') {
      threshold = 125000;
    }

    const currentYtdWages = ytdWages + taxableWages;
    
    if (ytdWages >= threshold) {
      // All wages subject to additional Medicare tax
      return Math.round(taxableWages * this.ADDITIONAL_MEDICARE_RATE * 100) / 100;
    } else if (currentYtdWages > threshold) {
      // Partial wages subject to additional Medicare tax
      const taxableAmount = currentYtdWages - threshold;
      return Math.round(taxableAmount * this.ADDITIONAL_MEDICARE_RATE * 100) / 100;
    }
    
    return 0;
  }

  /**
   * Calculate state disability insurance (SDI) tax
   */
  private static calculateStateDisabilityTax(taxableWages: number, state: string): number {
    // Only certain states have SDI
    const sdiRates: Record<string, { rate: number; wageBase: number }> = {
      'CA': { rate: 0.009, wageBase: 153164 }, // 2024 CA SDI
      'NJ': { rate: 0.0033, wageBase: 151900 }, // 2024 NJ TDI
      'NY': { rate: 0.005, wageBase: 120000 }, // 2024 NY SDI
      'RI': { rate: 0.013, wageBase: 84000 }, // 2024 RI TDI
    };

    const sdiInfo = sdiRates[state];
    if (!sdiInfo) {
      return 0;
    }

    const taxableAmount = Math.min(taxableWages, sdiInfo.wageBase);
    return Math.round(taxableAmount * sdiInfo.rate * 100) / 100;
  }
}
