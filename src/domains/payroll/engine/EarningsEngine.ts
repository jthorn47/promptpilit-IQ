import { EarningInput, EarningResult } from './types';
import { PayType } from '../types';
import { PayTypeEngine } from './PayTypeEngine';

export interface EarningsCalculationResult {
  totalGross: number;
  overtimeHours: number;
  regularRate: number;
  breakdown: EarningResult[];
}

export class EarningsEngine {
  /**
   * Calculate earnings based on pay types and hours worked
   */
  static calculateEarnings(
    earnings: EarningInput[],
    payTypes: Map<string, PayType>
  ): EarningsCalculationResult {
    let totalGross = 0;
    let overtimeHours = 0;
    let regularRate = 0;

    // Apply overtime rules to calculate regular and overtime hours
    const overtimeResult = this.applyOvertimeRules(earnings, payTypes);
    overtimeHours = overtimeResult.overtimeHours;
    regularRate = overtimeResult.regularRate;

    // Create earnings breakdown
    const breakdown = this.createEarningsBreakdown(earnings, payTypes);

    // Calculate total gross pay
    for (const earning of breakdown) {
      totalGross += earning.amount;
    }

    return {
      totalGross: Math.round(totalGross * 100) / 100,
      overtimeHours,
      regularRate,
      breakdown
    };
  }

  /**
   * Apply overtime rules based on pay type flags
   */
  private static applyOvertimeRules(
    earnings: EarningInput[],
    payTypes: Map<string, PayType>
  ): { regularHours: number; overtimeHours: number; regularRate: number } {
    let totalHours = 0;
    let totalWages = 0;
    let regularRateHours = 0;

    // Calculate totals for overtime eligibility
    for (const earning of earnings) {
      const payType = payTypes.get(earning.type);
      if (!payType) continue;

      const hours = earning.hours || 0;
      const rate = earning.rate || payType.rate || 0;
      const amount = hours * rate;

      // Check if this pay type counts toward overtime hours
      if (PayTypeEngine.shouldIncludeInCalculation(payType, 'overtime_hours')) {
        totalHours += hours;
      }

      // Check if this pay type is includable in regular rate calculation
      if (PayTypeEngine.shouldIncludeInCalculation(payType, 'regular_rate')) {
        totalWages += amount;
        regularRateHours += hours;
      }
    }

    const regularRate = regularRateHours > 0 ? totalWages / regularRateHours : 0;
    const regularHours = Math.min(totalHours, 40);
    const overtimeHours = Math.max(totalHours - 40, 0);

    return { regularHours, overtimeHours, regularRate };
  }

  /**
   * Create standardized earnings breakdown
   */
  private static createEarningsBreakdown(
    earnings: EarningInput[],
    payTypes: Map<string, PayType>
  ): EarningResult[] {
    const breakdown: EarningResult[] = [];

    for (const earning of earnings) {
      const payType = payTypes.get(earning.type);
      let amount = 0;

      if (earning.hours && earning.rate) {
        amount = earning.hours * earning.rate * (earning.multiplier || 1);
      } else if (earning.amount) {
        amount = earning.amount;
      }

      breakdown.push({
        type: earning.type,
        description: payType?.name || earning.type,
        hours: earning.hours,
        rate: earning.rate,
        amount: Math.round(amount * 100) / 100
      });
    }

    return breakdown;
  }

  // Additional methods can be added here for advanced calculations
}
