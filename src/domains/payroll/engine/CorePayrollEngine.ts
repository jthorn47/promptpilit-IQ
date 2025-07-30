
import { EarningsEngine } from './EarningsEngine';
import { DeductionsEngine } from './DeductionsEngine';
import { TaxEngine } from './TaxEngine';
import { PayrollCalculationInput, PayrollCalculationOutput, CalculationContext } from './types';

export class CorePayrollEngine {
  private static version = '2.0.0';

  /**
   * Main payroll calculation method
   */
  static async calculatePayroll(
    input: PayrollCalculationInput,
    context: CalculationContext
  ): Promise<PayrollCalculationOutput> {
    try {
      console.log('🏭 Starting Core Payroll Engine calculation:', {
        employee: input.employee_id,
        period: `${input.pay_period_start} to ${input.pay_period_end}`,
        version: this.version
      });

      // Step 1: Calculate earnings
      const earningsResult = EarningsEngine.calculateEarnings(
        input.earnings,
        new Map() // Empty pay types map for now
      );

      // Step 2: Calculate deductions
      const deductionsResult = DeductionsEngine.calculateDeductions(
        input.deductions,
        earningsResult.totalGross,
        []
      );

      // Step 3: Calculate taxes
      const taxResult = TaxEngine.calculateTaxes({
        grossWages: earningsResult.totalGross,
        preTaxDeductions: deductionsResult.preTaxTotal,
        payTypeBreakdown: [],
        filingStatus: input.tax_profile.filing_status,
        allowances: input.tax_profile.allowances,
        state: input.tax_profile.state,
        additionalWithholding: input.tax_profile.additional_withholding || 0
      });

      // Step 4: Calculate net pay
      const netPay = earningsResult.totalGross - 
                   deductionsResult.preTaxTotal - 
                   taxResult.totalTaxes - 
                   deductionsResult.postTaxTotal;

      // Build calculation output
      const result: PayrollCalculationOutput = {
        gross_pay: earningsResult.totalGross,
        pre_tax_deductions: deductionsResult.preTaxTotal,
        taxes_withheld: {
          federal: taxResult.federalIncomeTax,
          state: taxResult.stateIncomeTax,
          fica: taxResult.socialSecurityTax,
          medicare: taxResult.medicareTax,
          sdi: taxResult.stateDisabilityTax
        },
        post_tax_deductions: deductionsResult.postTaxTotal,
        net_pay: Math.round(netPay * 100) / 100,
        employer_taxes: {
          fica: taxResult.socialSecurityTax, // Employer matches employee FICA
          medicare: taxResult.medicareTax,   // Employer matches employee Medicare
          futa: Math.round(earningsResult.totalGross * 0.006 * 100) / 100, // 0.6% FUTA
          suta: Math.round(earningsResult.totalGross * 0.027 * 100) / 100  // 2.7% average SUTA
        },
        calculation_details: {
          engine_version: this.version,
          calculation_date: new Date().toISOString(),
          tax_table_version: '2024.1',
          earnings_breakdown: earningsResult.breakdown,
          deductions_breakdown: deductionsResult.breakdown,
          tax_calculations: [
            {
              type: 'federal_income_tax',
              taxable_wages: earningsResult.totalGross - deductionsResult.preTaxTotal,
              amount: taxResult.federalIncomeTax,
              jurisdiction: 'federal'
            },
            {
              type: 'state_income_tax',
              taxable_wages: earningsResult.totalGross - deductionsResult.preTaxTotal,
              amount: taxResult.stateIncomeTax,
              jurisdiction: input.tax_profile.state
            },
            {
              type: 'fica_ss',
              taxable_wages: earningsResult.totalGross,
              rate: 0.062,
              amount: taxResult.socialSecurityTax,
              jurisdiction: 'federal'
            },
            {
              type: 'fica_medicare',
              taxable_wages: earningsResult.totalGross,
              rate: 0.0145,
              amount: taxResult.medicareTax,
              jurisdiction: 'federal'
            }
          ]
        },
        metadata: {
          engine_source: 'core_payroll_engine',
          is_simulation: input.simulation || false,
          calculation_source: 'lovable_payroll_system'
        }
      };

      console.log('✅ Payroll calculation completed:', {
        gross: result.gross_pay,
        taxes: result.taxes_withheld.federal + result.taxes_withheld.state + result.taxes_withheld.fica + result.taxes_withheld.medicare,
        net: result.net_pay
      });

      return result;

    } catch (error) {
      console.error('❌ Core Payroll Engine calculation failed:', error);
      throw new Error(`Payroll calculation failed: ${error.message}`);
    }
  }

  /**
   * Generate calculation report for debugging
   */
  static generateCalculationReport(
    input: PayrollCalculationInput,
    output: PayrollCalculationOutput
  ): string {
    const report = [];
    
    report.push('=== CORE PAYROLL ENGINE CALCULATION REPORT ===\n');
    report.push(`Engine Version: ${this.version}`);
    report.push(`Employee ID: ${input.employee_id}`);
    report.push(`Pay Period: ${input.pay_period_start} to ${input.pay_period_end}`);
    report.push(`Calculation Date: ${output.calculation_details.calculation_date}\n`);
    
    report.push('EARNINGS:');
    for (const earning of output.calculation_details.earnings_breakdown) {
      report.push(`  ${earning.description}: $${earning.amount}`);
    }
    
    report.push(`\nGross Pay: $${output.gross_pay}`);
    report.push(`Pre-tax Deductions: $${output.pre_tax_deductions}`);
    report.push(`Federal Tax: $${output.taxes_withheld.federal}`);
    report.push(`State Tax: $${output.taxes_withheld.state}`);
    report.push(`FICA: $${output.taxes_withheld.fica}`);
    report.push(`Medicare: $${output.taxes_withheld.medicare}`);
    report.push(`Post-tax Deductions: $${output.post_tax_deductions}`);
    report.push(`Net Pay: $${output.net_pay}`);
    
    return report.join('\n');
  }
}
