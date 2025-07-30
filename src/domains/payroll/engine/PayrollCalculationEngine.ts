
import { EarningsEngine } from './EarningsEngine';
import { DeductionsEngine } from './DeductionsEngine';
import { TaxEngine, TaxCalculationInput } from './TaxEngine';
import { PayTypeEngine } from './PayTypeEngine';
import { EarningInput, DeductionInput } from './types';
import { PayType } from '../types';

export interface PayrollCalculationInput {
  earnings: EarningInput[];
  deductions: DeductionInput[];
  payTypes: Map<string, PayType>;
  employeeInfo: {
    filingStatus: string;
    allowances: number;
    additionalWithholding: number;
    state: string;
    ytdWages?: number;
    ytdTaxes?: number;
  };
}

export interface PayrollCalculationResult {
  grossPay: number;
  taxableGrossPay: number;
  preTaxDeductions: number;
  postTaxDeductions: number;
  taxes: {
    federalIncomeTax: number;
    stateIncomeTax: number;
    socialSecurityTax: number;
    medicareTax: number;
    additionalMedicareTax: number;
    stateDisabilityTax: number;
    totalTaxes: number;
  };
  netPay: number;
  overtimeHours: number;
  regularRate: number;
  earningsBreakdown: any[];
  deductionsBreakdown: any[];
  validationErrors: string[];
}

export class PayrollCalculationEngine {
  /**
   * Calculate complete payroll with pay type flag support
   */
  static calculatePayroll(input: PayrollCalculationInput): PayrollCalculationResult {
    const validationErrors: string[] = [];

    // Validate all pay types
    for (const [payTypeCode, payType] of input.payTypes) {
      const validation = PayTypeEngine.validatePayTypeFlags(payType);
      if (!validation.valid) {
        validationErrors.push(`Pay type ${payTypeCode}: ${validation.errors.join(', ')}`);
      }
    }

    // Calculate earnings with pay type support
    const earningsResult = EarningsEngine.calculateEarnings(input.earnings, input.payTypes);

    // Create pay type breakdown for tax calculations
    const payTypeBreakdown = this.createPayTypeBreakdown(input.earnings, input.payTypes);

    // Calculate deductions with pay type support
    const deductionsResult = DeductionsEngine.calculateDeductions(
      input.deductions,
      earningsResult.totalGross,
      payTypeBreakdown
    );

    // Calculate taxes using pay type flags
    const taxInput: TaxCalculationInput = {
      grossWages: earningsResult.totalGross,
      preTaxDeductions: deductionsResult.preTaxTotal,
      payTypeBreakdown,
      filingStatus: input.employeeInfo.filingStatus,
      allowances: input.employeeInfo.allowances,
      additionalWithholding: input.employeeInfo.additionalWithholding,
      state: input.employeeInfo.state,
      ytdWages: input.employeeInfo.ytdWages,
      ytdTaxes: input.employeeInfo.ytdTaxes
    };

    const taxResult = TaxEngine.calculateTaxes(taxInput);

    // Calculate net pay increases (post-tax additions)
    const netPayIncreases = this.calculateNetPayIncreases(payTypeBreakdown);

    // Calculate final net pay
    const netPay = earningsResult.totalGross - 
                  deductionsResult.preTaxTotal - 
                  taxResult.totalTaxes - 
                  deductionsResult.postTaxTotal +
                  netPayIncreases;

    return {
      grossPay: earningsResult.totalGross,
      taxableGrossPay: deductionsResult.adjustedGrossPay,
      preTaxDeductions: deductionsResult.preTaxTotal,
      postTaxDeductions: deductionsResult.postTaxTotal,
      taxes: {
        federalIncomeTax: taxResult.federalIncomeTax,
        stateIncomeTax: taxResult.stateIncomeTax,
        socialSecurityTax: taxResult.socialSecurityTax,
        medicareTax: taxResult.medicareTax,
        additionalMedicareTax: taxResult.additionalMedicareTax,
        stateDisabilityTax: taxResult.stateDisabilityTax,
        totalTaxes: taxResult.totalTaxes
      },
      netPay: Math.round(netPay * 100) / 100,
      overtimeHours: earningsResult.overtimeHours,
      regularRate: earningsResult.regularRate,
      earningsBreakdown: earningsResult.breakdown,
      deductionsBreakdown: deductionsResult.breakdown,
      validationErrors
    };
  }

  /**
   * Create pay type breakdown from earnings
   */
  private static createPayTypeBreakdown(
    earnings: EarningInput[],
    payTypes: Map<string, PayType>
  ): Array<{ payType: PayType; amount: number }> {
    const breakdown: Array<{ payType: PayType; amount: number }> = [];

    for (const earning of earnings) {
      const payType = payTypes.get(earning.type);
      if (payType) {
        let amount = 0;
        
        if (earning.hours && earning.rate) {
          amount = earning.hours * earning.rate * (earning.multiplier || 1);
        } else if (earning.amount) {
          amount = earning.amount;
        }

        breakdown.push({ payType, amount });
      }
    }

    return breakdown;
  }

  /**
   * Calculate net pay increases from pay types with the increase_net_paycheck flag
   */
  private static calculateNetPayIncreases(
    payTypeBreakdown: Array<{ payType: PayType; amount: number }>
  ): number {
    let netIncreases = 0;

    for (const { payType, amount } of payTypeBreakdown) {
      if (payType.increase_net_paycheck) {
        netIncreases += amount;
      }
    }

    return netIncreases;
  }

  /**
   * Generate detailed calculation report
   */
  static generateCalculationReport(
    input: PayrollCalculationInput,
    result: PayrollCalculationResult
  ): string {
    const report = [];
    
    report.push('=== PAYROLL CALCULATION REPORT ===\n');
    
    // Pay Type Summary
    report.push('PAY TYPE CONFIGURATIONS:');
    for (const [code, payType] of input.payTypes) {
      const flags = [];
      if (payType.used_to_pay_tipped_employees) flags.push('Tipped');
      if (payType.include_in_overtime_calculation) flags.push('OT Eligible');
      if (payType.independent_contractor_1099) flags.push('1099');
      if (payType.increase_net_paycheck) flags.push('Net Increase');
      
      report.push(`  ${code}: ${payType.name} [${flags.join(', ')}]`);
    }
    
    report.push('\nEARNINGS BREAKDOWN:');
    for (const earning of result.earningsBreakdown) {
      report.push(`  ${earning.description}: $${earning.amount}`);
    }
    
    report.push(`\nGross Pay: $${result.grossPay}`);
    report.push(`Taxable Gross: $${result.taxableGrossPay}`);
    report.push(`Pre-tax Deductions: $${result.preTaxDeductions}`);
    report.push(`Taxes: $${result.taxes.totalTaxes}`);
    report.push(`Post-tax Deductions: $${result.postTaxDeductions}`);
    report.push(`Net Pay: $${result.netPay}`);
    
    if (result.validationErrors.length > 0) {
      report.push('\nVALIDATION ERRORS:');
      for (const error of result.validationErrors) {
        report.push(`  ⚠️ ${error}`);
      }
    }
    
    return report.join('\n');
  }
}
