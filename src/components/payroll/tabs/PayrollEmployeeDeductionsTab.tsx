import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PayrollEmployeeDeductionsTabProps {
  employeeId: string;
}

export const PayrollEmployeeDeductionsTab: React.FC<PayrollEmployeeDeductionsTabProps> = ({ employeeId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Deductions & Benefits</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Deductions management coming soon...</p>
      </CardContent>
    </Card>
  );
};