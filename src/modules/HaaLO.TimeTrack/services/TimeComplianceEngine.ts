/**
 * TimeComplianceEngine - Centralized service for evaluating time entries against overtime rules
 */

import { TimeEntry, TimePolicy, CustomTimeRule } from '../types';

export interface ComplianceResult {
  hoursRegular: number;
  hoursOvertime: number;
  hoursDoubletime: number;
  isOvertime: boolean;
  isDoubletime: boolean;
  violations: string[];
}

export interface ComplianceContext {
  timeEntry: TimeEntry;
  clientSettings: TimePolicy;
  weeklyHours?: number;
  consecutiveDays?: number;
  previousShiftEnd?: string;
}

export class TimeComplianceEngine {
  /**
   * Evaluate a single time entry against client overtime rules
   */
  static evaluate(context: ComplianceContext): ComplianceResult {
    const { timeEntry, clientSettings, weeklyHours = 0 } = context;
    const hoursWorked = timeEntry.hours_worked || timeEntry.hours;
    
    let hoursRegular = 0;
    let hoursOvertime = 0;
    let hoursDoubletime = 0;
    const violations: string[] = [];

    // California-style cascading overtime calculation
    if (clientSettings.state === 'CA') {
      const result = this.calculateCaliforniaOvertime(hoursWorked, weeklyHours, clientSettings);
      hoursRegular = result.regular;
      hoursOvertime = result.overtime;
      hoursDoubletime = result.doubletime;
      violations.push(...result.violations);
    } else {
      // Federal/Standard overtime calculation
      const result = this.calculateStandardOvertime(hoursWorked, weeklyHours, clientSettings);
      hoursRegular = result.regular;
      hoursOvertime = result.overtime;
      hoursDoubletime = result.doubletime;
      violations.push(...result.violations);
    }

    // Apply custom rules
    const customResult = this.applyCustomRules(
      { hoursRegular, hoursOvertime, hoursDoubletime },
      context
    );
    hoursRegular = customResult.regular;
    hoursOvertime = customResult.overtime;
    hoursDoubletime = customResult.doubletime;
    violations.push(...customResult.violations);

    // Apply 7-day rule if enabled
    if (clientSettings.seven_day_rule && context.consecutiveDays && context.consecutiveDays >= 7) {
      violations.push(`Seven-day work rule violation: ${context.consecutiveDays} consecutive days`);
    }

    return {
      hoursRegular,
      hoursOvertime,
      hoursDoubletime,
      isOvertime: hoursOvertime > 0,
      isDoubletime: hoursDoubletime > 0,
      violations
    };
  }

  /**
   * California overtime rules: 8+ daily = OT, 12+ daily = DT, 40+ weekly = OT
   */
  private static calculateCaliforniaOvertime(
    hoursWorked: number,
    weeklyHours: number,
    settings: TimePolicy
  ) {
    const dailyOT = settings.daily_overtime_threshold;
    const dailyDT = settings.daily_doubletime_threshold;
    const weeklyOT = settings.weekly_overtime_threshold;
    
    let regular = 0;
    let overtime = 0;
    let doubletime = 0;
    const violations: string[] = [];

    // Daily doubletime first (12+ hours)
    if (hoursWorked > dailyDT) {
      doubletime = hoursWorked - dailyDT;
      violations.push(`Exceeded ${dailyDT}-hour daily doubletime threshold`);
    }

    // Daily overtime (8-12 hours, or what's left after DT)
    const remainingAfterDT = hoursWorked - doubletime;
    if (remainingAfterDT > dailyOT) {
      overtime = remainingAfterDT - dailyOT;
      violations.push(`Exceeded ${dailyOT}-hour daily overtime threshold`);
    }

    // Regular time (what's left)
    regular = hoursWorked - overtime - doubletime;

    // Weekly overtime check (40+ hours) - convert some regular to OT if needed
    const projectedWeeklyTotal = weeklyHours + hoursWorked;
    if (projectedWeeklyTotal > weeklyOT) {
      const weeklyOvertimeHours = projectedWeeklyTotal - weeklyOT;
      
      // Move hours from regular to overtime if we haven't hit daily limits
      if (regular > 0 && weeklyOvertimeHours > overtime) {
        const additionalOT = Math.min(regular, weeklyOvertimeHours - overtime);
        regular -= additionalOT;
        overtime += additionalOT;
        violations.push(`Exceeded ${weeklyOT}-hour weekly overtime threshold`);
      }
    }

    return { regular, overtime, doubletime, violations };
  }

  /**
   * Standard/Federal overtime rules: 40+ weekly = OT
   */
  private static calculateStandardOvertime(
    hoursWorked: number,
    weeklyHours: number,
    settings: TimePolicy
  ) {
    const weeklyOT = settings.weekly_overtime_threshold;
    const dailyOT = settings.daily_overtime_threshold || 24; // No daily OT by default
    const dailyDT = settings.daily_doubletime_threshold || 24; // No daily DT by default
    
    let regular = hoursWorked;
    let overtime = 0;
    let doubletime = 0;
    const violations: string[] = [];

    // Check daily limits if configured
    if (hoursWorked > dailyDT) {
      doubletime = hoursWorked - dailyDT;
      regular -= doubletime;
      violations.push(`Exceeded ${dailyDT}-hour daily doubletime threshold`);
    }

    if (regular > dailyOT) {
      const dailyOvertimeHours = regular - dailyOT;
      overtime += dailyOvertimeHours;
      regular -= dailyOvertimeHours;
      violations.push(`Exceeded ${dailyOT}-hour daily overtime threshold`);
    }

    // Weekly overtime check
    const projectedWeeklyTotal = weeklyHours + hoursWorked;
    if (projectedWeeklyTotal > weeklyOT) {
      const weeklyOvertimeHours = projectedWeeklyTotal - weeklyOT;
      
      if (regular > 0 && weeklyOvertimeHours > overtime) {
        const additionalOT = Math.min(regular, weeklyOvertimeHours - overtime);
        regular -= additionalOT;
        overtime += additionalOT;
        violations.push(`Exceeded ${weeklyOT}-hour weekly overtime threshold`);
      }
    }

    return { regular, overtime, doubletime, violations };
  }

  /**
   * Apply custom rules defined by the client
   */
  private static applyCustomRules(
    currentHours: { hoursRegular: number; hoursOvertime: number; hoursDoubletime: number },
    context: ComplianceContext
  ) {
    let { hoursRegular: regular, hoursOvertime: overtime, hoursDoubletime: doubletime } = currentHours;
    const violations: string[] = [];
    const { clientSettings, timeEntry } = context;

    for (const rule of clientSettings.custom_rules || []) {
      if (!rule.is_active) continue;

      const hoursWorked = timeEntry.hours_worked || timeEntry.hours;
      
      switch (rule.rule_type) {
        case 'overtime':
          if (hoursWorked > rule.threshold) {
            const customOvertimeHours = hoursWorked - rule.threshold;
            // Move hours from regular to overtime
            const moveFromRegular = Math.min(regular, customOvertimeHours);
            regular -= moveFromRegular;
            overtime += moveFromRegular;
            violations.push(rule.description || `Custom overtime rule: ${rule.condition}`);
          }
          break;

        case 'doubletime':
          if (hoursWorked > rule.threshold) {
            const customDoubletimeHours = hoursWorked - rule.threshold;
            // Move hours from regular/overtime to doubletime
            const moveFromRegular = Math.min(regular, customDoubletimeHours);
            const moveFromOvertime = Math.min(overtime, customDoubletimeHours - moveFromRegular);
            regular -= moveFromRegular;
            overtime -= moveFromOvertime;
            doubletime += moveFromRegular + moveFromOvertime;
            violations.push(rule.description || `Custom doubletime rule: ${rule.condition}`);
          }
          break;

        case 'premium':
          // Premium pay rules would be handled in payroll calculation
          if (hoursWorked > rule.threshold) {
            violations.push(rule.description || `Premium pay rule triggered: ${rule.condition}`);
          }
          break;

        case 'break':
          // Break compliance checks
          if (hoursWorked > rule.threshold && !timeEntry.break_minutes) {
            violations.push(rule.description || `Break requirement violation: ${rule.condition}`);
          }
          break;

        case 'holiday':
          // Holiday pay rules
          const entryDate = new Date(timeEntry.date);
          if (this.isHoliday(entryDate) && hoursWorked > 0) {
            violations.push(rule.description || `Holiday work detected: ${rule.condition}`);
          }
          break;
      }
    }

    return { regular, overtime, doubletime, violations };
  }

  /**
   * Check if a date is a holiday (simplified - would integrate with holiday calendar)
   */
  private static isHoliday(date: Date): boolean {
    // Simplified holiday check - would integrate with actual holiday calendar
    const holidays = [
      '01-01', // New Year's
      '07-04', // Independence Day
      '12-25', // Christmas
    ];
    
    const dateString = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidays.includes(dateString);
  }

  /**
   * Batch evaluate multiple time entries for a week
   */
  static evaluateWeek(
    timeEntries: TimeEntry[],
    clientSettings: TimePolicy
  ): ComplianceResult[] {
    let weeklyHours = 0;
    const results: ComplianceResult[] = [];

    // Sort entries by date to process in chronological order
    const sortedEntries = timeEntries.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (const entry of sortedEntries) {
      const result = this.evaluate({
        timeEntry: entry,
        clientSettings,
        weeklyHours
      });

      results.push(result);
      weeklyHours += entry.hours_worked || entry.hours;
    }

    return results;
  }

  /**
   * Get compliance summary for reporting
   */
  static getComplianceSummary(results: ComplianceResult[]) {
    return {
      totalRegularHours: results.reduce((sum, r) => sum + r.hoursRegular, 0),
      totalOvertimeHours: results.reduce((sum, r) => sum + r.hoursOvertime, 0),
      totalDoubletimeHours: results.reduce((sum, r) => sum + r.hoursDoubletime, 0),
      totalViolations: results.reduce((sum, r) => sum + r.violations.length, 0),
      violationDays: results.filter(r => r.violations.length > 0).length,
      overtimeDays: results.filter(r => r.isOvertime).length,
      doubletimeDays: results.filter(r => r.isDoubletime).length
    };
  }
}