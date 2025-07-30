
import React from 'react';
import { IQTooltip } from "@/components/ui/iq-tooltip";

export const PayrollTooltips = {
  TimeEntry: ({ children }: { children?: React.ReactNode }) => (
    <IQTooltip 
      content={
        <p>Enter your daily work hours for this pay period. Submit before the deadline to ensure timely payment.</p>
      }
      showBranding={true}
    >
      {children}
    </IQTooltip>
  ),

  PayStub: ({ children }: { children?: React.ReactNode }) => (
    <IQTooltip 
      content={
        <p>View your pay stub details including gross pay, deductions, and net pay. Click to download PDF.</p>
      }
      variant="accent"
    >
      {children}
    </IQTooltip>
  ),

  DirectDeposit: ({ children }: { children?: React.ReactNode }) => (
    <IQTooltip 
      content={
        <p>Set up direct deposit by entering your bank routing and account numbers. Changes take 1-2 pay cycles.</p>
      }
    >
      {children}
    </IQTooltip>
  ),

  TaxWithholding: ({ children }: { children?: React.ReactNode }) => (
    <IQTooltip 
      content={
        <p>Update your W-4 information to adjust federal and state tax withholdings. Changes apply to future paychecks.</p>
      }
    >
      {children}
    </IQTooltip>
  ),

  Benefits: ({ children }: { children?: React.ReactNode }) => (
    <IQTooltip 
      content={
        <p>Manage your benefit elections including health insurance, dental, vision, and retirement plans.</p>
      }
    >
      {children}
    </IQTooltip>
  ),

  PayrollCalculation: ({ children }: { children?: React.ReactNode }) => (
    <IQTooltip 
      content={
        <p>Automated payroll calculation including regular hours, overtime, taxes, and deductions based on current rates.</p>
      }
      showBranding={true}
    >
      {children}
    </IQTooltip>
  ),

  ACHProcessing: ({ children }: { children?: React.ReactNode }) => (
    <IQTooltip 
      content={
        <div>
          <p className="font-medium mb-1">Electronic Bank Transfer Processing</p>
          <p>NACHA-compliant file generation for secure payment delivery.</p>
        </div>
      }
      maxWidth="max-w-sm"
    >
      {children}
    </IQTooltip>
  ),

  PayrollApproval: ({ children }: { children?: React.ReactNode }) => (
    <IQTooltip 
      content={
        <p>Review and approve payroll calculations before processing. Verify employee hours, rates, and deductions.</p>
      }
    >
      {children}
    </IQTooltip>
  ),

  PayTypes: ({ children }: { children?: React.ReactNode }) => (
    <IQTooltip 
      content={
        <p>Configure different pay types including hourly, salary, overtime, bonuses, and commissions for your organization.</p>
      }
    >
      {children}
    </IQTooltip>
  ),

  ReportGeneration: ({ children }: { children?: React.ReactNode }) => (
    <IQTooltip 
      content={
        <p>Generate comprehensive payroll reports for accounting, compliance, and analysis. Export in multiple formats.</p>
      }
      showBranding={true}
    >
      {children}
    </IQTooltip>
  ),
};

export default PayrollTooltips;
