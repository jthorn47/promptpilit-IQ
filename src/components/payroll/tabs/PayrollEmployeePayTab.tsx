import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PayrollEmployeePayTabProps {
  employee: any;
}

export const PayrollEmployeePayTab: React.FC<PayrollEmployeePayTabProps> = ({ employee }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Pay Type</label>
            <p className="capitalize">{employee.pay_type}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Pay Frequency</label>
            <p className="capitalize">{employee.pay_frequency.replace('_', ' ')}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Compensation Rate</label>
            <p>${employee.compensation_rate.toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Overtime Eligible</label>
            <p>{employee.overtime_eligible ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};