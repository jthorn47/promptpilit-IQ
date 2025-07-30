// Mock payroll periods service to replace missing database queries

export interface MockPayrollPeriod {
  id: string;
  company_name: string;
  created_at: string;
  updated_at: string;
  // Additional properties for compatibility
  status?: string;
  period_start?: string;
  period_end?: string;
  employee_count?: number;
  pay_date?: string;
  total_gross_pay?: number;
}

export const mockPayrollPeriods: MockPayrollPeriod[] = [
  {
    id: 'period-1',
    company_name: 'Test Company',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    status: 'completed',
    period_start: '2024-01-01',
    period_end: '2024-01-15',
    employee_count: 25,
    pay_date: '2024-01-20',
    total_gross_pay: 125000
  },
  {
    id: 'period-2', 
    company_name: 'Test Company',
    created_at: '2024-01-16T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z',
    status: 'completed',
    period_start: '2024-01-16',
    period_end: '2024-01-31',
    employee_count: 25,
    pay_date: '2024-02-05',
    total_gross_pay: 130000
  }
];

export interface MockEmployee {
  id: string;
  company_id: string;
  created_at: string;
  employee_id: string;
  instructor_name: string;
  is_active: boolean;
  location_id: string;
  regular_hourly_rate: number;
  saturday_class_rate: number;
  standard_class_rate: number;
  updated_at: string;
  // Additional properties for compatibility
  email?: string;
  pay_type?: string;
}

export const mockEmployees: MockEmployee[] = [
  {
    id: 'emp-1',
    company_id: 'company-1',
    created_at: '2024-01-01T00:00:00Z',
    employee_id: 'EMP001',
    instructor_name: 'John Doe',
    is_active: true,
    location_id: 'loc-1',
    regular_hourly_rate: 25,
    saturday_class_rate: 30,
    standard_class_rate: 25,
    updated_at: '2024-01-01T00:00:00Z',
    email: 'john.doe@company.com',
    pay_type: 'hourly'
  },
  {
    id: 'emp-2',
    company_id: 'company-1',
    created_at: '2024-01-01T00:00:00Z',
    employee_id: 'EMP002',
    instructor_name: 'Jane Smith',
    is_active: true,
    location_id: 'loc-1',
    regular_hourly_rate: 28,
    saturday_class_rate: 33,
    standard_class_rate: 28,
    updated_at: '2024-01-01T00:00:00Z',
    email: 'jane.smith@company.com',
    pay_type: 'hourly'
  }
];