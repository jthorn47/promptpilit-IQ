# HaaLO Payroll System - Guided Tour Scripts

*Interactive product tours for seamless user onboarding*

---

## 🚀 Module: PayrollDashboard

```json
[
  {
    "step": 1,
    "title": "Welcome to Your Payroll Command Center",
    "description": "This dashboard provides a complete overview of your payroll operations, recent activity, and quick access to all essential functions.",
    "elementSelector": "#payroll-dashboard-header",
    "action": "Take a moment to familiarize yourself with the layout"
  },
  {
    "step": 2,
    "title": "Current Pay Period Overview",
    "description": "These cards show your active pay period, total employees, and current processing status. Green means everything is on track!",
    "elementSelector": ".pay-period-summary-cards",
    "action": "Review the current metrics"
  },
  {
    "step": 3,
    "title": "Quick Actions Hub",
    "description": "Access your most common tasks directly from here: start a new payroll, process time entries, or generate reports.",
    "elementSelector": ".quick-actions-section",
    "action": "Click 'Start New Payroll' to begin"
  },
  {
    "step": 4,
    "title": "Recent Activity Feed",
    "description": "Stay informed with real-time updates on payroll processing, approvals, and system notifications.",
    "elementSelector": ".activity-timeline",
    "action": "Scroll to see recent payroll events"
  },
  {
    "step": 5,
    "title": "Upcoming Deadlines",
    "description": "Never miss important dates! This section highlights tax filing deadlines, pay periods, and compliance requirements.",
    "elementSelector": ".deadlines-widget",
    "action": "Set reminders for critical dates"
  }
]
```

---

## 💼 Module: PayrollProcessing

```json
[
  {
    "step": 1,
    "title": "Payroll Processing Workflow",
    "description": "This is your central hub for managing the complete payroll cycle from time entry validation to final approval.",
    "elementSelector": "#payroll-processing-container",
    "action": "Review the current processing queue"
  },
  {
    "step": 2,
    "title": "Employee Selection & Filtering",
    "description": "Filter employees by department, status, or pay type to process specific groups. Use bulk selection for efficiency.",
    "elementSelector": ".employee-filter-controls",
    "action": "Try filtering by department"
  },
  {
    "step": 3,
    "title": "Time Entry Validation",
    "description": "Review and approve time entries before processing. Red flags indicate issues that need attention.",
    "elementSelector": ".time-entry-validation-grid",
    "action": "Click on any flagged entries to review"
  },
  {
    "step": 4,
    "title": "Calculation Preview",
    "description": "Preview gross pay, deductions, and net pay before final processing. Verify all calculations are accurate.",
    "elementSelector": ".payroll-calculation-preview",
    "action": "Review the calculation breakdown"
  },
  {
    "step": 5,
    "title": "Process & Approve",
    "description": "Once everything looks correct, process the payroll. This will generate pay stubs and prepare for ACH processing.",
    "elementSelector": "#process-payroll-btn",
    "action": "Click 'Process Payroll' when ready"
  }
]
```

---

## ⏰ Module: PayrollTimeEntry

```json
[
  {
    "step": 1,
    "title": "Time Entry Management",
    "description": "Manage employee time entries, approve hours, and handle time-off requests all in one place.",
    "elementSelector": "#time-entry-dashboard",
    "action": "Select a pay period to review"
  },
  {
    "step": 2,
    "title": "Employee Time Grid",
    "description": "View all employee time entries in an easy-to-read grid. Green checkmarks indicate approved entries.",
    "elementSelector": ".time-entry-grid",
    "action": "Click on any cell to edit hours"
  },
  {
    "step": 3,
    "title": "Overtime & Special Pay",
    "description": "Automatically calculated overtime appears highlighted. You can also add bonuses, commissions, or other special pay.",
    "elementSelector": ".overtime-indicators",
    "action": "Review overtime calculations"
  },
  {
    "step": 4,
    "title": "Approval Workflow",
    "description": "Approve individual entries or use bulk approval for multiple employees. Rejected entries require manager review.",
    "elementSelector": ".approval-controls",
    "action": "Use 'Approve All' for verified entries"
  },
  {
    "step": 5,
    "title": "Submit for Processing",
    "description": "Once all time entries are approved, submit them to payroll processing. This locks the entries for the pay period.",
    "elementSelector": "#submit-timesheet-btn",
    "action": "Click 'Submit to Payroll' when complete"
  }
]
```

---

## 📄 Module: PayStubGenerator

```json
[
  {
    "step": 1,
    "title": "Pay Stub Generation Center",
    "description": "Generate, customize, and distribute pay stubs for your employees. All pay stubs are automatically saved and archived.",
    "elementSelector": "#paystub-generator-main",
    "action": "Select employees for pay stub generation"
  },
  {
    "step": 2,
    "title": "Template Selection",
    "description": "Choose from professional pay stub templates or use your company's custom branded template.",
    "elementSelector": ".paystub-template-selector",
    "action": "Select your preferred template"
  },
  {
    "step": 3,
    "title": "Pay Stub Preview",
    "description": "Preview exactly how the pay stub will look before generating. Check all details including earnings, deductions, and year-to-date totals.",
    "elementSelector": ".paystub-preview-panel",
    "action": "Review the preview for accuracy"
  },
  {
    "step": 4,
    "title": "Bulk Generation Options",
    "description": "Generate pay stubs for all employees at once or select specific individuals. You can also schedule automatic generation.",
    "elementSelector": ".bulk-generation-controls",
    "action": "Choose 'Generate All' or select specific employees"
  },
  {
    "step": 5,
    "title": "Distribution Method",
    "description": "Email pay stubs directly to employees, download PDFs for printing, or make them available in the employee portal.",
    "elementSelector": ".distribution-options",
    "action": "Select your distribution method and click 'Generate'"
  }
]
```

---

## 🏦 Module: DirectDepositHandler

```json
[
  {
    "step": 1,
    "title": "Direct Deposit Management",
    "description": "Manage employee banking information and process direct deposit payments securely and efficiently.",
    "elementSelector": "#direct-deposit-container",
    "action": "Review employee banking status"
  },
  {
    "step": 2,
    "title": "Banking Information Verification",
    "description": "Verify all employee bank accounts are active and routing numbers are correct. Red indicators show accounts needing attention.",
    "elementSelector": ".banking-verification-grid",
    "action": "Click on any flagged accounts to review"
  },
  {
    "step": 3,
    "title": "Deposit Amount Summary",
    "description": "Review total deposit amounts by employee and verify the overall batch total before processing.",
    "elementSelector": ".deposit-summary-table",
    "action": "Confirm all amounts are correct"
  },
  {
    "step": 4,
    "title": "ACH Batch Creation",
    "description": "Create a secure ACH batch file for your bank. This file contains all direct deposit instructions for the pay period.",
    "elementSelector": ".ach-batch-controls",
    "action": "Click 'Create ACH Batch' to generate"
  },
  {
    "step": 5,
    "title": "Bank File Download",
    "description": "Download the encrypted ACH file to submit to your bank. The file follows NACHA standards for secure processing.",
    "elementSelector": "#download-ach-file-btn",
    "action": "Download and submit to your bank"
  }
]
```

---

## 📊 Module: TaxFilingEngine

```json
[
  {
    "step": 1,
    "title": "Tax Compliance Center",
    "description": "Manage all tax-related activities including withholdings, filings, and compliance reporting from this central hub.",
    "elementSelector": "#tax-filing-dashboard",
    "action": "Review current tax obligations"
  },
  {
    "step": 2,
    "title": "Tax Calculation Review",
    "description": "Verify federal, state, and local tax calculations are accurate. The system uses current tax tables and rates automatically.",
    "elementSelector": ".tax-calculations-grid",
    "action": "Review calculated tax amounts"
  },
  {
    "step": 3,
    "title": "Filing Schedule",
    "description": "View upcoming tax filing deadlines and submission requirements. Set reminders to ensure timely compliance.",
    "elementSelector": ".tax-filing-calendar",
    "action": "Mark important filing dates"
  },
  {
    "step": 4,
    "title": "Generate Tax Reports",
    "description": "Create required tax reports including 941s, state unemployment, and local tax filings. All forms are pre-populated with your data.",
    "elementSelector": ".tax-report-generator",
    "action": "Select the reports you need to generate"
  },
  {
    "step": 5,
    "title": "Electronic Filing",
    "description": "Submit tax filings electronically where available, or download forms for manual submission. Track submission status here.",
    "elementSelector": ".electronic-filing-panel",
    "action": "Choose your filing method and submit"
  }
]
```

---

## 🔄 Module: ACHProcessingPage

```json
[
  {
    "step": 1,
    "title": "ACH Processing Center",
    "description": "Process all electronic payments including direct deposits, tax payments, and vendor payments through secure ACH transfers.",
    "elementSelector": "#ach-processing-main",
    "action": "Review pending ACH batches"
  },
  {
    "step": 2,
    "title": "Batch Queue Management",
    "description": "View all pending ACH batches organized by type and priority. Process batches in the correct order for optimal cash flow.",
    "elementSelector": ".ach-batch-queue",
    "action": "Select a batch to process"
  },
  {
    "step": 3,
    "title": "NACHA File Validation",
    "description": "The system automatically validates ACH files for NACHA compliance before processing. Any errors will be highlighted here.",
    "elementSelector": ".nacha-validation-panel",
    "action": "Review validation results"
  },
  {
    "step": 4,
    "title": "Processing Schedule",
    "description": "Schedule when ACH transactions should be processed. Consider bank cutoff times and employee pay date requirements.",
    "elementSelector": ".processing-schedule-controls",
    "action": "Set your processing date and time"
  },
  {
    "step": 5,
    "title": "Submit to Bank",
    "description": "Submit approved ACH batches to your bank for processing. Track submission status and receive confirmation notifications.",
    "elementSelector": "#submit-ach-batch-btn",
    "action": "Click 'Submit Batch' to process payments"
  }
]
```

---

## 👑 Module: SuperAdminPayrollProcessing

```json
[
  {
    "step": 1,
    "title": "Super Admin Control Center",
    "description": "Welcome to the master payroll dashboard. Monitor and manage payroll operations across all clients from this central command center.",
    "elementSelector": "#super-admin-dashboard",
    "action": "Review the system-wide overview"
  },
  {
    "step": 2,
    "title": "Multi-Client Processing Queue",
    "description": "View payroll processing status across all clients. Priority indicators help you focus on urgent items first.",
    "elementSelector": ".multi-client-queue-grid",
    "action": "Click on any client to drill down"
  },
  {
    "step": 3,
    "title": "Approval Workflow Management",
    "description": "Review and approve payroll runs across multiple clients. Use bulk approval tools for efficiency while maintaining oversight.",
    "elementSelector": ".approval-workflow-panel",
    "action": "Review pending approvals"
  },
  {
    "step": 4,
    "title": "System Health Monitoring",
    "description": "Monitor edge function performance, database health, and processing capacity in real-time. Address any alerts immediately.",
    "elementSelector": ".system-health-dashboard",
    "action": "Check all systems are green"
  },
  {
    "step": 5,
    "title": "Emergency Controls",
    "description": "Access emergency stop functions, system overrides, and escalation tools. Use these controls only when necessary.",
    "elementSelector": ".emergency-controls-section",
    "action": "Familiarize yourself with emergency procedures"
  },
  {
    "step": 6,
    "title": "Global Analytics",
    "description": "Access comprehensive analytics across all clients including processing metrics, error rates, and performance trends.",
    "elementSelector": ".global-analytics-panel",
    "action": "Review key performance indicators"
  }
]
```

---

## 🎨 Tour Integration Guidelines

### **Implementation Notes**
- **Framework Compatibility:** Scripts work with Intro.js, Shepherd.js, Driver.js, and similar tour libraries
- **Responsive Design:** All element selectors should work across desktop, tablet, and mobile views
- **Accessibility:** Include ARIA labels and keyboard navigation support
- **Customization:** Modify descriptions and selectors to match your exact component structure

### **CSS Selector Guidelines**
```css
/* Ensure tour-targeted elements have stable selectors */
#payroll-dashboard-header { /* Main headers */ }
.summary-metrics { /* Metric cards */ }
.quick-actions-section { /* Action button groups */ }
.activity-timeline { /* Activity feeds */ }
.deadlines-widget { /* Deadline components */ }

/* Add data attributes for stability */
[data-tour="step-1"] { /* Tour-specific targeting */ }
[data-testid="payroll-button"] { /* Test-friendly selectors */ }
```

### **Brand Voice Guidelines**
- **Tone:** Professional, helpful, encouraging
- **Language:** Clear, action-oriented, jargon-free
- **Length:** Keep descriptions under 25 words for optimal readability
- **Personality:** Confident guide, not overwhelming teacher

### **Deployment Checklist**
- [ ] Test all element selectors in development
- [ ] Verify tour flow on different screen sizes
- [ ] Include skip/exit options for experienced users
- [ ] Add progress indicators for longer tours
- [ ] Test with screen readers for accessibility
- [ ] Create tour completion tracking for analytics

---

*Tour Scripts Version: 1.0*
*Last Updated: July 19, 2025*
*Compatible with: Intro.js v6+, Shepherd.js v10+, Driver.js v1+*