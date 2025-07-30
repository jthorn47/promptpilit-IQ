/**
 * OvertimeService - Handles overtime compliance tracking
 */

import type { 
  OvertimeService as IOvertimeService, 
  OvertimeViolation, 
  OvertimeRule 
} from '../types';

export class OvertimeService implements IOvertimeService {
  private mockOvertimeRules: OvertimeRule[] = [
    {
      id: '1',
      jurisdiction: 'federal',
      location: 'United States',
      weeklyThreshold: 40,
      multiplier: 1.5,
      exemptions: ['executive', 'administrative', 'professional'],
      effectiveDate: new Date('1938-10-24'),
      description: 'Federal Fair Labor Standards Act overtime rule',
    },
    {
      id: '2',
      jurisdiction: 'state',
      location: 'California',
      dailyThreshold: 8,
      weeklyThreshold: 40,
      multiplier: 1.5,
      exemptions: ['executive', 'administrative', 'professional'],
      effectiveDate: new Date('2000-01-01'),
      description: 'California daily and weekly overtime rules',
    },
    {
      id: '3',
      jurisdiction: 'state',
      location: 'Alaska',
      dailyThreshold: 8,
      weeklyThreshold: 40,
      multiplier: 1.5,
      exemptions: ['executive', 'administrative', 'professional'],
      effectiveDate: new Date('1970-01-01'),
      description: 'Alaska daily and weekly overtime rules',
    },
  ];

  private mockTimeRecords = [
    {
      employeeId: '1',
      employeeName: 'John Doe',
      location: 'California',
      payPeriodStart: new Date('2024-01-01'),
      payPeriodEnd: new Date('2024-01-07'),
      dailyHours: [9, 10, 8, 8, 7, 0, 0],
      totalHours: 42,
      overtimeHours: 4, // 1 + 2 + 1 = 4 hours daily OT
      overtimePaid: 3.5,
      hourlyRate: 25.00,
    },
    {
      employeeId: '2',
      employeeName: 'Jane Smith',
      location: 'California',
      payPeriodStart: new Date('2024-01-01'),
      payPeriodEnd: new Date('2024-01-07'),
      dailyHours: [8, 8, 8, 8, 8, 6, 0],
      totalHours: 46,
      overtimeHours: 6, // 6 hours weekly OT
      overtimePaid: 6,
      hourlyRate: 18.00,
    },
  ];

  async checkOvertimeCompliance(
    employeeId: string, 
    payPeriod: { start: Date; end: Date }
  ): Promise<OvertimeViolation[]> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const timeRecord = this.mockTimeRecords.find(
      r => r.employeeId === employeeId &&
           r.payPeriodStart >= payPeriod.start &&
           r.payPeriodEnd <= payPeriod.end
    );

    if (!timeRecord) {
      return [];
    }

    const rules = await this.getOvertimeRules(timeRecord.location);
    const violations: OvertimeViolation[] = [];

    for (const rule of rules) {
      let overtimeOwed = 0;
      let overtimeHours = 0;

      // Calculate daily overtime (if applicable)
      if (rule.dailyThreshold) {
        overtimeHours += timeRecord.dailyHours.reduce((sum, hours) => {
          return sum + Math.max(0, hours - rule.dailyThreshold);
        }, 0);
      }

      // Calculate weekly overtime
      const weeklyOvertimeHours = Math.max(0, timeRecord.totalHours - rule.weeklyThreshold);
      
      // Use the higher of daily or weekly overtime (don't double count)
      overtimeHours = Math.max(overtimeHours, weeklyOvertimeHours);
      
      overtimeOwed = (overtimeHours - timeRecord.overtimePaid) * timeRecord.hourlyRate * (rule.multiplier - 1);

      if (overtimeOwed > 0.01) { // More than 1 cent owed
        violations.push({
          employeeId,
          employeeName: timeRecord.employeeName,
          payPeriodStart: timeRecord.payPeriodStart,
          payPeriodEnd: timeRecord.payPeriodEnd,
          hoursWorked: timeRecord.totalHours,
          overtimeHours,
          overtimePaid: timeRecord.overtimePaid,
          overtimeOwed,
          status: overtimeOwed > 50 ? 'violation' : 'warning',
          rule,
        });
      }
    }

    return violations;
  }

  async getOvertimeRules(location: string): Promise<OvertimeRule[]> {
    await new Promise(resolve => setTimeout(resolve, 100));

    return this.mockOvertimeRules.filter(rule => {
      if (rule.jurisdiction === 'federal') return true;
      if (rule.location === location) return true;
      return false;
    });
  }

  async calculateOwedOvertime(
    employeeId: string, 
    period: { start: Date; end: Date }
  ): Promise<number> {
    const violations = await this.checkOvertimeCompliance(employeeId, period);
    return violations.reduce((sum, v) => sum + v.overtimeOwed, 0);
  }

  async getAllOvertimeViolations(): Promise<OvertimeViolation[]> {
    const violations: OvertimeViolation[] = [];
    
    for (const record of this.mockTimeRecords) {
      const empViolations = await this.checkOvertimeCompliance(
        record.employeeId,
        { start: record.payPeriodStart, end: record.payPeriodEnd }
      );
      violations.push(...empViolations);
    }
    
    return violations;
  }

  async getOvertimeStats() {
    const violations = await this.getAllOvertimeViolations();
    
    return {
      totalViolations: violations.length,
      totalOwed: violations.reduce((sum, v) => sum + v.overtimeOwed, 0),
      affectedEmployees: new Set(violations.map(v => v.employeeId)).size,
      criticalViolations: violations.filter(v => v.status === 'violation').length,
    };
  }
}