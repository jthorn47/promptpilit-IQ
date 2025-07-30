import { DeductionInput, DeductionResult } from './types';
import { PayType } from '../types';
import { PayTypeEngine } from './PayTypeEngine';

export class DeductionsEngine {
  private static readonly DECIMAL_PRECISION = 4;

  /**
   * Calculate all deductions with pay type flag support
   */
  static calculateDeductions(
    deductions: DeductionInput[],
    grossPay: number,
    payTypeBreakdown?: Array<{ payType: PayType; amount: number }>
  ): {
    preTaxTotal: number;
    postTaxTotal: number;
    breakdown: DeductionResult[];
    adjustedGrossPay: number;
  } {
    let preTaxTotal = 0;
    let postTaxTotal = 0;
    const breakdown: DeductionResult[] = [];

    // Calculate taxable gross pay based on pay type flags
    let adjustedGrossPay = grossPay;
    if (payTypeBreakdown) {
      adjustedGrossPay = 0;
      for (const { payType, amount } of payTypeBreakdown) {
        if (PayTypeEngine.shouldIncludeInCalculation(payType, 'gross_pay')) {
          adjustedGrossPay = this.addPrecise(adjustedGrossPay, amount);
        }
      }
    }

    // Sort deductions by priority (pre-tax first, then by type)
    const sortedDeductions = this.sortDeductionsByPriority(deductions);
    let remainingGrossPay = adjustedGrossPay;

    for (const deduction of sortedDeductions) {
      const result = this.calculateDeduction(deduction, remainingGrossPay);
      
      if (result.amount > 0) {
        if (deduction.is_pre_tax) {
          preTaxTotal = this.addPrecise(preTaxTotal, result.amount);
          remainingGrossPay = this.subtractPrecise(remainingGrossPay, result.amount);
        } else {
          postTaxTotal = this.addPrecise(postTaxTotal, result.amount);
        }
        breakdown.push(result);
      }
    }

    return {
      preTaxTotal: this.roundToTwoDecimals(preTaxTotal),
      postTaxTotal: this.roundToTwoDecimals(postTaxTotal),
      breakdown,
      adjustedGrossPay: this.roundToTwoDecimals(adjustedGrossPay)
    };
  }

  /**
   * Calculate 401(k) contribution base using pay type flags
   */
  static calculate401kBase(payTypeBreakdown: Array<{ payType: PayType; amount: number }>): number {
    let contributionBase = 0;
    
    for (const { payType, amount } of payTypeBreakdown) {
      if (PayTypeEngine.shouldIncludeInCalculation(payType, '401k_base')) {
        contributionBase = this.addPrecise(contributionBase, amount);
      }
    }
    
    return this.roundToTwoDecimals(contributionBase);
  }

  /**
   * Calculate workers' compensation wages using pay type flags
   */
  static calculateWorkersCompWages(payTypeBreakdown: Array<{ payType: PayType; amount: number }>): number {
    let workersCompWages = 0;
    
    for (const { payType, amount } of payTypeBreakdown) {
      if (PayTypeEngine.shouldIncludeInCalculation(payType, 'workers_comp')) {
        workersCompWages = this.addPrecise(workersCompWages, amount);
      }
    }
    
    return this.roundToTwoDecimals(workersCompWages);
  }

  /**
   * Calculate individual deduction amount
   */
  private static calculateDeduction(
    deduction: DeductionInput,
    availableWages: number
  ): DeductionResult {
    let amount = 0;
    let description = this.getDeductionDescription(deduction.type);

    // Calculate base deduction amount
    if (deduction.amount) {
      amount = deduction.amount;
    } else if (deduction.percentage) {
      amount = availableWages * (deduction.percentage / 100);
    }

    // Apply annual limits if specified
    if (deduction.annual_limit && deduction.current_ytd !== undefined) {
      const remainingLimit = deduction.annual_limit - deduction.current_ytd;
      amount = Math.min(amount, Math.max(0, remainingLimit));
    }

    // Ensure we don't exceed available wages for pre-tax deductions
    if (deduction.is_pre_tax) {
      amount = Math.min(amount, availableWages);
    }

    const result: DeductionResult = {
      type: deduction.type,
      description,
      amount: this.roundToTwoDecimals(amount),
      is_pre_tax: deduction.is_pre_tax
    };

    // Calculate remaining annual limit if applicable
    if (deduction.annual_limit && deduction.current_ytd !== undefined) {
      result.remaining_annual_limit = Math.max(0, deduction.annual_limit - deduction.current_ytd - amount);
    }

    return result;
  }

  /**
   * Sort deductions by priority for calculation order
   */
  private static sortDeductionsByPriority(deductions: DeductionInput[]): DeductionInput[] {
    return [...deductions].sort((a, b) => {
      // Pre-tax deductions first
      if (a.is_pre_tax && !b.is_pre_tax) return -1;
      if (!a.is_pre_tax && b.is_pre_tax) return 1;

      // Within same tax category, sort by priority
      const priorities = this.getDeductionPriorities();
      const aPriority = priorities[a.type] || 999;
      const bPriority = priorities[b.type] || 999;

      return aPriority - bPriority;
    });
  }

  /**
   * Get deduction calculation priorities
   */
  private static getDeductionPriorities(): Record<string, number> {
    return {
      // Pre-tax deductions
      '401k': 1,
      '403b': 1,
      'hsa': 2,
      'fsa': 3,
      'health_insurance': 4,
      'dental_insurance': 5,
      'vision_insurance': 6,
      'life_insurance': 7,
      'disability_insurance': 8,
      'parking': 9,
      'transit': 10,

      // Post-tax deductions
      'garnishment': 1, // Highest priority for post-tax
      'child_support': 2,
      'union_dues': 3,
      'roth_401k': 4,
      'loan_repayment': 5,
      'charity': 6
    };
  }

  /**
   * Get human-readable description for deduction type
   */
  private static getDeductionDescription(type: string): string {
    const descriptions: Record<string, string> = {
      '401k': '401(k) Contribution',
      '403b': '403(b) Contribution',
      'roth_401k': 'Roth 401(k) Contribution',
      'hsa': 'Health Savings Account',
      'fsa': 'Flexible Spending Account',
      'health_insurance': 'Health Insurance Premium',
      'dental_insurance': 'Dental Insurance Premium',
      'vision_insurance': 'Vision Insurance Premium',
      'life_insurance': 'Life Insurance Premium',
      'disability_insurance': 'Disability Insurance Premium',
      'parking': 'Parking',
      'transit': 'Transit/Commuter',
      'garnishment': 'Wage Garnishment',
      'child_support': 'Child Support',
      'union_dues': 'Union Dues',
      'loan_repayment': 'Loan Repayment',
      'charity': 'Charitable Contribution'
    };

    return descriptions[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Calculate catch-up contributions for employees over 50
   */
  static calculateCatchUpContribution(
    deduction: DeductionInput,
    employeeAge: number,
    currentContribution: number
  ): number {
    if (employeeAge < 50) return 0;

    const catchUpLimits: Record<string, number> = {
      '401k': 7500,  // 2024 catch-up limit
      '403b': 7500,
      'hsa': 1000    // 2024 HSA catch-up limit
    };

    const catchUpLimit = catchUpLimits[deduction.type];
    if (!catchUpLimit) return 0;

    // Calculate available catch-up contribution
    const maxCatchUp = Math.min(catchUpLimit, currentContribution);
    return maxCatchUp;
  }

  /**
   * Handle deduction arrears (missed deductions from previous periods)
   */
  static calculateArrears(
    deduction: DeductionInput,
    missedAmount: number,
    currentPeriodAmount: number,
    availableWages: number
  ): { current: number; arrears: number; remaining: number } {
    const totalRequested = currentPeriodAmount + missedAmount;
    const totalAllowed = Math.min(totalRequested, availableWages);

    let current = Math.min(currentPeriodAmount, totalAllowed);
    let arrears = Math.min(missedAmount, totalAllowed - current);
    let remaining = missedAmount - arrears;

    return { current, arrears, remaining };
  }

  /**
   * Add two numbers with high precision
   */
  private static addPrecise(a: number, b: number): number {
    return Math.round((a + b) * Math.pow(10, this.DECIMAL_PRECISION)) / Math.pow(10, this.DECIMAL_PRECISION);
  }

  /**
   * Subtract two numbers with high precision
   */
  private static subtractPrecise(a: number, b: number): number {
    return Math.round((a - b) * Math.pow(10, this.DECIMAL_PRECISION)) / Math.pow(10, this.DECIMAL_PRECISION);
  }

  /**
   * Round final output to two decimal places
   */
  private static roundToTwoDecimals(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}
