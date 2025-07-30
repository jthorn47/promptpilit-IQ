import { 
  FileText, 
  Users, 
  Shield, 
  Clock, 
  Heart, 
  DollarSign,
  Settings
} from 'lucide-react';

export interface ReportField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage';
  format?: string;
  sortable?: boolean;
  filterable?: boolean;
  sensitive?: boolean; // For role-based access
}

export interface ReportFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'multiselect';
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  fields: ReportField[];
  filters: ReportFilter[];
  defaultSort?: string;
  requiredRole?: string;
  exportFormats: ('csv' | 'pdf' | 'excel')[];
  scheduleable: boolean;
  drillDownEnabled?: boolean;
}

// Report Categories
export const REPORT_CATEGORIES = {
  PAYROLL: 'Payroll Reports',
  EMPLOYEE: 'Employee Reports', 
  COMPLIANCE: 'Compliance & Tax Reports',
  TIME_ATTENDANCE: 'Time & Attendance Reports',
  BENEFITS: 'Benefits Reports',
  FINANCIAL: 'Financial & GL Reports',
  CUSTOM: 'Custom Reports'
};

// Common filters used across reports
export const COMMON_FILTERS = {
  DATE_RANGE: {
    key: 'dateRange',
    label: 'Date Range',
    type: 'daterange' as const,
    required: true
  },
  EMPLOYEE: {
    key: 'employeeIds',
    label: 'Employees',
    type: 'multiselect' as const,
    options: [
      { value: 'emp1', label: 'John Smith' },
      { value: 'emp2', label: 'Jane Doe' },
      { value: 'emp3', label: 'Mike Johnson' },
      { value: 'emp4', label: 'Sarah Wilson' }
    ]
  },
  DEPARTMENT: {
    key: 'departments',
    label: 'Departments',
    type: 'multiselect' as const,
    options: [
      { value: 'hr', label: 'Human Resources' },
      { value: 'it', label: 'Information Technology' },
      { value: 'sales', label: 'Sales' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'finance', label: 'Finance' }
    ]
  },
  LOCATION: {
    key: 'locations',
    label: 'Locations',
    type: 'multiselect' as const,
    options: [
      { value: 'hq', label: 'Headquarters' },
      { value: 'branch1', label: 'Branch Office 1' },
      { value: 'branch2', label: 'Branch Office 2' },
      { value: 'remote', label: 'Remote' }
    ]
  }
};

// Report Registry - All available reports
export const REPORT_REGISTRY: ReportConfig[] = [
  // PAYROLL REPORTS
  {
    id: 'payroll-register',
    name: 'Payroll Register',
    description: 'Complete payroll details by pay period',
    category: REPORT_CATEGORIES.PAYROLL,
    icon: FileText,
    fields: [
      { key: 'employeeName', label: 'Employee', type: 'text', sortable: true, filterable: true },
      { key: 'department', label: 'Department', type: 'text', sortable: true, filterable: true },
      { key: 'regularHours', label: 'Regular Hours', type: 'number' },
      { key: 'overtimeHours', label: 'OT Hours', type: 'number' },
      { key: 'regularPay', label: 'Regular Pay', type: 'currency' },
      { key: 'overtimePay', label: 'OT Pay', type: 'currency' },
      { key: 'totalPay', label: 'Total Pay', type: 'currency' },
      { key: 'deductions', label: 'Deductions', type: 'currency' },
      { key: 'netPay', label: 'Net Pay', type: 'currency', sensitive: true }
    ],
    filters: [COMMON_FILTERS.DATE_RANGE, COMMON_FILTERS.EMPLOYEE, COMMON_FILTERS.DEPARTMENT],
    defaultSort: 'employeeName',
    exportFormats: ['csv', 'pdf', 'excel'],
    scheduleable: true,
    drillDownEnabled: true
  },
  {
    id: 'check-summary',
    name: 'Check/Direct Deposit Summary',
    description: 'Summary of payment methods and amounts',
    category: REPORT_CATEGORIES.PAYROLL,
    icon: DollarSign,
    fields: [
      { key: 'employeeName', label: 'Employee', type: 'text', sortable: true },
      { key: 'paymentMethod', label: 'Payment Method', type: 'text' },
      { key: 'checkNumber', label: 'Check #', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'currency', sensitive: true },
      { key: 'status', label: 'Status', type: 'text' }
    ],
    filters: [COMMON_FILTERS.DATE_RANGE, COMMON_FILTERS.EMPLOYEE],
    exportFormats: ['csv', 'pdf'],
    scheduleable: true
  },
  {
    id: 'pay-type-usage',
    name: 'Pay Type Usage Report',
    description: 'Analysis of different pay types usage',
    category: REPORT_CATEGORIES.PAYROLL,
    icon: FileText,
    fields: [
      { key: 'payType', label: 'Pay Type', type: 'text', sortable: true },
      { key: 'totalHours', label: 'Total Hours', type: 'number' },
      { key: 'totalAmount', label: 'Total Amount', type: 'currency' },
      { key: 'employeeCount', label: 'Employees Using', type: 'number' },
      { key: 'avgHoursPerEmployee', label: 'Avg Hours/Employee', type: 'number' }
    ],
    filters: [COMMON_FILTERS.DATE_RANGE, COMMON_FILTERS.DEPARTMENT],
    exportFormats: ['csv', 'pdf'],
    scheduleable: true
  },

  // EMPLOYEE REPORTS
  {
    id: 'employee-roster',
    name: 'Employee Roster',
    description: 'Active and inactive employee directory',
    category: REPORT_CATEGORIES.EMPLOYEE,
    icon: Users,
    fields: [
      { key: 'employeeId', label: 'Employee ID', type: 'text' },
      { key: 'fullName', label: 'Full Name', type: 'text', sortable: true },
      { key: 'department', label: 'Department', type: 'text', sortable: true },
      { key: 'position', label: 'Position', type: 'text' },
      { key: 'hireDate', label: 'Hire Date', type: 'date', sortable: true },
      { key: 'status', label: 'Status', type: 'text', filterable: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'supervisor', label: 'Supervisor', type: 'text' }
    ],
    filters: [
      COMMON_FILTERS.DEPARTMENT,
      COMMON_FILTERS.LOCATION,
      {
        key: 'status',
        label: 'Employee Status',
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'terminated', label: 'Terminated' }
        ]
      }
    ],
    exportFormats: ['csv', 'excel'],
    scheduleable: true
  },
  {
    id: 'new-hires',
    name: 'New Hires Report',
    description: 'Recent new hires with onboarding status',
    category: REPORT_CATEGORIES.EMPLOYEE,
    icon: Users,
    fields: [
      { key: 'employeeName', label: 'Employee Name', type: 'text', sortable: true },
      { key: 'hireDate', label: 'Hire Date', type: 'date', sortable: true },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'position', label: 'Position', type: 'text' },
      { key: 'supervisor', label: 'Supervisor', type: 'text' },
      { key: 'onboardingStatus', label: 'Onboarding Status', type: 'text' },
      { key: 'i9Status', label: 'I-9 Status', type: 'text' }
    ],
    filters: [COMMON_FILTERS.DATE_RANGE, COMMON_FILTERS.DEPARTMENT, COMMON_FILTERS.LOCATION],
    exportFormats: ['csv', 'pdf'],
    scheduleable: true
  },

  // COMPLIANCE REPORTS  
  {
    id: 'w2-preview',
    name: 'W-2 Preview Report',
    description: 'Preview W-2 data before year-end processing',
    category: REPORT_CATEGORIES.COMPLIANCE,
    icon: Shield,
    fields: [
      { key: 'employeeName', label: 'Employee', type: 'text', sortable: true },
      { key: 'ssn', label: 'SSN', type: 'text', sensitive: true },
      { key: 'totalWages', label: 'Total Wages', type: 'currency', sensitive: true },
      { key: 'federalTax', label: 'Federal Tax', type: 'currency' },
      { key: 'stateTax', label: 'State Tax', type: 'currency' },
      { key: 'socialSecurity', label: 'Social Security', type: 'currency' },
      { key: 'medicare', label: 'Medicare', type: 'currency' }
    ],
    filters: [COMMON_FILTERS.EMPLOYEE, COMMON_FILTERS.DEPARTMENT],
    requiredRole: 'company_admin',
    exportFormats: ['csv', 'pdf'],
    scheduleable: false
  },

  // TIME & ATTENDANCE REPORTS
  {
    id: 'timecard-summary',
    name: 'Timecard Summary',
    description: 'Employee time tracking summary',
    category: REPORT_CATEGORIES.TIME_ATTENDANCE,
    icon: Clock,
    fields: [
      { key: 'employeeName', label: 'Employee', type: 'text', sortable: true },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'totalHours', label: 'Total Hours', type: 'number' },
      { key: 'regularHours', label: 'Regular Hours', type: 'number' },
      { key: 'overtimeHours', label: 'Overtime Hours', type: 'number' },
      { key: 'ptoUsed', label: 'PTO Used', type: 'number' },
      { key: 'sickUsed', label: 'Sick Used', type: 'number' }
    ],
    filters: [COMMON_FILTERS.DATE_RANGE, COMMON_FILTERS.EMPLOYEE, COMMON_FILTERS.DEPARTMENT],
    exportFormats: ['csv', 'excel'],
    scheduleable: true
  },

  // BENEFITS REPORTS
  {
    id: 'benefits-enrollment',
    name: 'Benefits Enrollment Report',
    description: 'Employee benefits enrollment status',
    category: REPORT_CATEGORIES.BENEFITS,
    icon: Heart,
    fields: [
      { key: 'employeeName', label: 'Employee', type: 'text', sortable: true },
      { key: 'healthPlan', label: 'Health Plan', type: 'text' },
      { key: 'dentalPlan', label: 'Dental Plan', type: 'text' },
      { key: 'visionPlan', label: 'Vision Plan', type: 'text' },
      { key: 'retirementPlan', label: '401(k) Plan', type: 'text' },
      { key: 'lifeInsurance', label: 'Life Insurance', type: 'currency' },
      { key: 'enrollmentDate', label: 'Enrollment Date', type: 'date' }
    ],
    filters: [COMMON_FILTERS.EMPLOYEE, COMMON_FILTERS.DEPARTMENT],
    exportFormats: ['csv', 'excel'],
    scheduleable: true
  },

  // FINANCIAL REPORTS
  {
    id: 'payroll-journal',
    name: 'Payroll Journal',
    description: 'General ledger entries for payroll',
    category: REPORT_CATEGORIES.FINANCIAL,
    icon: DollarSign,
    fields: [
      { key: 'accountCode', label: 'Account Code', type: 'text' },
      { key: 'accountName', label: 'Account Name', type: 'text' },
      { key: 'debitAmount', label: 'Debit', type: 'currency' },
      { key: 'creditAmount', label: 'Credit', type: 'currency' },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' }
    ],
    filters: [COMMON_FILTERS.DATE_RANGE, COMMON_FILTERS.DEPARTMENT],
    exportFormats: ['csv', 'excel'],
    scheduleable: true
  }
];

// Get reports by category
export const getReportsByCategory = (category: string) => {
  return REPORT_REGISTRY.filter(report => report.category === category);
};

// Get report by ID
export const getReportById = (id: string) => {
  return REPORT_REGISTRY.find(report => report.id === id);
};

// Get all categories with report counts
export const getCategoriesWithCounts = () => {
  const categories = Object.values(REPORT_CATEGORIES);
  return categories.map(category => ({
    name: category,
    count: getReportsByCategory(category).length
  }));
};