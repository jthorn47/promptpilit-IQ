import { useState, useEffect } from 'react';
import { TimeEntry, PTORequest, PTOBalance, Employee, TimeClockState, WeeklyTimecard, ComplianceAlert } from '@/types/timeAttendance';

// Mock data generator
export const generateMockTimeEntries = (): TimeEntry[] => {
  const today = new Date();
  const entries: TimeEntry[] = [];
  
  // Generate entries for the past 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
      entries.push({
        id: `entry-${i}`,
        employee_id: 'current-user',
        company_id: 'mock-company',
        entry_date: date.toISOString().split('T')[0],
        punch_in_time: `${date.toISOString().split('T')[0]}T08:00:00Z`,
        punch_out_time: i === 0 ? null : `${date.toISOString().split('T')[0]}T17:30:00Z`,
        break_start_time: i === 0 ? null : `${date.toISOString().split('T')[0]}T12:00:00Z`,
        break_end_time: i === 0 ? null : `${date.toISOString().split('T')[0]}T12:30:00Z`,
        regular_hours: i === 0 ? 0 : 8.0,
        overtime_hours: i === 1 ? 1.0 : 0,
        total_hours: i === 0 ? 0 : (i === 1 ? 9.0 : 8.0),
        status: i === 0 ? 'pending' : 'approved',
        notes: i === 1 ? 'Stayed late for project deadline' : undefined,
        job_code: 'REG',
        is_holiday: false,
        created_at: date.toISOString(),
        updated_at: date.toISOString(),
      });
    }
  }
  
  return entries;
};

export const generateMockPTORequests = (): PTORequest[] => [
  {
    id: 'pto-1',
    employee_id: 'current-user',
    company_id: 'mock-company',
    request_type: 'vacation',
    start_date: '2024-08-15',
    end_date: '2024-08-16',
    hours_requested: 16,
    status: 'pending',
    reason: 'Family vacation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pto-2',
    employee_id: 'current-user',
    company_id: 'mock-company',
    request_type: 'sick',
    start_date: '2024-07-20',
    end_date: '2024-07-20',
    hours_requested: 8,
    status: 'approved',
    reason: 'Medical appointment',
    approved_by: 'manager-1',
    approved_at: '2024-07-19T10:00:00Z',
    created_at: '2024-07-18T14:30:00Z',
    updated_at: '2024-07-19T10:00:00Z',
  },
];

export const generateMockPTOBalances = (): PTOBalance[] => [
  {
    id: 'balance-1',
    employee_id: 'current-user',
    company_id: 'mock-company',
    pto_type: 'vacation',
    available_hours: 40,
    used_hours: 24,
    accrued_hours: 64,
    year: 2024,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'balance-2',
    employee_id: 'current-user',
    company_id: 'mock-company',
    pto_type: 'sick',
    available_hours: 32,
    used_hours: 8,
    accrued_hours: 40,
    year: 2024,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const generateMockEmployees = (): Employee[] => [
  {
    id: 'emp-1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    department: 'Engineering',
    job_title: 'Software Developer',
    status: 'active',
  },
  {
    id: 'emp-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Marketing',
    job_title: 'Marketing Specialist',
    status: 'active',
  },
  {
    id: 'emp-3',
    name: 'Mike Davis',
    email: 'mike.davis@company.com',
    department: 'Sales',
    job_title: 'Sales Representative',
    status: 'active',
  },
];

export const generateMockComplianceAlerts = (): ComplianceAlert[] => [
  {
    id: 'alert-1',
    employee_id: 'emp-1',
    alert_type: 'missed_break',
    date: '2024-07-25',
    description: 'No break recorded for 9+ hour shift',
    severity: 'medium',
    resolved: false,
  },
  {
    id: 'alert-2',
    employee_id: 'emp-2',
    alert_type: 'missing_punch',
    date: '2024-07-24',
    description: 'Missing punch out time',
    severity: 'high',
    resolved: false,
  },
];

export const useTimeAttendanceMock = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [ptoRequests, setPTORequests] = useState<PTORequest[]>([]);
  const [ptoBalances, setPTOBalances] = useState<PTOBalance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([]);
  const [timeClockState, setTimeClockState] = useState<TimeClockState>({
    is_clocked_in: false,
    is_on_break: false,
    last_activity: new Date().toISOString(),
  });

  useEffect(() => {
    // Initialize mock data
    setTimeEntries(generateMockTimeEntries());
    setPTORequests(generateMockPTORequests());
    setPTOBalances(generateMockPTOBalances());
    setEmployees(generateMockEmployees());
    setComplianceAlerts(generateMockComplianceAlerts());
  }, []);

  const clockIn = () => {
    setTimeClockState(prev => ({
      ...prev,
      is_clocked_in: true,
      current_punch_in: new Date().toISOString(),
      last_activity: new Date().toISOString(),
    }));
  };

  const clockOut = () => {
    setTimeClockState(prev => ({
      ...prev,
      is_clocked_in: false,
      current_punch_in: undefined,
      is_on_break: false,
      break_start_time: undefined,
      last_activity: new Date().toISOString(),
    }));
  };

  const startBreak = () => {
    setTimeClockState(prev => ({
      ...prev,
      is_on_break: true,
      break_start_time: new Date().toISOString(),
      last_activity: new Date().toISOString(),
    }));
  };

  const endBreak = () => {
    setTimeClockState(prev => ({
      ...prev,
      is_on_break: false,
      break_start_time: undefined,
      last_activity: new Date().toISOString(),
    }));
  };

  const getCurrentWeekTimecard = (): WeeklyTimecard => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weekEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.entry_date);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    });

    const totalRegular = weekEntries.reduce((sum, entry) => sum + entry.regular_hours, 0);
    const totalOvertime = weekEntries.reduce((sum, entry) => sum + entry.overtime_hours, 0);

    return {
      employee_id: 'current-user',
      week_start: startOfWeek.toISOString().split('T')[0],
      week_end: endOfWeek.toISOString().split('T')[0],
      total_regular_hours: totalRegular,
      total_overtime_hours: totalOvertime,
      total_hours: totalRegular + totalOvertime,
      entries: weekEntries,
      pto_hours: 0,
      status: 'pending',
      exceptions: totalOvertime > 0 ? ['Overtime recorded'] : [],
    };
  };

  return {
    timeEntries,
    ptoRequests,
    ptoBalances,
    employees,
    complianceAlerts,
    timeClockState,
    clockIn,
    clockOut,
    startBreak,
    endBreak,
    getCurrentWeekTimecard,
  };
};