/**
 * Scheduling Service
 * Manages employee schedules, shift assignments, and enforcement rules
 */

import { supabase } from "@/integrations/supabase/client";
import { 
  Shift, 
  ShiftTemplate, 
  ShiftEnforcementRules, 
  AttendanceVariance, 
  ScheduleWeekView,
  AttendanceReport,
  RecurrenceRule 
} from "../types/scheduling";

export class SchedulingService {
  /**
   * Create a new shift assignment
   */
  static async createShift(shift: Omit<Shift, 'id' | 'created_at' | 'updated_at'>): Promise<Shift> {
    const { data, error } = await supabase
      .from('employee_schedules')
      .insert({
        employee_id: shift.employee_id,
        company_id: shift.company_id,
        location_id: shift.location_id,
        job_code: shift.job_code,
        start_time: shift.start_time,
        end_time: shift.end_time,
        scheduled_break_minutes: shift.scheduled_break_minutes,
        recurrence_rule: shift.recurrence_rule as any,
        created_by: shift.created_by
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Shift;
  }

  /**
   * Create recurring shifts based on recurrence rule
   */
  static async createRecurringShifts(
    baseShift: Omit<Shift, 'id' | 'created_at' | 'updated_at'>, 
    endDate: string
  ): Promise<Shift[]> {
    if (!baseShift.recurrence_rule) {
      throw new Error('Recurrence rule required for recurring shifts');
    }

    const shifts: Shift[] = [];
    const startDate = new Date(baseShift.start_time);
    const endDateObj = new Date(endDate);
    const rule = baseShift.recurrence_rule;

    let currentDate = new Date(startDate);
    
    while (currentDate <= endDateObj) {
      // Skip if date is in exceptions
      const dateStr = currentDate.toISOString().split('T')[0];
      if (rule.exceptions?.includes(dateStr)) {
        currentDate = this.getNextDate(currentDate, rule);
        continue;
      }

      // Check if day matches recurrence pattern
      if (this.matchesRecurrencePattern(currentDate, rule)) {
        const shiftStart = new Date(currentDate);
        const shiftEnd = new Date(currentDate);
        
        // Set times from original shift
        const originalStart = new Date(baseShift.start_time);
        const originalEnd = new Date(baseShift.end_time);
        
        shiftStart.setHours(originalStart.getHours(), originalStart.getMinutes());
        shiftEnd.setHours(originalEnd.getHours(), originalEnd.getMinutes());

        const shift = await this.createShift({
          ...baseShift,
          start_time: shiftStart.toISOString(),
          end_time: shiftEnd.toISOString(),
          recurrence_rule: undefined // Individual shifts don't need recurrence
        });

        shifts.push(shift);
      }

      currentDate = this.getNextDate(currentDate, rule);
    }

    return shifts;
  }

  /**
   * Get shifts for an employee within a date range
   */
  static async getEmployeeShifts(
    employeeId: string, 
    startDate: string, 
    endDate: string
  ): Promise<Shift[]> {
    // Return mock data since shifts table doesn't exist yet
    return [];
  }

  /**
   * Get week view for all employees
   */
  static async getWeekSchedule(
    companyId: string, 
    weekStartDate: string
  ): Promise<ScheduleWeekView[]> {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const { data: shifts, error } = await supabase
      .from('employee_schedules')
      .select(`
        *,
        employees (
          id,
          first_name,
          last_name
        )
      `)
      .eq('company_id', companyId)
      .gte('start_time', weekStartDate)
      .lte('start_time', weekEndDate.toISOString())
      .order('start_time');

    if (error) throw error;

    // Group by employee
    const employeeMap = new Map<string, ScheduleWeekView>();
    
    shifts?.forEach((shift: any) => {
      const employeeId = shift.employee_id;
      const employee = shift.employees;
      const shiftDate = shift.start_time.split('T')[0];

      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employee_id: employeeId,
          employee_name: `${employee?.first_name || ''} ${employee?.last_name || ''}`,
          shifts: {},
          total_scheduled_hours: 0
        });
      }

      const scheduleView = employeeMap.get(employeeId)!;
      
      if (!scheduleView.shifts[shiftDate]) {
        scheduleView.shifts[shiftDate] = [];
      }

      scheduleView.shifts[shiftDate].push(shift as Shift);
      
      // Calculate hours
      const shiftHours = this.calculateShiftHours(shift.start_time, shift.end_time);
      scheduleView.total_scheduled_hours += shiftHours;
    });

    return Array.from(employeeMap.values());
  }

  /**
   * Check if punch is allowed based on schedule and enforcement rules
   */
  static async validatePunch(
    employeeId: string,
    punchType: 'clock_in' | 'clock_out',
    timestamp: string,
    companyId: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    scheduledShift?: Shift;
    variance?: AttendanceVariance;
  }> {
    // Get enforcement rules
    const rules = await this.getEnforcementRules(companyId);
    
    // Find scheduled shift for this time
    const punchDate = new Date(timestamp);
    const dayStart = new Date(punchDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(punchDate);
    dayEnd.setHours(23, 59, 59, 999);

    const shifts = await this.getEmployeeShifts(
      employeeId, 
      dayStart.toISOString(), 
      dayEnd.toISOString()
    );

    const relevantShift = shifts.find(shift => {
      const shiftStart = new Date(shift.start_time);
      const shiftEnd = new Date(shift.end_time);
      return punchDate >= shiftStart && punchDate <= shiftEnd;
    });

    // If no scheduled shift and blocking unscheduled punches
    if (!relevantShift && rules.block_unscheduled_punches) {
      return {
        allowed: false,
        reason: 'No scheduled shift found for this time'
      };
    }

    // If we have a shift, check timing rules
    if (relevantShift) {
      const scheduledStart = new Date(relevantShift.start_time);
      const scheduledEnd = new Date(relevantShift.end_time);

      if (punchType === 'clock_in') {
        const minutesEarly = (scheduledStart.getTime() - punchDate.getTime()) / (1000 * 60);
        const minutesLate = (punchDate.getTime() - scheduledStart.getTime()) / (1000 * 60);

        // Too early
        if (minutesEarly > rules.allow_early_clockin_minutes) {
          return {
            allowed: false,
            reason: `Cannot clock in more than ${rules.allow_early_clockin_minutes} minutes early`
          };
        }

        // Create variance record
        let variance: AttendanceVariance | undefined;
        if (minutesLate > rules.allow_late_clockin_minutes && rules.flag_late_arrivals) {
          variance = {
            employee_id: employeeId,
            shift_id: relevantShift.id,
            scheduled_start: relevantShift.start_time,
            scheduled_end: relevantShift.end_time,
            actual_start: timestamp,
            variance_type: 'late_arrival',
            variance_minutes: minutesLate,
            date: punchDate.toISOString().split('T')[0]
          };
        } else if (minutesEarly > 0) {
          variance = {
            employee_id: employeeId,
            shift_id: relevantShift.id,
            scheduled_start: relevantShift.start_time,
            scheduled_end: relevantShift.end_time,
            actual_start: timestamp,
            variance_type: 'early_clockin',
            variance_minutes: minutesEarly,
            date: punchDate.toISOString().split('T')[0]
          };
        }

        return {
          allowed: true,
          scheduledShift: relevantShift,
          variance
        };
      }
    }

    return { allowed: true, scheduledShift: relevantShift };
  }

  /**
   * Generate attendance variance report
   */
  static async generateAttendanceReport(
    companyId: string,
    reportDate: string
  ): Promise<AttendanceReport> {
    // Get all shifts for the date
    const dayStart = new Date(reportDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(reportDate);
    dayEnd.setHours(23, 59, 59, 999);

    const shifts = await supabase
      .from('employee_schedules')
      .select(`
        *,
        employees (
          id,
          first_name,
          last_name
        )
      `)
      .eq('company_id', companyId)
      .gte('start_time', dayStart.toISOString())
      .lte('start_time', dayEnd.toISOString());

    // Get actual punches for the date
    const punches = await supabase
      .from('time_punches')
      .select('*')
      .eq('company_id', companyId)
      .gte('punch_time', dayStart.toISOString())
      .lte('punch_time', dayEnd.toISOString());

    const variances: AttendanceVariance[] = [];
    let totalScheduled = 0;
    let totalPresent = 0;
    let totalLate = 0;
    let totalNoShows = 0;
    let totalUnscheduled = 0;

    // Check each scheduled shift
    shifts.data?.forEach((shift: any) => {
      totalScheduled++;
      
      const employeePunches = punches.data?.filter((p: any) => p.employee_id === shift.employee_id) || [];
      const clockIn = employeePunches.find((p: any) => p.punch_type === 'clock_in');
      const clockOut = employeePunches.find((p: any) => p.punch_type === 'clock_out');

      if (!clockIn) {
        // No show
        totalNoShows++;
        variances.push({
          employee_id: shift.employee_id,
          shift_id: shift.id,
          scheduled_start: shift.start_time,
          scheduled_end: shift.end_time,
          variance_type: 'no_show',
          variance_minutes: 0,
          date: reportDate
        });
      } else {
        totalPresent++;
        
        // Check if late
        const scheduledStart = new Date(shift.start_time);
        const actualStart = new Date(clockIn.punch_time);
        const minutesLate = (actualStart.getTime() - scheduledStart.getTime()) / (1000 * 60);

        if (minutesLate > 5) { // 5 minute grace period
          totalLate++;
          variances.push({
            employee_id: shift.employee_id,
            shift_id: shift.id,
            scheduled_start: shift.start_time,
            scheduled_end: shift.end_time,
            actual_start: clockIn.punch_time,
            actual_end: clockOut?.punch_time,
            variance_type: 'late_arrival',
            variance_minutes: minutesLate,
            date: reportDate
          });
        }

        // Check early departure
        if (clockOut) {
          const scheduledEnd = new Date(shift.end_time);
          const actualEnd = new Date(clockOut.punch_time);
          const minutesEarly = (scheduledEnd.getTime() - actualEnd.getTime()) / (1000 * 60);

          if (minutesEarly > 5) {
            variances.push({
              employee_id: shift.employee_id,
              shift_id: shift.id,
              scheduled_start: shift.start_time,
              scheduled_end: shift.end_time,
              actual_start: clockIn.punch_time,
              actual_end: clockOut.punch_time,
              variance_type: 'early_departure',
              variance_minutes: minutesEarly,
              date: reportDate
            });
          }
        }
      }
    });

    // Check for unscheduled punches
    const scheduledEmployees = new Set(shifts.data?.map((s: any) => s.employee_id) || []);
    punches.data?.forEach((punch: any) => {
      if (!scheduledEmployees.has(punch.employee_id) && punch.punch_type === 'clock_in') {
        totalUnscheduled++;
        variances.push({
          employee_id: punch.employee_id,
          shift_id: '',
          scheduled_start: '',
          scheduled_end: '',
          actual_start: punch.punch_time,
          variance_type: 'unscheduled',
          variance_minutes: 0,
          date: reportDate
        });
      }
    });

    return {
      date: reportDate,
      variances,
      summary: {
        total_scheduled: totalScheduled,
        total_present: totalPresent,
        total_late: totalLate,
        total_no_shows: totalNoShows,
        total_unscheduled: totalUnscheduled
      }
    };
  }

  /**
   * Get or create enforcement rules for company
   */
  static async getEnforcementRules(companyId: string): Promise<ShiftEnforcementRules> {
    const { data, error } = await supabase
      .from('shift_enforcement_rules')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rules found, create defaults
      const defaultRules: Omit<ShiftEnforcementRules, 'company_id'> = {
        allow_early_clockin_minutes: 10,
        allow_late_clockin_minutes: 15,
        block_unscheduled_punches: false,
        auto_clockout_enabled: false,
        auto_clockout_delay_minutes: 30,
        require_schedule_to_punch: false,
        flag_late_arrivals: true,
        flag_early_departures: true
      };

      const { data: created } = await supabase
        .from('shift_enforcement_rules')
        .insert({ ...defaultRules, company_id: companyId })
        .select()
        .single();

      return created as ShiftEnforcementRules;
    }

    if (error) throw error;
    return data as ShiftEnforcementRules;
  }

  /**
   * Update enforcement rules
   */
  static async updateEnforcementRules(
    companyId: string, 
    rules: Partial<ShiftEnforcementRules>
  ): Promise<ShiftEnforcementRules> {
    const { data, error } = await supabase
      .from('shift_enforcement_rules')
      .update(rules)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;
    return data as ShiftEnforcementRules;
  }

  /**
   * Helper: Check if date matches recurrence pattern
   */
  private static matchesRecurrencePattern(date: Date, rule: RecurrenceRule): boolean {
    switch (rule.type) {
      case 'daily':
        return true;
      case 'weekly':
        return rule.days_of_week?.includes(date.getDay()) || false;
      default:
        return false;
    }
  }

  /**
   * Helper: Get next date based on recurrence rule
   */
  private static getNextDate(currentDate: Date, rule: RecurrenceRule): Date {
    const nextDate = new Date(currentDate);
    
    switch (rule.type) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + rule.frequency);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      default:
        nextDate.setDate(nextDate.getDate() + 1);
    }
    
    return nextDate;
  }

  /**
   * Helper: Calculate shift hours
   */
  private static calculateShiftHours(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }
}