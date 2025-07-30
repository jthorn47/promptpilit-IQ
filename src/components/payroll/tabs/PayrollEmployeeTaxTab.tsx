import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PayrollEmployeeTaxTabProps {
  employee: any;
}

export const PayrollEmployeeTaxTab: React.FC<PayrollEmployeeTaxTabProps> = ({ employee }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Tax Classification</label>
            <p className="uppercase">{employee.tax_classification}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Federal Exempt</label>
            <p>{employee.is_exempt_federal ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <label className="text-sm font-medium">State Exempt</label>
            <p>{employee.is_exempt_state ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};