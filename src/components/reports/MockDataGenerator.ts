// Mock data generators for all report types

export interface MockEmployee {
  id: string;
  name: string;
  department: string;
  position: string;
  hireDate: string;
  location: string;
  supervisor: string;
  status: 'active' | 'inactive' | 'terminated';
  ssn: string;
}

const MOCK_EMPLOYEES: MockEmployee[] = [
  { id: 'emp1', name: 'John Smith', department: 'Human Resources', position: 'HR Manager', hireDate: '2022-03-15', location: 'Headquarters', supervisor: 'Sarah Wilson', status: 'active', ssn: '***-**-1234' },
  { id: 'emp2', name: 'Jane Doe', department: 'Information Technology', position: 'Software Developer', hireDate: '2023-01-10', location: 'Headquarters', supervisor: 'Mike Johnson', status: 'active', ssn: '***-**-5678' },
  { id: 'emp3', name: 'Mike Johnson', department: 'Information Technology', position: 'IT Director', hireDate: '2021-05-20', location: 'Headquarters', supervisor: 'Sarah Wilson', status: 'active', ssn: '***-**-9012' },
  { id: 'emp4', name: 'Sarah Wilson', department: 'Finance', position: 'CFO', hireDate: '2020-02-01', location: 'Headquarters', supervisor: 'John Smith', status: 'active', ssn: '***-**-3456' },
  { id: 'emp5', name: 'Robert Brown', department: 'Sales', position: 'Sales Representative', hireDate: '2023-06-01', location: 'Branch Office 1', supervisor: 'Lisa Davis', status: 'active', ssn: '***-**-7890' },
  { id: 'emp6', name: 'Lisa Davis', department: 'Sales', position: 'Sales Manager', hireDate: '2022-08-15', location: 'Branch Office 1', supervisor: 'Sarah Wilson', status: 'active', ssn: '***-**-2345' },
  { id: 'emp7', name: 'David Miller', department: 'Marketing', position: 'Marketing Specialist', hireDate: '2023-04-12', location: 'Remote', supervisor: 'Emma Garcia', status: 'active', ssn: '***-**-6789' },
  { id: 'emp8', name: 'Emma Garcia', department: 'Marketing', position: 'Marketing Director', hireDate: '2021-11-30', location: 'Headquarters', supervisor: 'Sarah Wilson', status: 'active', ssn: '***-**-0123' },
];

const PAY_TYPES = ['Regular', 'Overtime', 'Sick', 'Vacation', 'Holiday', 'Bonus', 'Commission'];
const BENEFIT_PLANS = {
  health: ['Blue Cross Basic', 'Blue Cross Premium', 'Kaiser HMO', 'Not Enrolled'],
  dental: ['Delta Dental', 'MetLife Dental', 'Not Enrolled'],
  vision: ['VSP Vision', 'EyeMed', 'Not Enrolled'],
  retirement: ['401k - 3% Match', '401k - 6% Match', 'Not Enrolled']
};

// Generate mock payroll register data
export const generatePayrollRegisterData = (filters: any = {}) => {
  const employees = MOCK_EMPLOYEES.filter(emp => {
    if (filters.employeeIds?.length && !filters.employeeIds.includes(emp.id)) return false;
    if (filters.departments?.length && !filters.departments.includes(emp.department.toLowerCase().replace(/\s+/g, ''))) return false;
    return emp.status === 'active';
  });

  return employees.map(emp => ({
    employeeName: emp.name,
    department: emp.department,
    regularHours: Math.floor(Math.random() * 40) + 35,
    overtimeHours: Math.floor(Math.random() * 10),
    regularPay: Math.floor(Math.random() * 2000) + 1500,
    overtimePay: Math.floor(Math.random() * 500) + 100,
    totalPay: 0, // Will be calculated
    deductions: Math.floor(Math.random() * 300) + 200,
    netPay: 0 // Will be calculated
  })).map(row => ({
    ...row,
    totalPay: row.regularPay + row.overtimePay,
    netPay: row.regularPay + row.overtimePay - row.deductions
  }));
};

// Generate mock check summary data
export const generateCheckSummaryData = (filters: any = {}) => {
  const employees = MOCK_EMPLOYEES.filter(emp => {
    if (filters.employeeIds?.length && !filters.employeeIds.includes(emp.id)) return false;
    return emp.status === 'active';
  });

  return employees.map(emp => ({
    employeeName: emp.name,
    paymentMethod: Math.random() > 0.3 ? 'Direct Deposit' : 'Check',
    checkNumber: Math.random() > 0.3 ? 'N/A' : `CHK${Math.floor(Math.random() * 10000) + 1000}`,
    amount: Math.floor(Math.random() * 3000) + 2000,
    status: Math.random() > 0.1 ? 'Processed' : 'Pending'
  }));
};

// Generate mock pay type usage data
export const generatePayTypeUsageData = (filters: any = {}) => {
  return PAY_TYPES.map(payType => ({
    payType,
    totalHours: Math.floor(Math.random() * 500) + 100,
    totalAmount: Math.floor(Math.random() * 25000) + 5000,
    employeeCount: Math.floor(Math.random() * 8) + 2,
    avgHoursPerEmployee: Math.floor(Math.random() * 40) + 10
  }));
};

// Generate mock employee roster data
export const generateEmployeeRosterData = (filters: any = {}) => {
  return MOCK_EMPLOYEES.filter(emp => {
    if (filters.departments?.length && !filters.departments.includes(emp.department.toLowerCase().replace(/\s+/g, ''))) return false;
    if (filters.locations?.length && !filters.locations.includes(emp.location.toLowerCase().replace(/\s+/g, ''))) return false;
    if (filters.status && emp.status !== filters.status) return false;
    return true;
  }).map(emp => ({
    employeeId: emp.id.toUpperCase(),
    fullName: emp.name,
    department: emp.department,
    position: emp.position,
    hireDate: emp.hireDate,
    status: emp.status.charAt(0).toUpperCase() + emp.status.slice(1),
    location: emp.location,
    supervisor: emp.supervisor
  }));
};

// Generate mock new hires data
export const generateNewHiresData = (filters: any = {}) => {
  const recentHires = MOCK_EMPLOYEES.filter(emp => {
    const hireDate = new Date(emp.hireDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return hireDate > sixMonthsAgo && emp.status === 'active';
  });

  return recentHires.map(emp => ({
    employeeName: emp.name,
    hireDate: emp.hireDate,
    department: emp.department,
    position: emp.position,
    supervisor: emp.supervisor,
    onboardingStatus: Math.random() > 0.2 ? 'Complete' : 'In Progress',
    i9Status: Math.random() > 0.1 ? 'Verified' : 'Pending'
  }));
};

// Generate mock W-2 preview data
export const generateW2PreviewData = (filters: any = {}) => {
  const employees = MOCK_EMPLOYEES.filter(emp => {
    if (filters.employeeIds?.length && !filters.employeeIds.includes(emp.id)) return false;
    if (filters.departments?.length && !filters.departments.includes(emp.department.toLowerCase().replace(/\s+/g, ''))) return false;
    return emp.status === 'active';
  });

  return employees.map(emp => {
    const totalWages = Math.floor(Math.random() * 50000) + 40000;
    return {
      employeeName: emp.name,
      ssn: emp.ssn,
      totalWages,
      federalTax: Math.floor(totalWages * 0.22),
      stateTax: Math.floor(totalWages * 0.08),
      socialSecurity: Math.floor(totalWages * 0.062),
      medicare: Math.floor(totalWages * 0.0145)
    };
  });
};

// Generate mock timecard summary data
export const generateTimecardSummaryData = (filters: any = {}) => {
  const employees = MOCK_EMPLOYEES.filter(emp => {
    if (filters.employeeIds?.length && !filters.employeeIds.includes(emp.id)) return false;
    if (filters.departments?.length && !filters.departments.includes(emp.department.toLowerCase().replace(/\s+/g, ''))) return false;
    return emp.status === 'active';
  });

  return employees.map(emp => {
    const regularHours = Math.floor(Math.random() * 40) + 35;
    const overtimeHours = Math.floor(Math.random() * 10);
    const ptoUsed = Math.floor(Math.random() * 8);
    const sickUsed = Math.floor(Math.random() * 4);
    
    return {
      employeeName: emp.name,
      department: emp.department,
      totalHours: regularHours + overtimeHours,
      regularHours,
      overtimeHours,
      ptoUsed,
      sickUsed
    };
  });
};

// Generate mock benefits enrollment data
export const generateBenefitsEnrollmentData = (filters: any = {}) => {
  const employees = MOCK_EMPLOYEES.filter(emp => {
    if (filters.employeeIds?.length && !filters.employeeIds.includes(emp.id)) return false;
    if (filters.departments?.length && !filters.departments.includes(emp.department.toLowerCase().replace(/\s+/g, ''))) return false;
    return emp.status === 'active';
  });

  return employees.map(emp => ({
    employeeName: emp.name,
    healthPlan: BENEFIT_PLANS.health[Math.floor(Math.random() * BENEFIT_PLANS.health.length)],
    dentalPlan: BENEFIT_PLANS.dental[Math.floor(Math.random() * BENEFIT_PLANS.dental.length)],
    visionPlan: BENEFIT_PLANS.vision[Math.floor(Math.random() * BENEFIT_PLANS.vision.length)],
    retirementPlan: BENEFIT_PLANS.retirement[Math.floor(Math.random() * BENEFIT_PLANS.retirement.length)],
    lifeInsurance: Math.floor(Math.random() * 100000) + 25000,
    enrollmentDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
  }));
};

// Generate mock payroll journal data
export const generatePayrollJournalData = (filters: any = {}) => {
  const accounts = [
    { code: '5100', name: 'Salaries & Wages', type: 'debit' },
    { code: '5200', name: 'Payroll Taxes', type: 'debit' },
    { code: '5300', name: 'Benefits Expense', type: 'debit' },
    { code: '2100', name: 'Federal Tax Payable', type: 'credit' },
    { code: '2200', name: 'State Tax Payable', type: 'credit' },
    { code: '2300', name: 'FICA Payable', type: 'credit' },
    { code: '1000', name: 'Cash - Payroll Account', type: 'credit' }
  ];

  return accounts.flatMap(account => {
    const departments = filters.departments?.length ? 
      filters.departments.map((d: string) => d.charAt(0).toUpperCase() + d.slice(1)) :
      ['Human Resources', 'Information Technology', 'Sales', 'Marketing', 'Finance'];
      
    return departments.map(dept => {
      const amount = Math.floor(Math.random() * 10000) + 1000;
      return {
        accountCode: account.code,
        accountName: account.name,
        debitAmount: account.type === 'debit' ? amount : 0,
        creditAmount: account.type === 'credit' ? amount : 0,
        department: dept,
        description: `${account.name} - ${dept} Department`
      };
    });
  });
};

// Main data generator function
export const generateReportData = (reportId: string, filters: any = {}) => {
  switch (reportId) {
    case 'payroll-register':
      return generatePayrollRegisterData(filters);
    case 'check-summary':
      return generateCheckSummaryData(filters);
    case 'pay-type-usage':
      return generatePayTypeUsageData(filters);
    case 'employee-roster':
      return generateEmployeeRosterData(filters);
    case 'new-hires':
      return generateNewHiresData(filters);
    case 'w2-preview':
      return generateW2PreviewData(filters);
    case 'timecard-summary':
      return generateTimecardSummaryData(filters);
    case 'benefits-enrollment':
      return generateBenefitsEnrollmentData(filters);
    case 'payroll-journal':
      return generatePayrollJournalData(filters);
    default:
      return [];
  }
};