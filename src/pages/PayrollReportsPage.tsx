import React, { useState } from "react";
import { PayrollReports } from "@/domains/payroll/components/PayrollReports";
import { Button } from "@/components/ui/button";


export const PayrollReportsPage = () => {
  // Mock data - in real app this would come from context or props
  const mockPayrollSummary = {
    total_employees: 0,
    total_classes: 0,
    total_hours: 0,
    total_overtime_hours: 0,
    total_gross_pay: 0,
    pending_periods: 0,
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Reports 📊</h1>
          <p className="text-muted-foreground">Generate and view comprehensive payroll reports</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">Payroll Reports</span>
        </div>
      </div>
      <PayrollReports 
        selectedPeriod={null}
        payrollSummary={mockPayrollSummary}
      />
    </div>
  );
};