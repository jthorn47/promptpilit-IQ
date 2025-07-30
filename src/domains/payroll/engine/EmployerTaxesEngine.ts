import { EmployerTaxes } from './types';

export class EmployerTaxesEngine {
  private static readonly DECIMAL_PRECISION = 4;

  /**
   * Calculate employer-side taxes
   */
  static calculateEmployerTaxes(
    grossWages: number,
    state: string,
    employeeYTDWages: number = 0
  ): EmployerTaxes {
    const fica = this.calculateEmployerFICA(grossWages, employeeYTDWages);
    const medicare = this.calculateEmployerMedicare(grossWages);
    const futa = this.calculateFUTA(grossWages, employeeYTDWages);
    const suta = this.calculateSUTA(grossWages, state, employeeYTDWages);

    return {
      fica: this.roundToTwoDecimals(fica),
      medicare: this.roundToTwoDecimals(medicare),
      futa: this.roundToTwoDecimals(futa),
      suta: this.roundToTwoDecimals(suta),
      state_unemployment: this.roundToTwoDecimals(suta) // Alias for SUTA
    };
  }

  /**
   * Calculate employer FICA (Social Security) - 6.2%
   */
  private static calculateEmployerFICA(grossWages: number, ytdWages: number): number {
    const socialSecurityWageBase = 160200; // 2024 wage base
    const ficaRate = 0.062;

    // Calculate taxable wages for this period
    const totalWagesAfterPayment = ytdWages + grossWages;
    const taxableWages = Math.min(totalWagesAfterPayment, socialSecurityWageBase) - 
                        Math.min(ytdWages, socialSecurityWageBase);

    return Math.max(0, taxableWages * ficaRate);
  }

  /**
   * Calculate employer Medicare - 1.45%
   */
  private static calculateEmployerMedicare(grossWages: number): number {
    const medicareRate = 0.0145;
    return grossWages * medicareRate;
  }

  /**
   * Calculate Federal Unemployment Tax (FUTA) - 6.0% on first $7,000
   */
  private static calculateFUTA(grossWages: number, ytdWages: number): number {
    const futaWageBase = 7000; // 2024 FUTA wage base
    const futaRate = 0.006; // Assuming 5.4% state credit, net rate is 0.6%

    // Calculate taxable wages for this period
    const totalWagesAfterPayment = ytdWages + grossWages;
    const taxableWages = Math.min(totalWagesAfterPayment, futaWageBase) - 
                        Math.min(ytdWages, futaWageBase);

    return Math.max(0, taxableWages * futaRate);
  }

  /**
   * Calculate State Unemployment Tax (SUTA)
   */
  private static calculateSUTA(grossWages: number, state: string, ytdWages: number): number {
    const sutaConfig = this.getSUTAConfiguration(state);
    const { wageBase, rate } = sutaConfig;

    // Calculate taxable wages for this period
    const totalWagesAfterPayment = ytdWages + grossWages;
    const taxableWages = Math.min(totalWagesAfterPayment, wageBase) - 
                        Math.min(ytdWages, wageBase);

    return Math.max(0, taxableWages * rate);
  }

  /**
   * Get SUTA configuration by state
   */
  private static getSUTAConfiguration(state: string): { wageBase: number; rate: number } {
    // 2024 SUTA wage bases and rates by state (sample data)
    const sutaRates: Record<string, { wageBase: number; rate: number }> = {
      'AL': { wageBase: 8000, rate: 0.027 },
      'AK': { wageBase: 47100, rate: 0.024 },
      'AZ': { wageBase: 8000, rate: 0.024 },
      'AR': { wageBase: 7000, rate: 0.034 },
      'CA': { wageBase: 7000, rate: 0.034 },
      'CO': { wageBase: 17000, rate: 0.017 },
      'CT': { wageBase: 15000, rate: 0.033 },
      'DE': { wageBase: 20500, rate: 0.025 },
      'FL': { wageBase: 7000, rate: 0.027 },
      'GA': { wageBase: 9500, rate: 0.025 },
      'HI': { wageBase: 51600, rate: 0.020 },
      'ID': { wageBase: 48000, rate: 0.015 },
      'IL': { wageBase: 13590, rate: 0.025 },
      'IN': { wageBase: 9500, rate: 0.025 },
      'IA': { wageBase: 36300, rate: 0.025 },
      'KS': { wageBase: 14000, rate: 0.027 },
      'KY': { wageBase: 11100, rate: 0.027 },
      'LA': { wageBase: 7700, rate: 0.027 },
      'ME': { wageBase: 12000, rate: 0.025 },
      'MD': { wageBase: 8500, rate: 0.025 },
      'MA': { wageBase: 15000, rate: 0.025 },
      'MI': { wageBase: 9500, rate: 0.025 },
      'MN': { wageBase: 38000, rate: 0.025 },
      'MS': { wageBase: 14000, rate: 0.025 },
      'MO': { wageBase: 13000, rate: 0.025 },
      'MT': { wageBase: 37500, rate: 0.025 },
      'NE': { wageBase: 10500, rate: 0.025 },
      'NV': { wageBase: 37400, rate: 0.025 },
      'NH': { wageBase: 14000, rate: 0.025 },
      'NJ': { wageBase: 39800, rate: 0.025 },
      'NM': { wageBase: 27300, rate: 0.025 },
      'NY': { wageBase: 12300, rate: 0.025 },
      'NC': { wageBase: 26000, rate: 0.025 },
      'ND': { wageBase: 40500, rate: 0.025 },
      'OH': { wageBase: 9000, rate: 0.025 },
      'OK': { wageBase: 25200, rate: 0.025 },
      'OR': { wageBase: 50400, rate: 0.025 },
      'PA': { wageBase: 10500, rate: 0.025 },
      'RI': { wageBase: 25200, rate: 0.025 },
      'SC': { wageBase: 14000, rate: 0.025 },
      'SD': { wageBase: 17000, rate: 0.025 },
      'TN': { wageBase: 7000, rate: 0.025 },
      'TX': { wageBase: 9000, rate: 0.025 },
      'UT': { wageBase: 44400, rate: 0.025 },
      'VT': { wageBase: 13500, rate: 0.025 },
      'VA': { wageBase: 8000, rate: 0.025 },
      'WA': { wageBase: 67600, rate: 0.025 },
      'WV': { wageBase: 9000, rate: 0.025 },
      'WI': { wageBase: 14000, rate: 0.025 },
      'WY': { wageBase: 27300, rate: 0.025 }
    };

    return sutaRates[state] || { wageBase: 7000, rate: 0.025 }; // Default values
  }

  /**
   * Calculate total employer tax liability
   */
  static calculateTotalEmployerTaxes(employerTaxes: EmployerTaxes): number {
    return this.roundToTwoDecimals(
      employerTaxes.fica + 
      employerTaxes.medicare + 
      employerTaxes.futa + 
      employerTaxes.suta
    );
  }

  /**
   * Calculate quarterly employer tax summary
   */
  static calculateQuarterlyTaxes(
    payrollRecords: Array<{
      grossWages: number;
      employerTaxes: EmployerTaxes;
      payDate: Date;
    }>,
    quarter: number,
    year: number
  ): {
    totalWages: number;
    totalFICA: number;
    totalMedicare: number;
    totalFUTA: number;
    totalSUTA: number;
    filingDeadline: Date;
  } {
    const quarterStart = new Date(year, (quarter - 1) * 3, 1);
    const quarterEnd = new Date(year, quarter * 3, 0);

    const quarterlyRecords = payrollRecords.filter(record => 
      record.payDate >= quarterStart && record.payDate <= quarterEnd
    );

    const totals = quarterlyRecords.reduce((acc, record) => ({
      wages: acc.wages + record.grossWages,
      fica: acc.fica + record.employerTaxes.fica,
      medicare: acc.medicare + record.employerTaxes.medicare,
      futa: acc.futa + record.employerTaxes.futa,
      suta: acc.suta + record.employerTaxes.suta
    }), { wages: 0, fica: 0, medicare: 0, futa: 0, suta: 0 });

    // Calculate filing deadline (last day of month following quarter end)
    const filingDeadline = new Date(quarterEnd.getFullYear(), quarterEnd.getMonth() + 2, 0);

    return {
      totalWages: this.roundToTwoDecimals(totals.wages),
      totalFICA: this.roundToTwoDecimals(totals.fica),
      totalMedicare: this.roundToTwoDecimals(totals.medicare),
      totalFUTA: this.roundToTwoDecimals(totals.futa),
      totalSUTA: this.roundToTwoDecimals(totals.suta),
      filingDeadline
    };
  }

  /**
   * Check if wages exceed Social Security cap
   */
  static hasExceededSocialSecurityCap(ytdWages: number): boolean {
    return ytdWages >= 160200; // 2024 Social Security wage base
  }

  /**
   * Check if wages exceed FUTA cap
   */
  static hasExceededFUTACap(ytdWages: number): boolean {
    return ytdWages >= 7000; // FUTA wage base
  }

  /**
   * Round final output to two decimal places
   */
  private static roundToTwoDecimals(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}