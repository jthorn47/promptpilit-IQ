/**
 * Timecard Engine Service
 * Processes raw punch data into structured, rules-compliant timecards
 */

import { supabase } from "@/integrations/supabase/client";
import { SchedulingService } from "./SchedulingService";
import { Shift } from "../types/scheduling";

export interface RawPunch {
  id: string;
  employee_id: string;
  punch_type: 'clock_in' | 'clock_out';
  timestamp: string;
  device_id?: string;
  photo_url?: string;
  job_code?: string;
  location_id?: string;
}

export interface EmployeeSettings {
  employee_id: string;
  timezone: string;
  default_job_code?: string;
  default_shift_start?: string;
  default_shift_end?: string;
}

export interface ClientRules {
  company_id: string;
  rounding_rule: 'none' | '5min' | '10min' | '15min';
  early_tolerance_minutes: number;
  late_tolerance_minutes: number;
  break_duration_minutes: number;
  meal_duration_minutes: number;
  overtime_threshold_hours: number;
  require_breaks: boolean;
  require_meals: boolean;
}

export interface PunchPair {
  clock_in: RawPunch;
  clock_out: RawPunch | null;
  is_complete: boolean;
  shift_duration_minutes: number;
}

export interface DailyTimecard {
  employee_id: string;
  company_id: string;
  date: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  scheduled_start?: string;
  scheduled_end?: string;
  schedule_variance_minutes?: number;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  break_minutes: number;
  meal_minutes: number;
  job_code?: string;
  location_id?: string;
  is_compliant: boolean;
  notes: string[];
  flags: string[];
  shifts: PunchPair[];
}

export class TimecardEngine {
  /**
   * Process raw punches into daily timecards
   */
  static async processRawPunches(
    punches: RawPunch[], 
    employeeSettings: EmployeeSettings[], 
    clientRules: ClientRules
  ): Promise<DailyTimecard[]> {
    console.log(`Processing ${punches.length} raw punches for ${employeeSettings.length} employees`);

    // Group punches by employee and date
    const punchesGrouped = this.groupPunchesByEmployeeAndDate(punches, employeeSettings);
    const timecards: DailyTimecard[] = [];

    for (const [employeeId, dailyPunches] of punchesGrouped.entries()) {
      const empSettings = employeeSettings.find(e => e.employee_id === employeeId);
      if (!empSettings) continue;

      for (const [date, dayPunches] of dailyPunches.entries()) {
        const timecard = await this.processEmployeeDayPunches(
          employeeId,
          clientRules.company_id,
          date,
          dayPunches,
          empSettings,
          clientRules
        );
        timecards.push(timecard);
      }
    }

    return timecards;
  }

  /**
   * Group punches by employee ID and date
   */
  private static groupPunchesByEmployeeAndDate(
    punches: RawPunch[], 
    employeeSettings: EmployeeSettings[]
  ): Map<string, Map<string, RawPunch[]>> {
    const grouped = new Map<string, Map<string, RawPunch[]>>();

    for (const punch of punches) {
      const empSettings = employeeSettings.find(e => e.employee_id === punch.employee_id);
      if (!empSettings) continue;

      // Convert timestamp to employee's timezone and extract date
      const punchDate = new Date(punch.timestamp);
      const dateStr = punchDate.toISOString().split('T')[0];

      if (!grouped.has(punch.employee_id)) {
        grouped.set(punch.employee_id, new Map());
      }

      const employeeDays = grouped.get(punch.employee_id)!;
      if (!employeeDays.has(dateStr)) {
        employeeDays.set(dateStr, []);
      }

      employeeDays.get(dateStr)!.push(punch);
    }

    return grouped;
  }

  /**
   * Process one employee's punches for a single day
   */
  private static async processEmployeeDayPunches(
    employeeId: string,
    companyId: string,
    date: string,
    punches: RawPunch[],
    settings: EmployeeSettings,
    rules: ClientRules
  ): Promise<DailyTimecard> {
    // Sort punches by timestamp
    const sortedPunches = punches.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Validate and deduplicate punches
    const validatedPunches = this.validatePunches(sortedPunches);

    // Pair clock-in and clock-out punches
    const punchPairs = this.pairPunches(validatedPunches);

    // Calculate total hours with rounding
    const { totalHours, regularHours, overtimeHours } = this.calculateHours(punchPairs, rules);

    // Calculate breaks and meals (stub implementation)
    const { breakMinutes, mealMinutes } = this.calculateBreaksAndMeals(punchPairs, rules);

    // Get scheduled shift for this employee and date
    const scheduledShift = await this.getScheduledShift(employeeId, companyId, date);

    // Generate compliance flags and notes
    const { isCompliant, notes, flags } = this.generateComplianceInfo(punchPairs, rules);

    const timecard: DailyTimecard = {
      employee_id: employeeId,
      company_id: companyId,
      date,
      clock_in_time: punchPairs.length > 0 ? punchPairs[0].clock_in.timestamp : null,
      clock_out_time: punchPairs.length > 0 && punchPairs[punchPairs.length - 1].clock_out 
        ? punchPairs[punchPairs.length - 1].clock_out!.timestamp : null,
      scheduled_start: scheduledShift?.start_time,
      scheduled_end: scheduledShift?.end_time,
      schedule_variance_minutes: scheduledShift ? this.calculateScheduleVariance(punchPairs, scheduledShift) : undefined,
      total_hours: totalHours,
      regular_hours: regularHours,
      overtime_hours: overtimeHours,
      break_minutes: breakMinutes,
      meal_minutes: mealMinutes,
      job_code: settings.default_job_code || punchPairs[0]?.clock_in.job_code,
      location_id: punchPairs[0]?.clock_in.location_id,
      is_compliant: isCompliant,
      notes,
      flags,
      shifts: punchPairs
    };

    console.log(`Generated timecard for ${employeeId} on ${date}: ${totalHours} hours, ${flags.length} flags`);
    return timecard;
  }

  /**
   * Validate punches and remove duplicates
   */
  private static validatePunches(punches: RawPunch[]): RawPunch[] {
    const validated: RawPunch[] = [];
    const seen = new Set<string>();

    for (const punch of punches) {
      // Create a unique key for duplicate detection
      const key = `${punch.employee_id}-${punch.punch_type}-${punch.timestamp}`;
      
      if (seen.has(key)) {
        console.warn(`Duplicate punch detected: ${key}`);
        continue;
      }

      seen.add(key);
      validated.push(punch);
    }

    return validated;
  }

  /**
   * Pair clock-in and clock-out punches
   */
  private static pairPunches(punches: RawPunch[]): PunchPair[] {
    const pairs: PunchPair[] = [];
    let pendingClockIn: RawPunch | null = null;

    for (const punch of punches) {
      if (punch.punch_type === 'clock_in') {
        if (pendingClockIn) {
          // Previous clock-in without clock-out - create incomplete pair
          pairs.push({
            clock_in: pendingClockIn,
            clock_out: null,
            is_complete: false,
            shift_duration_minutes: 0
          });
        }
        pendingClockIn = punch;
      } else if (punch.punch_type === 'clock_out') {
        if (pendingClockIn) {
          // Complete pair
          const duration = Math.round(
            (new Date(punch.timestamp).getTime() - new Date(pendingClockIn.timestamp).getTime()) / (1000 * 60)
          );
          
          pairs.push({
            clock_in: pendingClockIn,
            clock_out: punch,
            is_complete: true,
            shift_duration_minutes: duration
          });
          pendingClockIn = null;
        } else {
          // Clock-out without clock-in - create incomplete pair with dummy clock-in
          const dummyClockIn: RawPunch = {
            id: 'missing-' + punch.id,
            employee_id: punch.employee_id,
            punch_type: 'clock_in',
            timestamp: punch.timestamp, // Same timestamp as placeholder
            device_id: punch.device_id,
            job_code: punch.job_code,
            location_id: punch.location_id
          };
          
          pairs.push({
            clock_in: dummyClockIn,
            clock_out: punch,
            is_complete: false,
            shift_duration_minutes: 0
          });
        }
      }
    }

    // Handle final pending clock-in
    if (pendingClockIn) {
      pairs.push({
        clock_in: pendingClockIn,
        clock_out: null,
        is_complete: false,
        shift_duration_minutes: 0
      });
    }

    return pairs;
  }

  /**
   * Calculate total hours with rounding rules
   */
  private static calculateHours(pairs: PunchPair[], rules: ClientRules): {
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
  } {
    let totalMinutes = 0;

    for (const pair of pairs) {
      if (pair.is_complete) {
        let shiftMinutes = pair.shift_duration_minutes;
        
        // Apply rounding rules
        shiftMinutes = this.applyRounding(shiftMinutes, rules.rounding_rule);
        totalMinutes += shiftMinutes;
      }
    }

    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
    const regularHours = Math.min(totalHours, rules.overtime_threshold_hours);
    const overtimeHours = Math.max(0, totalHours - rules.overtime_threshold_hours);

    return { totalHours, regularHours, overtimeHours };
  }

  /**
   * Apply rounding rules to minutes
   */
  private static applyRounding(minutes: number, rule: ClientRules['rounding_rule']): number {
    switch (rule) {
      case '5min':
        return Math.round(minutes / 5) * 5;
      case '10min':
        return Math.round(minutes / 10) * 10;
      case '15min':
        return Math.round(minutes / 15) * 15;
      default:
        return minutes;
    }
  }

  /**
   * Calculate break and meal minutes (stub implementation)
   */
  private static calculateBreaksAndMeals(pairs: PunchPair[], rules: ClientRules): {
    breakMinutes: number;
    mealMinutes: number;
  } {
    // For now, return default values based on rules
    // This will be enhanced in the compliance phase
    return {
      breakMinutes: rules.require_breaks ? rules.break_duration_minutes : 0,
      mealMinutes: rules.require_meals ? rules.meal_duration_minutes : 0
    };
  }

  /**
   * Generate compliance flags and notes
   */
  private static generateComplianceInfo(pairs: PunchPair[], rules: ClientRules): {
    isCompliant: boolean;
    notes: string[];
    flags: string[];
  } {
    const notes: string[] = [];
    const flags: string[] = [];

    for (const pair of pairs) {
      if (!pair.is_complete) {
        if (!pair.clock_out) {
          flags.push('missing_clock_out');
          notes.push('Missing clock-out punch');
        } else {
          flags.push('missing_clock_in');
          notes.push('Missing clock-in punch');
        }
      }
    }

    // Check for overlapping shifts
    for (let i = 0; i < pairs.length - 1; i++) {
      const current = pairs[i];
      const next = pairs[i + 1];
      
      if (current.clock_out && next.clock_in) {
        const gap = new Date(next.clock_in.timestamp).getTime() - new Date(current.clock_out.timestamp).getTime();
        if (gap < 0) {
          flags.push('overlapping_shifts');
          notes.push('Overlapping shift detected');
        }
      }
    }

    const isCompliant = flags.length === 0;
    return { isCompliant, notes, flags };
  }

  /**
   * Sync timecards to database (placeholder - implement after database schema is finalized)
   */
  static async syncTimecards(timecards: DailyTimecard[]): Promise<void> {
    console.log(`Syncing ${timecards.length} timecards to database`);
    
    // TODO: Implement database sync once timecard_entries table is available in types
    // For now, just log the timecards that would be synced
    for (const timecard of timecards) {
      console.log(`Would sync timecard for ${timecard.employee_id} on ${timecard.date}: ${timecard.total_hours} hours`);
    }
  }

  /**
   * Get default client rules (can be overridden by company settings)
   */
  static getDefaultClientRules(companyId: string): ClientRules {
    return {
      company_id: companyId,
      rounding_rule: '15min',
      early_tolerance_minutes: 5,
      late_tolerance_minutes: 5,
      break_duration_minutes: 15,
      meal_duration_minutes: 30,
      overtime_threshold_hours: 8,
      require_breaks: true,
      require_meals: true
    };
  }

  /**
   * Get scheduled shift for employee on a specific date
   */
  private static async getScheduledShift(employeeId: string, companyId: string, date: string): Promise<Shift | null> {
    try {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const shifts = await SchedulingService.getEmployeeShifts(
        employeeId,
        dayStart.toISOString(),
        dayEnd.toISOString()
      );

      // Return the first scheduled shift for the day
      return shifts.length > 0 ? shifts[0] : null;
    } catch (error) {
      console.warn('Failed to fetch scheduled shift:', error);
      return null;
    }
  }

  /**
   * Calculate variance between actual punch times and scheduled times
   */
  private static calculateScheduleVariance(pairs: PunchPair[], scheduledShift: Shift): number {
    if (pairs.length === 0 || !pairs[0].is_complete) return 0;

    const actualStart = new Date(pairs[0].clock_in.timestamp);
    const actualEnd = pairs[0].clock_out ? new Date(pairs[0].clock_out.timestamp) : null;
    const scheduledStart = new Date(scheduledShift.start_time);
    const scheduledEnd = new Date(scheduledShift.end_time);

    // Calculate variance in minutes (positive = late, negative = early)
    const startVariance = (actualStart.getTime() - scheduledStart.getTime()) / (1000 * 60);
    
    if (actualEnd) {
      const endVariance = (actualEnd.getTime() - scheduledEnd.getTime()) / (1000 * 60);
      return Math.round(startVariance + endVariance);
    }

    return Math.round(startVariance);
  }
}