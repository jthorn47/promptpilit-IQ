import { supabase } from '@/integrations/supabase/client';

interface Client {
  id: string;
  name: string;
  payrollSchedule: string;
  nextPayDate: string;
}

interface PayrollSchedule {
  id: string;
  frequency: string;
  currentPeriod: {
    id: string;
    startDate: string;
    endDate: string;
    payDate: string;
    status: string;
  };
}

interface Employee {
  id: string;
  name: string;
  regularHours: number;
  overtimeHours: number;
  bonus: number;
  deductions: { [key: string]: number };
  hourlyRate: number;
  grossPay?: number;
}

interface PayrollPreview {
  grossWages: number;
  totalDeductions: number;
  estimatedTaxes: number;
  netPay: number;
  warnings: string[];
  errors: string[];
}

export const payrollService = {
  // Fetch available clients
  async getClients(): Promise<Client[]> {
    try {
      // Mock data for now - replace with actual API call
      return [
        { 
          id: '1', 
          name: 'Acme Corporation', 
          payrollSchedule: 'Bi-weekly', 
          nextPayDate: '2024-02-15' 
        },
        { 
          id: '2', 
          name: 'TechStart Inc', 
          payrollSchedule: 'Monthly', 
          nextPayDate: '2024-02-29' 
        },
        { 
          id: '3', 
          name: 'Global Industries', 
          payrollSchedule: 'Weekly', 
          nextPayDate: '2024-02-08' 
        }
      ];
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  // Fetch payroll schedule for specific client
  async getPayrollSchedule(clientId: string): Promise<PayrollSchedule> {
    try {
      // Mock data for now - replace with actual API call
      return {
        id: 'schedule-1',
        frequency: 'Bi-weekly',
        currentPeriod: {
          id: 'period-1',
          startDate: '2024-01-29',
          endDate: '2024-02-11',
          payDate: '2024-02-15',
          status: 'open'
        }
      };
    } catch (error) {
      console.error('Error fetching payroll schedule:', error);
      throw error;
    }
  },

  // Fetch employees for payroll period
  async getEmployees(clientId: string, periodId: string): Promise<Employee[]> {
    try {
      // Mock data for now - replace with actual API call
      return [
        {
          id: '1',
          name: 'John Smith',
          regularHours: 80,
          overtimeHours: 5,
          bonus: 500,
          deductions: { health: 150, dental: 25, retirement: 100 },
          hourlyRate: 25
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          regularHours: 80,
          overtimeHours: 0,
          bonus: 0,
          deductions: { health: 120, retirement: 80 },
          hourlyRate: 30
        },
        {
          id: '3',
          name: 'Mike Chen',
          regularHours: 75,
          overtimeHours: 10,
          bonus: 750,
          deductions: { health: 180, dental: 30, retirement: 120 },
          hourlyRate: 35
        }
      ];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Preview payroll calculations
  async previewPayroll(clientId: string, periodId: string, employees: Employee[]): Promise<PayrollPreview> {
    try {
      // Mock calculation - replace with actual TaxIQ API call
      const grossWages = employees.reduce((total, emp) => {
        const regularPay = emp.regularHours * emp.hourlyRate;
        const overtimePay = emp.overtimeHours * emp.hourlyRate * 1.5;
        return total + regularPay + overtimePay + emp.bonus;
      }, 0);

      const totalDeductions = employees.reduce((total, emp) => {
        return total + Object.values(emp.deductions).reduce((sum, ded) => sum + ded, 0);
      }, 0);

      // Mock tax calculation - integrate with TaxIQ
      const estimatedTaxes = grossWages * 0.22;
      const netPay = grossWages - totalDeductions - estimatedTaxes;

      const warnings: string[] = [];
      const errors: string[] = [];

      // Validation logic
      employees.forEach(emp => {
        if (emp.regularHours === 0 && emp.bonus === 0) {
          warnings.push(`${emp.name} has 0 hours and no bonus`);
        }
        if (emp.overtimeHours > 20) {
          warnings.push(`${emp.name} has excessive overtime (${emp.overtimeHours} hours)`);
        }
        
        const empGross = (emp.regularHours * emp.hourlyRate) + (emp.overtimeHours * emp.hourlyRate * 1.5) + emp.bonus;
        const empDeductions = Object.values(emp.deductions).reduce((sum, ded) => sum + ded, 0);
        
        if (empDeductions > empGross) {
          errors.push(`${emp.name} has deductions exceeding gross pay`);
        }
      });

      return {
        grossWages,
        totalDeductions,
        estimatedTaxes,
        netPay,
        warnings,
        errors
      };
    } catch (error) {
      console.error('Error previewing payroll:', error);
      throw error;
    }
  },

  // Process final payroll
  async processPayroll(clientId: string, periodId: string, employees: Employee[], preview: PayrollPreview): Promise<{
    success: boolean;
    batchId: string;
    totalAmount: number;
    effectiveDate: string;
  }> {
    try {
      // Mock processing - replace with actual API calls to:
      // 1. Lock payroll period
      // 2. Create paystubs
      // 3. Send to VaultPay
      // 4. Post to FinanceIQ GL
      // 5. Create audit log

      const batchId = `BATCH-${Date.now()}`;
      const effectiveDate = new Date().toISOString().split('T')[0];

      return {
        success: true,
        batchId,
        totalAmount: preview.netPay,
        effectiveDate
      };
    } catch (error) {
      console.error('Error processing payroll:', error);
      throw error;
    }
  }
};