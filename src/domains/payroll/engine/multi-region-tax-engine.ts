// Multi-State & International Tax Engine
// Handles tax compliance across multiple U.S. states and international jurisdictions

import { TaxProfile, TaxesWithheld } from './types';

export interface TaxJurisdiction {
  id: string;
  type: 'state' | 'province' | 'country' | 'local';
  code: string; // e.g., 'CA', 'NY', 'ON', 'UK'
  name: string;
  parent_code?: string; // For provinces/states under countries
  is_active: boolean;
  tax_rules: TaxRule[];
  reciprocity_agreements?: string[]; // Other jurisdiction codes
}

export interface TaxRule {
  id: string;
  jurisdiction_code: string;
  tax_type: 'income' | 'sui' | 'sdi' | 'local' | 'social' | 'vat';
  rate_type: 'flat' | 'progressive' | 'percentage';
  rates: TaxRateSchedule[];
  exemptions?: TaxExemption[];
  effective_date: string;
  expiry_date?: string;
  applies_to: 'employee' | 'employer' | 'both';
}

export interface TaxRateSchedule {
  min_income: number;
  max_income?: number;
  rate: number;
  flat_amount?: number;
}

export interface TaxExemption {
  type: 'personal' | 'dependent' | 'blind' | 'senior';
  amount: number;
  max_count?: number;
}

export interface EmployeeTaxProfile extends TaxProfile {
  employee_id: string;
  primary_work_jurisdiction: string;
  remote_work_jurisdiction?: string;
  residency_jurisdiction: string;
  dual_tax_scenario?: boolean;
  tax_treaty_benefits?: string[];
  custom_withholding_rules?: CustomWithholdingRule[];
}

export interface CustomWithholdingRule {
  jurisdiction_code: string;
  tax_type: string;
  override_rate?: number;
  additional_amount?: number;
  exemption_claimed?: boolean;
}

export interface TaxCalculationContext {
  employee_tax_profile: EmployeeTaxProfile;
  gross_pay: number;
  pay_period: 'weekly' | 'biweekly' | 'monthly' | 'annually';
  ytd_gross: number;
  ytd_taxes: Record<string, number>;
}

export class MultiRegionTaxEngine {
  private taxJurisdictions: Map<string, TaxJurisdiction> = new Map();
  
  constructor() {
    this.initializeDefaultJurisdictions();
  }

  /**
   * Initialize default U.S. states, Canadian provinces, and major countries
   */
  private initializeDefaultJurisdictions(): void {
    // U.S. States
    const usStates = [
      { code: 'CA', name: 'California' },
      { code: 'NY', name: 'New York' },
      { code: 'TX', name: 'Texas' },
      { code: 'FL', name: 'Florida' },
      { code: 'WA', name: 'Washington' },
      // Add more states as needed
    ];

    usStates.forEach(state => {
      this.taxJurisdictions.set(state.code, {
        id: `us-${state.code.toLowerCase()}`,
        type: 'state',
        code: state.code,
        name: state.name,
        parent_code: 'US',
        is_active: true,
        tax_rules: this.getDefaultStateTaxRules(state.code)
      });
    });

    // Canadian Provinces
    const canadianProvinces = [
      { code: 'ON', name: 'Ontario' },
      { code: 'BC', name: 'British Columbia' },
      { code: 'AB', name: 'Alberta' },
      { code: 'QC', name: 'Quebec' }
    ];

    canadianProvinces.forEach(province => {
      this.taxJurisdictions.set(province.code, {
        id: `ca-${province.code.toLowerCase()}`,
        type: 'province',
        code: province.code,
        name: province.name,
        parent_code: 'CA',
        is_active: true,
        tax_rules: this.getDefaultProvinceTaxRules(province.code)
      });
    });

    // Countries
    const countries = [
      { code: 'US', name: 'United States' },
      { code: 'CA', name: 'Canada' },
      { code: 'UK', name: 'United Kingdom' },
      { code: 'DE', name: 'Germany' },
      { code: 'AU', name: 'Australia' }
    ];

    countries.forEach(country => {
      this.taxJurisdictions.set(country.code, {
        id: `country-${country.code.toLowerCase()}`,
        type: 'country',
        code: country.code,
        name: country.name,
        is_active: true,
        tax_rules: this.getDefaultCountryTaxRules(country.code)
      });
    });
  }

  /**
   * Auto-detect employee tax jurisdiction based on their profile
   */
  public detectTaxJurisdictions(employee: EmployeeTaxProfile): string[] {
    const jurisdictions: string[] = [];

    // Primary work location
    if (employee.primary_work_jurisdiction) {
      jurisdictions.push(employee.primary_work_jurisdiction);
    }

    // Remote work location (if different)
    if (employee.remote_work_jurisdiction && 
        employee.remote_work_jurisdiction !== employee.primary_work_jurisdiction) {
      jurisdictions.push(employee.remote_work_jurisdiction);
    }

    // Residency jurisdiction (if different from work locations)
    if (employee.residency_jurisdiction && 
        !jurisdictions.includes(employee.residency_jurisdiction)) {
      jurisdictions.push(employee.residency_jurisdiction);
    }

    return jurisdictions;
  }

  /**
   * Calculate taxes for multiple jurisdictions
   */
  public calculateMultiJurisdictionTax(context: TaxCalculationContext): TaxesWithheld {
    const jurisdictions = this.detectTaxJurisdictions(context.employee_tax_profile);
    let totalTaxes: TaxesWithheld = {
      federal: 0,
      state: 0,
      fica: 0,
      medicare: 0,
      local: 0,
      sdi: 0
    };

    for (const jurisdictionCode of jurisdictions) {
      const jurisdiction = this.taxJurisdictions.get(jurisdictionCode);
      if (!jurisdiction) continue;

      const jurisdictionTax = this.calculateJurisdictionTax(jurisdiction, context);
      
      // Merge taxes based on type
      switch (jurisdiction.type) {
        case 'country':
          if (jurisdiction.code === 'US') {
            totalTaxes.federal += jurisdictionTax.federal;
            totalTaxes.fica += jurisdictionTax.fica;
            totalTaxes.medicare += jurisdictionTax.medicare;
          }
          break;
        case 'state':
        case 'province':
          totalTaxes.state += jurisdictionTax.state;
          if (jurisdictionTax.sdi) totalTaxes.sdi += jurisdictionTax.sdi;
          break;
        case 'local':
          if (jurisdictionTax.local) totalTaxes.local += jurisdictionTax.local;
          break;
      }
    }

    return this.applyReciprocityAgreements(totalTaxes, jurisdictions);
  }

  /**
   * Calculate tax for a specific jurisdiction
   */
  private calculateJurisdictionTax(
    jurisdiction: TaxJurisdiction, 
    context: TaxCalculationContext
  ): TaxesWithheld {
    const taxes: TaxesWithheld = {
      federal: 0,
      state: 0,
      fica: 0,
      medicare: 0,
      local: 0,
      sdi: 0
    };

    for (const rule of jurisdiction.tax_rules) {
      if (!this.isRuleApplicable(rule, context)) continue;

      const taxAmount = this.calculateTaxByRule(rule, context);
      
      switch (rule.tax_type) {
        case 'income':
          if (jurisdiction.type === 'country' && jurisdiction.code === 'US') {
            taxes.federal += taxAmount;
          } else {
            taxes.state += taxAmount;
          }
          break;
        case 'sui':
        case 'sdi':
          taxes.sdi = (taxes.sdi || 0) + taxAmount;
          break;
        case 'social':
          if (jurisdiction.code === 'US') {
            taxes.fica += taxAmount * 0.062; // Social Security
            taxes.medicare += taxAmount * 0.0145; // Medicare
          }
          break;
        case 'local':
          taxes.local = (taxes.local || 0) + taxAmount;
          break;
      }
    }

    return taxes;
  }

  /**
   * Check if a tax rule applies to the current context
   */
  private isRuleApplicable(rule: TaxRule, context: TaxCalculationContext): boolean {
    const now = new Date();
    const effectiveDate = new Date(rule.effective_date);
    const expiryDate = rule.expiry_date ? new Date(rule.expiry_date) : null;

    return now >= effectiveDate && (!expiryDate || now <= expiryDate);
  }

  /**
   * Calculate tax amount based on rule
   */
  private calculateTaxByRule(rule: TaxRule, context: TaxCalculationContext): number {
    const { gross_pay, ytd_gross } = context;
    
    switch (rule.rate_type) {
      case 'flat':
        return rule.rates[0]?.flat_amount || 0;
      case 'percentage':
        return gross_pay * (rule.rates[0]?.rate || 0) / 100;
      case 'progressive':
        return this.calculateProgressiveTax(rule.rates, gross_pay, ytd_gross);
      default:
        return 0;
    }
  }

  /**
   * Calculate progressive tax using tax brackets
   */
  private calculateProgressiveTax(
    rates: TaxRateSchedule[], 
    currentPay: number, 
    ytdGross: number
  ): number {
    let totalTax = 0;
    let taxableIncome = currentPay;

    for (const bracket of rates.sort((a, b) => a.min_income - b.min_income)) {
      if (taxableIncome <= 0) break;

      const bracketMin = bracket.min_income;
      const bracketMax = bracket.max_income || Infinity;
      
      if (ytdGross > bracketMax) continue;
      if (ytdGross + currentPay < bracketMin) continue;

      const taxableAtBracket = Math.min(
        Math.max(0, ytdGross + currentPay - bracketMin),
        bracketMax - bracketMin
      );

      totalTax += taxableAtBracket * (bracket.rate / 100);
      taxableIncome -= taxableAtBracket;
    }

    return totalTax;
  }

  /**
   * Apply reciprocity agreements to avoid double taxation
   */
  private applyReciprocityAgreements(
    taxes: TaxesWithheld, 
    jurisdictions: string[]
  ): TaxesWithheld {
    // Implement reciprocity logic here
    // For now, return taxes as-is
    return taxes;
  }

  /**
   * Get default tax rules for U.S. states
   */
  private getDefaultStateTaxRules(stateCode: string): TaxRule[] {
    const baseRules: TaxRule[] = [];

    // State income tax (varies by state)
    if (!['TX', 'FL', 'WA', 'NV', 'SD', 'WY', 'AK', 'TN', 'NH'].includes(stateCode)) {
      baseRules.push({
        id: `${stateCode}-income`,
        jurisdiction_code: stateCode,
        tax_type: 'income',
        rate_type: 'progressive',
        rates: this.getStateIncomeTaxRates(stateCode),
        effective_date: '2024-01-01',
        applies_to: 'employee'
      });
    }

    // State Unemployment Insurance (SUI)
    baseRules.push({
      id: `${stateCode}-sui`,
      jurisdiction_code: stateCode,
      tax_type: 'sui',
      rate_type: 'percentage',
      rates: [{ min_income: 0, max_income: 15000, rate: 3.4 }], // Example rate
      effective_date: '2024-01-01',
      applies_to: 'employer'
    });

    return baseRules;
  }

  /**
   * Get default tax rules for Canadian provinces
   */
  private getDefaultProvinceTaxRules(provinceCode: string): TaxRule[] {
    return [
      {
        id: `${provinceCode}-income`,
        jurisdiction_code: provinceCode,
        tax_type: 'income',
        rate_type: 'progressive',
        rates: this.getProvinceIncomeTaxRates(provinceCode),
        effective_date: '2024-01-01',
        applies_to: 'employee'
      }
    ];
  }

  /**
   * Get default tax rules for countries
   */
  private getDefaultCountryTaxRules(countryCode: string): TaxRule[] {
    const rules: TaxRule[] = [];

    switch (countryCode) {
      case 'US':
        rules.push({
          id: 'us-federal-income',
          jurisdiction_code: 'US',
          tax_type: 'income',
          rate_type: 'progressive',
          rates: [
            { min_income: 0, max_income: 11000, rate: 10 },
            { min_income: 11000, max_income: 44725, rate: 12 },
            { min_income: 44725, max_income: 95375, rate: 22 },
            { min_income: 95375, max_income: 197050, rate: 24 },
            { min_income: 197050, max_income: 250525, rate: 32 },
            { min_income: 250525, max_income: 626350, rate: 35 },
            { min_income: 626350, rate: 37 }
          ],
          effective_date: '2024-01-01',
          applies_to: 'employee'
        });
        
        rules.push({
          id: 'us-social-security',
          jurisdiction_code: 'US',
          tax_type: 'social',
          rate_type: 'percentage',
          rates: [{ min_income: 0, max_income: 160200, rate: 6.2 }],
          effective_date: '2024-01-01',
          applies_to: 'both'
        });
        break;
        
      case 'CA':
        rules.push({
          id: 'ca-federal-income',
          jurisdiction_code: 'CA',
          tax_type: 'income',
          rate_type: 'progressive',
          rates: [
            { min_income: 0, max_income: 53359, rate: 15 },
            { min_income: 53359, max_income: 106717, rate: 20.5 },
            { min_income: 106717, max_income: 165430, rate: 26 },
            { min_income: 165430, max_income: 235675, rate: 29 },
            { min_income: 235675, rate: 33 }
          ],
          effective_date: '2024-01-01',
          applies_to: 'employee'
        });
        break;
    }

    return rules;
  }

  private getStateIncomeTaxRates(stateCode: string): TaxRateSchedule[] {
    // Simplified rates - in production, this would come from a comprehensive database
    const defaultRates: Record<string, TaxRateSchedule[]> = {
      'CA': [
        { min_income: 0, max_income: 10275, rate: 1 },
        { min_income: 10275, max_income: 24350, rate: 2 },
        { min_income: 24350, max_income: 38575, rate: 4 },
        { min_income: 38575, max_income: 53980, rate: 6 },
        { min_income: 53980, max_income: 68350, rate: 8 },
        { min_income: 68350, max_income: 349137, rate: 9.3 },
        { min_income: 349137, max_income: 418961, rate: 10.3 },
        { min_income: 418961, max_income: 698271, rate: 11.3 },
        { min_income: 698271, rate: 12.3 }
      ],
      'NY': [
        { min_income: 0, max_income: 8500, rate: 4 },
        { min_income: 8500, max_income: 11700, rate: 4.5 },
        { min_income: 11700, max_income: 13900, rate: 5.25 },
        { min_income: 13900, max_income: 80650, rate: 5.85 },
        { min_income: 80650, max_income: 215400, rate: 6.25 },
        { min_income: 215400, max_income: 1077550, rate: 6.85 },
        { min_income: 1077550, rate: 8.82 }
      ]
    };

    return defaultRates[stateCode] || [{ min_income: 0, rate: 5 }]; // Default 5% flat rate
  }

  private getProvinceIncomeTaxRates(provinceCode: string): TaxRateSchedule[] {
    // Simplified Canadian provincial rates
    const defaultRates: Record<string, TaxRateSchedule[]> = {
      'ON': [
        { min_income: 0, max_income: 51446, rate: 5.05 },
        { min_income: 51446, max_income: 102894, rate: 9.15 },
        { min_income: 102894, max_income: 150000, rate: 11.16 },
        { min_income: 150000, max_income: 220000, rate: 12.16 },
        { min_income: 220000, rate: 13.16 }
      ],
      'BC': [
        { min_income: 0, max_income: 47937, rate: 5.06 },
        { min_income: 47937, max_income: 95875, rate: 7.7 },
        { min_income: 95875, max_income: 110076, rate: 10.5 },
        { min_income: 110076, max_income: 133664, rate: 12.29 },
        { min_income: 133664, rate: 14.7 }
      ]
    };

    return defaultRates[provinceCode] || [{ min_income: 0, rate: 10 }]; // Default 10% flat rate
  }

  /**
   * Validate tax jurisdiction setup for an employee
   */
  public validateEmployeeTaxSetup(employee: EmployeeTaxProfile): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check if primary work jurisdiction is configured
    if (!employee.primary_work_jurisdiction) {
      errors.push('Primary work jurisdiction is required');
    } else if (!this.taxJurisdictions.has(employee.primary_work_jurisdiction)) {
      errors.push(`Tax jurisdiction ${employee.primary_work_jurisdiction} is not configured`);
    }

    // Check for dual tax scenarios
    if (employee.dual_tax_scenario && !employee.remote_work_jurisdiction) {
      warnings.push('Dual tax scenario enabled but no remote work jurisdiction specified');
    }

    // Check for missing tax treaty benefits in international scenarios
    const jurisdictions = this.detectTaxJurisdictions(employee);
    const hasInternational = jurisdictions.some(j => {
      const jurisdiction = this.taxJurisdictions.get(j);
      return jurisdiction?.type === 'country' && jurisdiction.code !== 'US';
    });

    if (hasInternational && !employee.tax_treaty_benefits?.length) {
      warnings.push('International employee without tax treaty benefits specified');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }

  /**
   * Get all configured jurisdictions
   */
  public getJurisdictions(): TaxJurisdiction[] {
    return Array.from(this.taxJurisdictions.values());
  }

  /**
   * Add or update a tax jurisdiction
   */
  public setJurisdiction(jurisdiction: TaxJurisdiction): void {
    this.taxJurisdictions.set(jurisdiction.code, jurisdiction);
  }
}

// Export singleton instance
export const multiRegionTaxEngine = new MultiRegionTaxEngine();