/**
 * WageService - Handles minimum wage compliance tracking
 */

import type { 
  WageComplianceService, 
  WageComplianceCheck, 
  MinimumWageRate 
} from '../types';

export class WageService implements WageComplianceService {
  private mockWageRates: MinimumWageRate[] = [
    {
      id: '1',
      jurisdiction: 'federal',
      location: 'United States',
      rate: 7.25,
      effectiveDate: new Date('2009-07-24'),
      source: 'US Department of Labor',
      lastUpdated: new Date(),
    },
    {
      id: '2',
      jurisdiction: 'state',
      location: 'California',
      state: 'CA',
      rate: 16.00,
      effectiveDate: new Date('2024-01-01'),
      nextIncreaseDate: new Date('2025-01-01'),
      nextIncreaseRate: 16.50,
      source: 'California Department of Labor',
      lastUpdated: new Date(),
    },
    {
      id: '3',
      jurisdiction: 'local',
      location: 'Seattle, WA',
      state: 'WA',
      city: 'Seattle',
      rate: 19.97,
      effectiveDate: new Date('2024-01-01'),
      tippedRate: 19.97,
      source: 'Seattle Office of Labor Standards',
      lastUpdated: new Date(),
    },
    {
      id: '4',
      jurisdiction: 'state',
      location: 'New York',
      state: 'NY',
      rate: 15.00,
      effectiveDate: new Date('2024-01-01'),
      source: 'New York State Department of Labor',
      lastUpdated: new Date(),
    },
  ];

  private mockEmployeeWages = [
    { employeeId: '1', name: 'John Doe', hourlyRate: 15.50, location: 'California' },
    { employeeId: '2', name: 'Jane Smith', hourlyRate: 12.00, location: 'California' },
    { employeeId: '3', name: 'Mike Johnson', hourlyRate: 22.00, location: 'Seattle, WA' },
    { employeeId: '4', name: 'Sarah Wilson', hourlyRate: 14.50, location: 'New York' },
  ];

  async checkMinimumWage(employeeId: string): Promise<WageComplianceCheck> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const employee = this.mockEmployeeWages.find(e => e.employeeId === employeeId);
    if (!employee) {
      throw new Error(`Employee ${employeeId} not found`);
    }

    const applicableRates = await this.getMinimumWageRates(employee.location);
    const minimumRequired = Math.max(...applicableRates.map(r => r.rate));
    const difference = employee.hourlyRate - minimumRequired;
    
    let status: 'compliant' | 'warning' | 'violation' | 'unknown' = 'compliant';
    if (difference < 0) {
      status = 'violation';
    } else if (difference < 1.00) {
      status = 'warning';
    }

    return {
      employeeId,
      employeeName: employee.name,
      currentWage: employee.hourlyRate,
      minimumRequired,
      jurisdiction: employee.location,
      status,
      difference,
      lastChecked: new Date(),
    };
  }

  async getMinimumWageRates(location: string): Promise<MinimumWageRate[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Find applicable rates for the location
    const applicableRates = this.mockWageRates.filter(rate => {
      if (rate.jurisdiction === 'federal') return true;
      if (rate.location === location) return true;
      if (rate.state && location.includes(rate.state)) return true;
      return false;
    });

    return applicableRates.sort((a, b) => b.rate - a.rate);
  }

  async updateWageRates(): Promise<void> {
    // Simulate updating wage rates from external source
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Wage rates updated from external sources');
  }

  async getAllEmployeeWageChecks(): Promise<WageComplianceCheck[]> {
    const checks: WageComplianceCheck[] = [];
    
    for (const employee of this.mockEmployeeWages) {
      const check = await this.checkMinimumWage(employee.employeeId);
      checks.push(check);
    }
    
    return checks;
  }

  async getWageComplianceStats() {
    const checks = await this.getAllEmployeeWageChecks();
    
    return {
      totalEmployees: checks.length,
      compliant: checks.filter(c => c.status === 'compliant').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      violations: checks.filter(c => c.status === 'violation').length,
      totalUnderpayment: checks
        .filter(c => c.difference < 0)
        .reduce((sum, c) => sum + Math.abs(c.difference), 0),
    };
  }
}