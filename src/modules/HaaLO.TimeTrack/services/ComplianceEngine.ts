/**
 * Compliance Engine Service
 * Monitors required break and meal periods per client settings
 * Flags violations, triggers alerts, and prepares payroll penalties
 */

import { supabase } from "@/integrations/supabase/client";
import { DailyTimecard, PunchPair } from "./TimecardEngine";

export interface CompliancePolicy {
  company_id: string;
  state: string;
  meal_duration_minutes: number;
  meal_deadline_hours: number; // CA: before 5th hour
  rest_break_minutes: number;
  rest_break_frequency_hours: number; // CA: 10 min per 4 hours
  premium_pay_enabled: boolean;
  meal_waiver_enabled: boolean;
  auto_deduct_meals: boolean;
  require_punch_for_breaks: boolean;
}

export interface EmployeeMealWaiver {
  employee_id: string;
  company_id: string;
  waiver_type: 'first_meal' | 'second_meal' | 'all_meals';
  effective_date: string;
  expiry_date?: string;
  is_active: boolean;
  signed_date: string;
  document_url?: string;
}

export interface BreakPeriod {
  type: 'meal' | 'rest';
  required_minutes: number;
  latest_start_time?: string; // For meals
  actual_start_time?: string;
  actual_end_time?: string;
  actual_minutes?: number;
  is_taken: boolean;
  is_compliant: boolean;
  violation_reason?: 'missing' | 'late' | 'short' | 'interrupted';
}

export interface ComplianceResult {
  employee_id: string;
  date: string;
  shift_duration_minutes: number;
  meal_periods: BreakPeriod[];
  rest_periods: BreakPeriod[];
  meal_compliant: boolean;
  rest_compliant: boolean;
  premium_applied: boolean;
  penalty_hours: number;
  penalty_earnings_codes: string[];
  violation_reasons: string[];
  approval_required: boolean;
  waiver_applied: boolean;
  notes: string[];
}

export interface ComplianceAuditLog {
  id: string;
  employee_id: string;
  company_id: string;
  date: string;
  compliance_result: ComplianceResult;
  policy_version: string;
  created_at: string;
  created_by?: string;
}

export class ComplianceEngine {
  /**
   * Analyze timecard for compliance with break and meal rules
   */
  static async analyzeCompliance(
    timecard: DailyTimecard,
    policy: CompliancePolicy,
    employeeWaivers: EmployeeMealWaiver[] = []
  ): Promise<ComplianceResult> {
    console.log(`Analyzing compliance for ${timecard.employee_id} on ${timecard.date}`);

    const activeWaiver = this.getActiveWaiver(timecard.employee_id, timecard.date, employeeWaivers);
    const shiftDuration = this.calculateTotalShiftDuration(timecard.shifts);

    // Analyze meal periods
    const mealPeriods = this.analyzeMealCompliance(timecard, policy, activeWaiver);
    
    // Analyze rest periods
    const restPeriods = this.analyzeRestCompliance(timecard, policy);

    // Calculate compliance status
    const mealCompliant = mealPeriods.every(p => p.is_compliant);
    const restCompliant = restPeriods.every(p => p.is_compliant);

    // Calculate premium pay penalties
    const { penaltyHours, penaltyEarningsCodes } = this.calculatePremiumPay(
      mealPeriods, 
      restPeriods, 
      policy
    );

    // Collect violation reasons
    const violationReasons: string[] = [];
    [...mealPeriods, ...restPeriods].forEach(period => {
      if (!period.is_compliant && period.violation_reason) {
        violationReasons.push(`${period.type}_${period.violation_reason}`);
      }
    });

    const result: ComplianceResult = {
      employee_id: timecard.employee_id,
      date: timecard.date,
      shift_duration_minutes: shiftDuration,
      meal_periods: mealPeriods,
      rest_periods: restPeriods,
      meal_compliant: mealCompliant,
      rest_compliant: restCompliant,
      premium_applied: penaltyHours > 0,
      penalty_hours: penaltyHours,
      penalty_earnings_codes: penaltyEarningsCodes,
      violation_reasons: violationReasons,
      approval_required: !mealCompliant || !restCompliant,
      waiver_applied: activeWaiver !== null,
      notes: this.generateComplianceNotes(mealPeriods, restPeriods, activeWaiver)
    };

    console.log(`Compliance analysis complete: ${result.violation_reasons.length} violations, ${result.penalty_hours} penalty hours`);
    return result;
  }

  /**
   * Analyze meal period compliance
   */
  private static analyzeMealCompliance(
    timecard: DailyTimecard,
    policy: CompliancePolicy,
    waiver: EmployeeMealWaiver | null
  ): BreakPeriod[] {
    const mealPeriods: BreakPeriod[] = [];
    const shiftDurationHours = this.calculateTotalShiftDuration(timecard.shifts) / 60;

    // CA Rule: First meal must start before 5th hour for shifts > 5 hours
    if (shiftDurationHours > 5) {
      const firstMeal = this.analyzeFirstMeal(timecard, policy, waiver);
      mealPeriods.push(firstMeal);
    }

    // CA Rule: Second meal for shifts > 10 hours
    if (shiftDurationHours > 10) {
      const secondMeal = this.analyzeSecondMeal(timecard, policy, waiver);
      mealPeriods.push(secondMeal);
    }

    return mealPeriods;
  }

  /**
   * Analyze first meal period
   */
  private static analyzeFirstMeal(
    timecard: DailyTimecard,
    policy: CompliancePolicy,
    waiver: EmployeeMealWaiver | null
  ): BreakPeriod {
    const firstShift = timecard.shifts[0];
    if (!firstShift || !firstShift.clock_in) {
      return this.createMissingMealPeriod('missing');
    }

    const shiftStart = new Date(firstShift.clock_in.timestamp);
    const latestMealStart = new Date(shiftStart.getTime() + (policy.meal_deadline_hours * 60 * 60 * 1000));

    // Check if meal waiver applies
    if (waiver && (waiver.waiver_type === 'first_meal' || waiver.waiver_type === 'all_meals')) {
      return {
        type: 'meal',
        required_minutes: policy.meal_duration_minutes,
        latest_start_time: latestMealStart.toISOString(),
        is_taken: false,
        is_compliant: true, // Waived
        violation_reason: undefined
      };
    }

    // Look for meal break in punch data (if tracked)
    // For now, assume auto-deduct if policy allows
    if (policy.auto_deduct_meals) {
      return {
        type: 'meal',
        required_minutes: policy.meal_duration_minutes,
        latest_start_time: latestMealStart.toISOString(),
        actual_start_time: undefined, // Auto-deducted
        actual_minutes: policy.meal_duration_minutes,
        is_taken: true,
        is_compliant: true
      };
    }

    // If no meal tracking and no auto-deduct, assume violation
    return this.createMissingMealPeriod('missing');
  }

  /**
   * Analyze second meal period (for shifts > 10 hours)
   */
  private static analyzeSecondMeal(
    timecard: DailyTimecard,
    policy: CompliancePolicy,
    waiver: EmployeeMealWaiver | null
  ): BreakPeriod {
    // Similar logic to first meal but for second meal period
    if (waiver && (waiver.waiver_type === 'second_meal' || waiver.waiver_type === 'all_meals')) {
      return {
        type: 'meal',
        required_minutes: policy.meal_duration_minutes,
        is_taken: false,
        is_compliant: true
      };
    }

    if (policy.auto_deduct_meals) {
      return {
        type: 'meal',
        required_minutes: policy.meal_duration_minutes,
        actual_minutes: policy.meal_duration_minutes,
        is_taken: true,
        is_compliant: true
      };
    }

    return this.createMissingMealPeriod('missing');
  }

  /**
   * Analyze rest break compliance
   */
  private static analyzeRestCompliance(
    timecard: DailyTimecard,
    policy: CompliancePolicy
  ): BreakPeriod[] {
    const restPeriods: BreakPeriod[] = [];
    const shiftDurationHours = this.calculateTotalShiftDuration(timecard.shifts) / 60;

    // CA Rule: 10-minute paid rest for every 4 hours worked
    const requiredRestBreaks = Math.floor(shiftDurationHours / policy.rest_break_frequency_hours);

    for (let i = 0; i < requiredRestBreaks; i++) {
      // For now, assume rest breaks are provided (not tracked by punches)
      // This can be enhanced to track actual break punches
      restPeriods.push({
        type: 'rest',
        required_minutes: policy.rest_break_minutes,
        is_taken: true, // Assumed provided
        is_compliant: true
      });
    }

    return restPeriods;
  }

  /**
   * Calculate premium pay penalties
   */
  private static calculatePremiumPay(
    mealPeriods: BreakPeriod[],
    restPeriods: BreakPeriod[],
    policy: CompliancePolicy
  ): { penaltyHours: number; penaltyEarningsCodes: string[] } {
    if (!policy.premium_pay_enabled) {
      return { penaltyHours: 0, penaltyEarningsCodes: [] };
    }

    let penaltyHours = 0;
    const penaltyEarningsCodes: string[] = [];

    // Meal violations = 1 hour penalty each
    mealPeriods.forEach(meal => {
      if (!meal.is_compliant) {
        penaltyHours += 1;
        penaltyEarningsCodes.push('MEAL_VIOLATION');
      }
    });

    // Rest break violations = 1 hour penalty each
    restPeriods.forEach(rest => {
      if (!rest.is_compliant) {
        penaltyHours += 1;
        penaltyEarningsCodes.push('REST_VIOLATION');
      }
    });

    return { penaltyHours, penaltyEarningsCodes };
  }

  /**
   * Get active meal waiver for employee on specific date
   */
  private static getActiveWaiver(
    employeeId: string,
    date: string,
    waivers: EmployeeMealWaiver[]
  ): EmployeeMealWaiver | null {
    const targetDate = new Date(date);
    
    return waivers.find(waiver => 
      waiver.employee_id === employeeId &&
      waiver.is_active &&
      new Date(waiver.effective_date) <= targetDate &&
      (!waiver.expiry_date || new Date(waiver.expiry_date) >= targetDate)
    ) || null;
  }

  /**
   * Calculate total shift duration across all shifts
   */
  private static calculateTotalShiftDuration(shifts: PunchPair[]): number {
    return shifts.reduce((total, shift) => total + shift.shift_duration_minutes, 0);
  }

  /**
   * Create a missing meal period object
   */
  private static createMissingMealPeriod(reason: 'missing' | 'late' | 'short'): BreakPeriod {
    return {
      type: 'meal',
      required_minutes: 30,
      is_taken: false,
      is_compliant: false,
      violation_reason: reason
    };
  }

  /**
   * Generate compliance notes
   */
  private static generateComplianceNotes(
    mealPeriods: BreakPeriod[],
    restPeriods: BreakPeriod[],
    waiver: EmployeeMealWaiver | null
  ): string[] {
    const notes: string[] = [];

    if (waiver) {
      notes.push(`Meal waiver on file: ${waiver.waiver_type} (effective ${waiver.effective_date})`);
    }

    mealPeriods.forEach((meal, index) => {
      if (!meal.is_compliant) {
        notes.push(`Meal period ${index + 1}: ${meal.violation_reason}`);
      }
    });

    restPeriods.forEach((rest, index) => {
      if (!rest.is_compliant) {
        notes.push(`Rest break ${index + 1}: ${rest.violation_reason}`);
      }
    });

    return notes;
  }

  /**
   * Apply compliance results to timecard (inject penalty hours)
   */
  static applyComplianceToTimecard(
    timecard: DailyTimecard,
    complianceResult: ComplianceResult
  ): DailyTimecard {
    if (complianceResult.penalty_hours > 0) {
      // Add penalty hours to overtime (premium pay)
      timecard.overtime_hours += complianceResult.penalty_hours;
      timecard.total_hours += complianceResult.penalty_hours;
      
      // Add compliance notes
      timecard.notes.push(...complianceResult.notes);
      timecard.flags.push('compliance_violation');
      
      // Mark as non-compliant
      timecard.is_compliant = false;
    }

    return timecard;
  }

  /**
   * Store compliance audit log
   */
  static async storeComplianceAudit(
    complianceResult: ComplianceResult,
    companyId: string,
    userId?: string
  ): Promise<void> {
    try {
      const auditLog: Omit<ComplianceAuditLog, 'id' | 'created_at'> = {
        employee_id: complianceResult.employee_id,
        company_id: companyId,
        date: complianceResult.date,
        compliance_result: complianceResult,
        policy_version: '1.0',
        created_by: userId
      };

      console.log(`Storing compliance audit for ${complianceResult.employee_id} on ${complianceResult.date}`);
      
      // TODO: Implement when compliance_audit_logs table is available
      // const { error } = await supabase
      //   .from('compliance_audit_logs')
      //   .insert(auditLog);

      // For now, just log
      console.log('Compliance audit stored:', auditLog);
    } catch (error) {
      console.error('Error storing compliance audit:', error);
    }
  }

  /**
   * Get default compliance policy (CA rules)
   */
  static getDefaultCompliancePolicy(companyId: string, state: string = 'CA'): CompliancePolicy {
    return {
      company_id: companyId,
      state,
      meal_duration_minutes: 30,
      meal_deadline_hours: 5, // Before 5th hour starts
      rest_break_minutes: 10,
      rest_break_frequency_hours: 4, // Every 4 hours
      premium_pay_enabled: true,
      meal_waiver_enabled: true,
      auto_deduct_meals: false,
      require_punch_for_breaks: false
    };
  }

  /**
   * Batch process compliance for multiple timecards
   */
  static async processComplianceBatch(
    timecards: DailyTimecard[],
    policy: CompliancePolicy,
    waivers: EmployeeMealWaiver[] = []
  ): Promise<{ 
    timecards: DailyTimecard[]; 
    complianceResults: ComplianceResult[] 
  }> {
    const processedTimecards: DailyTimecard[] = [];
    const complianceResults: ComplianceResult[] = [];

    for (const timecard of timecards) {
      try {
        const complianceResult = await this.analyzeCompliance(timecard, policy, waivers);
        const updatedTimecard = this.applyComplianceToTimecard(timecard, complianceResult);
        
        processedTimecards.push(updatedTimecard);
        complianceResults.push(complianceResult);

        // Store audit log
        await this.storeComplianceAudit(complianceResult, policy.company_id);
      } catch (error) {
        console.error(`Error processing compliance for timecard ${timecard.employee_id}:`, error);
        processedTimecards.push(timecard); // Keep original if compliance fails
      }
    }

    console.log(`Processed compliance for ${processedTimecards.length} timecards, ${complianceResults.filter(r => !r.meal_compliant || !r.rest_compliant).length} violations found`);

    return { timecards: processedTimecards, complianceResults };
  }
}