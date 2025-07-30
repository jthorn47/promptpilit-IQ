import { TaxesWithheld } from './types';

export interface NetPayCalculation {
  gross_pay: number;
  pre_tax_deductions: number;
  taxable_wages: number;
  taxes_withheld: TaxesWithheld;
  post_tax_deductions: number;
  net_pay: number;
  deposit_allocations?: DepositAllocation[];
}

export interface DepositAllocation {
  account_type: 'checking' | 'savings';
  routing_number: string;
  account_number: string;
  allocation_type: 'amount' | 'percentage' | 'remainder';
  allocation_value: number;
  calculated_amount: number;
}

export interface RetroactiveAdjustment {
  type: 'correction' | 'bonus' | 'deduction_change' | 'rate_change';
  description: string;
  gross_adjustment: number;
  tax_adjustment: number;
  net_adjustment: number;
  effective_date: string;
}

export class NetPayEngine {
  private static readonly DECIMAL_PRECISION = 4;

  /**
   * Calculate final net pay from gross to net
   */
  static calculateNetPay(
    grossPay: number,
    preTaxDeductions: number,
    taxesWithheld: TaxesWithheld,
    postTaxDeductions: number
  ): NetPayCalculation {
    // Calculate taxable wages (gross pay minus pre-tax deductions)
    const taxableWages = this.subtractPrecise(grossPay, preTaxDeductions);

    // Calculate total taxes
    const totalTaxes = this.calculateTotalTaxes(taxesWithheld);

    // Calculate net pay
    const afterTaxAmount = this.subtractPrecise(taxableWages, totalTaxes);
    const netPay = this.subtractPrecise(afterTaxAmount, postTaxDeductions);

    return {
      gross_pay: this.roundToTwoDecimals(grossPay),
      pre_tax_deductions: this.roundToTwoDecimals(preTaxDeductions),
      taxable_wages: this.roundToTwoDecimals(taxableWages),
      taxes_withheld: this.roundTaxesWithheld(taxesWithheld),
      post_tax_deductions: this.roundToTwoDecimals(postTaxDeductions),
      net_pay: this.roundToTwoDecimals(Math.max(0, netPay)) // Ensure non-negative
    };
  }

  /**
   * Process split deposit allocations
   */
  static allocateDeposits(
    netPay: number,
    depositInstructions: DepositAllocation[]
  ): DepositAllocation[] {
    const allocations: DepositAllocation[] = [];
    let remainingAmount = netPay;
    let remainderAccount: DepositAllocation | null = null;

    // Sort allocations: amounts first, then percentages, remainder last
    const sortedInstructions = [...depositInstructions].sort((a, b) => {
      const order = { amount: 1, percentage: 2, remainder: 3 };
      return order[a.allocation_type] - order[b.allocation_type];
    });

    for (const instruction of sortedInstructions) {
      if (instruction.allocation_type === 'remainder') {
        remainderAccount = instruction;
        continue;
      }

      let allocationAmount = 0;

      if (instruction.allocation_type === 'amount') {
        allocationAmount = Math.min(instruction.allocation_value, remainingAmount);
      } else if (instruction.allocation_type === 'percentage') {
        allocationAmount = Math.min(
          netPay * (instruction.allocation_value / 100),
          remainingAmount
        );
      }

      if (allocationAmount > 0) {
        allocations.push({
          ...instruction,
          calculated_amount: this.roundToTwoDecimals(allocationAmount)
        });
        remainingAmount = this.subtractPrecise(remainingAmount, allocationAmount);
      }
    }

    // Allocate remainder to the designated remainder account
    if (remainderAccount && remainingAmount > 0) {
      allocations.push({
        ...remainderAccount,
        calculated_amount: this.roundToTwoDecimals(remainingAmount)
      });
    }

    return allocations;
  }

  /**
   * Process retroactive adjustments
   */
  static processRetroactiveAdjustment(
    currentNetPay: NetPayCalculation,
    adjustment: RetroactiveAdjustment
  ): NetPayCalculation {
    const adjustedGrossPay = this.addPrecise(
      currentNetPay.gross_pay,
      adjustment.gross_adjustment
    );

    // Recalculate taxes on the adjustment amount
    const taxAdjustment = adjustment.tax_adjustment;
    const adjustedTaxes: TaxesWithheld = {
      federal: this.addPrecise(currentNetPay.taxes_withheld.federal, taxAdjustment * 0.4),
      state: this.addPrecise(currentNetPay.taxes_withheld.state, taxAdjustment * 0.2),
      fica: this.addPrecise(currentNetPay.taxes_withheld.fica, taxAdjustment * 0.25),
      medicare: this.addPrecise(currentNetPay.taxes_withheld.medicare, taxAdjustment * 0.15),
      local: currentNetPay.taxes_withheld.local || 0,
      sdi: currentNetPay.taxes_withheld.sdi || 0
    };

    const adjustedNetPay = this.addPrecise(currentNetPay.net_pay, adjustment.net_adjustment);

    return {
      gross_pay: this.roundToTwoDecimals(adjustedGrossPay),
      pre_tax_deductions: currentNetPay.pre_tax_deductions,
      taxable_wages: this.roundToTwoDecimals(
        this.subtractPrecise(adjustedGrossPay, currentNetPay.pre_tax_deductions)
      ),
      taxes_withheld: this.roundTaxesWithheld(adjustedTaxes),
      post_tax_deductions: currentNetPay.post_tax_deductions,
      net_pay: this.roundToTwoDecimals(adjustedNetPay)
    };
  }

  /**
   * Handle off-cycle corrections (bonus runs, corrections, etc.)
   */
  static processOffCycleCorrection(
    regularPayCalculation: NetPayCalculation,
    correctionAmount: number,
    correctionType: 'bonus' | 'correction' | 'supplemental'
  ): NetPayCalculation {
    // For supplemental wages, use flat tax rate
    const supplementalTaxRate = correctionType === 'bonus' ? 0.22 : 0.25;
    
    const correctionTaxes = correctionAmount * supplementalTaxRate;
    const correctionNetPay = this.subtractPrecise(correctionAmount, correctionTaxes);

    const combinedGross = this.addPrecise(regularPayCalculation.gross_pay, correctionAmount);
    const combinedTaxes: TaxesWithheld = {
      federal: this.addPrecise(
        regularPayCalculation.taxes_withheld.federal,
        correctionTaxes * 0.8
      ),
      state: this.addPrecise(
        regularPayCalculation.taxes_withheld.state,
        correctionTaxes * 0.1
      ),
      fica: this.addPrecise(
        regularPayCalculation.taxes_withheld.fica,
        correctionAmount * 0.062
      ),
      medicare: this.addPrecise(
        regularPayCalculation.taxes_withheld.medicare,
        correctionAmount * 0.0145
      ),
      local: regularPayCalculation.taxes_withheld.local || 0,
      sdi: regularPayCalculation.taxes_withheld.sdi || 0
    };

    const combinedNetPay = this.addPrecise(regularPayCalculation.net_pay, correctionNetPay);

    return {
      gross_pay: this.roundToTwoDecimals(combinedGross),
      pre_tax_deductions: regularPayCalculation.pre_tax_deductions,
      taxable_wages: this.roundToTwoDecimals(
        this.subtractPrecise(combinedGross, regularPayCalculation.pre_tax_deductions)
      ),
      taxes_withheld: this.roundTaxesWithheld(combinedTaxes),
      post_tax_deductions: regularPayCalculation.post_tax_deductions,
      net_pay: this.roundToTwoDecimals(combinedNetPay)
    };
  }

  /**
   * Validate net pay calculation
   */
  static validateCalculation(calculation: NetPayCalculation): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check if gross pay equals the sum of all components
    const totalTaxes = this.calculateTotalTaxes(calculation.taxes_withheld);
    const expectedNetPay = calculation.gross_pay - 
                          calculation.pre_tax_deductions - 
                          totalTaxes - 
                          calculation.post_tax_deductions;

    const difference = Math.abs(expectedNetPay - calculation.net_pay);
    if (difference > 0.02) { // Allow 2 cent rounding difference
      errors.push(`Net pay calculation mismatch: Expected ${expectedNetPay.toFixed(2)}, got ${calculation.net_pay.toFixed(2)}`);
    }

    // Check for negative values
    if (calculation.net_pay < 0) {
      errors.push('Net pay cannot be negative');
    }

    if (calculation.taxable_wages < 0) {
      errors.push('Taxable wages cannot be negative');
    }

    // Check if deductions exceed gross pay
    if (calculation.pre_tax_deductions > calculation.gross_pay) {
      errors.push('Pre-tax deductions cannot exceed gross pay');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate total taxes from breakdown
   */
  private static calculateTotalTaxes(taxes: TaxesWithheld): number {
    return this.addPrecise(
      this.addPrecise(
        this.addPrecise(taxes.federal, taxes.state),
        this.addPrecise(taxes.fica, taxes.medicare)
      ),
      this.addPrecise(taxes.local || 0, taxes.sdi || 0)
    );
  }

  /**
   * Round taxes withheld object
   */
  private static roundTaxesWithheld(taxes: TaxesWithheld): TaxesWithheld {
    return {
      federal: this.roundToTwoDecimals(taxes.federal),
      state: this.roundToTwoDecimals(taxes.state),
      fica: this.roundToTwoDecimals(taxes.fica),
      medicare: this.roundToTwoDecimals(taxes.medicare),
      local: taxes.local ? this.roundToTwoDecimals(taxes.local) : undefined,
      sdi: taxes.sdi ? this.roundToTwoDecimals(taxes.sdi) : undefined
    };
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