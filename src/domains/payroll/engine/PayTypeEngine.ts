
import { PayType } from '../types';

export class PayTypeEngine {
  /**
   * Validate pay type flag combinations for legal compliance
   */
  static validatePayTypeFlags(payType: PayType): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Independent contractor validation
    if (payType.independent_contractor_1099) {
      if (payType.is_taxable_fica || payType.is_taxable_medicare) {
        errors.push('Independent contractors should not be subject to FICA/Medicare taxes');
      }
      if (payType.reportable_on_w2) {
        errors.push('Independent contractors receive 1099, not W-2');
      }
    }

    // Tipped employee validation
    if (payType.used_to_pay_tipped_employees && payType.tip_status === 'none') {
      errors.push('Tip status is required when "Used to pay Tipped Employees" is enabled');
    }

    // Overtime calculation validation
    if (payType.include_in_overtime_calculation && !payType.add_hours_into_total_hours_worked) {
      errors.push('Pay types included in overtime calculation should also add hours to total');
    }

    // Gross pay validation
    if (!payType.include_wage_in_true_gross_pay && payType.is_taxable_federal) {
      errors.push('Wages subject to federal tax should be included in gross pay');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Determine if pay type should be included in specific calculations
   */
  static shouldIncludeInCalculation(payType: PayType, calculationType: string): boolean {
    switch (calculationType) {
      case 'overtime_hours':
        return payType.add_hours_into_total_hours_worked ?? false;
      
      case 'overtime_rate':
        return payType.include_in_overtime_calculation ?? false;
      
      case 'gross_pay':
        return payType.include_wage_in_true_gross_pay ?? true;
      
      case 'federal_tax':
        return payType.is_taxable_federal ?? true;
      
      case 'state_tax':
        return payType.is_taxable_state ?? true;
      
      case 'fica_ss':
        return payType.is_taxable_fica ?? true;
      
      case 'medicare':
        return payType.is_taxable_medicare ?? true;
      
      case '401k_base':
        return payType.include_in_401k_calculation ?? true;
      
      case 'workers_comp':
        return payType.worker_compensation ?? true;
      
      case 'regular_rate':
        return payType.includable_in_regular_rate ?? true;
      
      case 'net_increase':
        return payType.increase_net_paycheck ?? false;
      
      default:
        return true;
    }
  }

  /**
   * Get special tax treatment for pay type
   */
  static getTaxTreatment(payType: PayType): {
    isContractor: boolean;
    taxableWages: boolean;
    w2Reportable: boolean;
    specialHandling?: string;
  } {
    return {
      isContractor: payType.independent_contractor_1099 ?? false,
      taxableWages: payType.include_wage_in_true_gross_pay ?? true,
      w2Reportable: payType.reportable_on_w2 ?? true,
      specialHandling: payType.special_w2_handling_code
    };
  }

  /**
   * Calculate tip credit adjustments for tipped employees
   */
  static calculateTipCredit(payType: PayType, hours: number, minimumWage: number): {
    tipCreditRate: number;
    adjustedWage: number;
    tipCreditAmount: number;
  } {
    if (!payType.used_to_pay_tipped_employees) {
      return {
        tipCreditRate: 0,
        adjustedWage: payType.rate || 0,
        tipCreditAmount: 0
      };
    }

    // Federal tip credit is $5.12 per hour (as of 2024)
    const maxTipCredit = 5.12;
    const tippedMinimumWage = 2.13; // Federal tipped minimum wage
    
    const basePay = (payType.rate || 0) * hours;
    const minimumRequired = minimumWage * hours;
    const tipCreditAmount = Math.min(maxTipCredit * hours, minimumRequired - basePay);

    return {
      tipCreditRate: maxTipCredit,
      adjustedWage: Math.max(payType.rate || 0, tippedMinimumWage),
      tipCreditAmount: Math.max(0, tipCreditAmount)
    };
  }

  /**
   * Determine overtime eligibility based on pay type flags
   */
  static isOvertimeEligible(payType: PayType): boolean {
    // Independent contractors are not eligible for overtime
    if (payType.independent_contractor_1099) {
      return false;
    }

    // Check if this pay type is subject to overtime rules
    return payType.subject_to_overtime ?? true;
  }

  /**
   * Calculate regular rate for overtime calculations
   */
  static calculateRegularRate(earnings: Array<{ payType: PayType; hours: number; amount: number }>): number {
    let totalWages = 0;
    let totalHours = 0;

    for (const earning of earnings) {
      if (this.shouldIncludeInCalculation(earning.payType, 'regular_rate')) {
        totalWages += earning.amount;
      }
      
      if (this.shouldIncludeInCalculation(earning.payType, 'overtime_hours')) {
        totalHours += earning.hours;
      }
    }

    return totalHours > 0 ? totalWages / totalHours : 0;
  }
}
