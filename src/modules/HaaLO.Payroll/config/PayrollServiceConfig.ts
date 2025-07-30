/**
 * HaaLO Payroll Microservice Configuration
 * Central configuration for all payroll operations
 */

export const PayrollServiceConfig = {
  // Module Information
  MODULE_ID: 'haalo-payroll',
  MODULE_NAME: 'HaaLO Payroll Processing',
  VERSION: '2.0.0',
  
  // Edge Functions
  EDGE_FUNCTIONS: {
    GENERATE_PAY_STUBS: 'generate-pay-stubs',
    CALCULATE_TAX_WITHHOLDINGS: 'calculate-tax-withholdings',
    ANALYZE_PAYROLL_REPORT: 'analyze-payroll-report',
    MOCK_PAYROLL_CALCULATOR: 'mock-payroll-calculator'
  },
  
  // Database Tables
  TABLES: {
    PAYROLL_PERIODS: 'payroll_periods',
    PAYROLL_EMPLOYEES: 'payroll_employees',
    PAYROLL_TIME_ENTRIES: 'payroll_time_entries',
    PAYROLL_ADJUSTMENTS: 'payroll_adjustments',
    PAYROLL_CALCULATIONS: 'payroll_calculations',
    PAYROLL_RUNS: 'payroll_runs',
    PAYROLL_AUDIT_TRAIL: 'payroll_audit_trail',
    PAY_STUBS: 'pay_stubs'
  },
  
  // Validation Rules
  VALIDATION: {
    MAX_HOURS_PER_DAY: 24,
    MAX_HOURS_PER_WEEK: 168,
    MIN_PAY_RATE: 0.01,
    OVERTIME_THRESHOLD: 40,
    DOUBLE_TIME_THRESHOLD: 60,
    MAX_ADJUSTMENT_AMOUNT: 10000,
    APPROVAL_REQUIRED_THRESHOLD: 1000
  },
  
  // Workflow Steps
  WORKFLOW_STEPS: [
    {
      id: 'precheck',
      name: 'Pre-run Validation',
      description: 'Validate time entries and employee data',
      required: true,
      order: 1
    },
    {
      id: 'review_time',
      name: 'Review Time Entries',
      description: 'Review and edit time entries if needed',
      required: false,
      order: 2
    },
    {
      id: 'apply_adjustments',
      name: 'Apply Adjustments',
      description: 'Apply bonuses, deductions, and corrections',
      required: false,
      order: 3
    },
    {
      id: 'calculate',
      name: 'Calculate Payroll',
      description: 'Calculate gross pay, taxes, and deductions',
      required: true,
      order: 4
    },
    {
      id: 'preview',
      name: 'Preview Results',
      description: 'Review calculated payroll before approval',
      required: true,
      order: 5
    },
    {
      id: 'approve',
      name: 'Approval',
      description: 'Get required approvals for payroll run',
      required: true,
      order: 6
    },
    {
      id: 'generate_stubs',
      name: 'Generate Pay Stubs',
      description: 'Generate pay stubs for all employees',
      required: true,
      order: 7
    },
    {
      id: 'finalize',
      name: 'Finalize Run',
      description: 'Complete payroll run and update records',
      required: true,
      order: 8
    }
  ],
  
  // Status Mappings
  STATUS_COLORS: {
    draft: '#6b7280',
    processing: '#f59e0b',
    review: '#3b82f6',
    approved: '#10b981',
    completed: '#059669',
    error: '#ef4444',
    cancelled: '#6b7280'
  },
  
  // Permissions Configuration
  PERMISSIONS: {
    VIEW: ['super_admin', 'company_admin', 'payroll_admin', 'payroll_user'],
    RUN_PAYROLL: ['super_admin', 'company_admin', 'payroll_admin'],
    APPROVE: ['super_admin', 'company_admin'],
    EDIT_TIME: ['super_admin', 'company_admin', 'payroll_admin'],
    MANAGE_SETTINGS: ['super_admin', 'company_admin'],
    OVERRIDE: ['super_admin']
  },
  
  // API Endpoints
  API_ENDPOINTS: {
    BASE: '/api/v1/payroll',
    PERIODS: '/periods',
    EMPLOYEES: '/employees',
    TIME_ENTRIES: '/time-entries',
    ADJUSTMENTS: '/adjustments',
    RUNS: '/runs',
    PAY_STUBS: '/pay-stubs',
    REPORTS: '/reports'
  },
  
  // Cache Configuration
  CACHE: {
    DASHBOARD_TTL: 5 * 60 * 1000, // 5 minutes
    SETTINGS_TTL: 30 * 60 * 1000, // 30 minutes
    EMPLOYEES_TTL: 15 * 60 * 1000, // 15 minutes
    PERIODS_TTL: 60 * 60 * 1000 // 1 hour
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    MISSING_TIME_ENTRIES: 'Missing time entries for pay period',
    NEGATIVE_HOURS: 'Negative hours are not allowed',
    ZERO_PAY: 'Employee has zero pay for this period',
    APPROVAL_REQUIRED: 'Adjustment amount requires manager approval',
    PERIOD_LOCKED: 'Pay period is locked and cannot be modified',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action'
  }
} as const;

export type PayrollServiceConfigType = typeof PayrollServiceConfig;