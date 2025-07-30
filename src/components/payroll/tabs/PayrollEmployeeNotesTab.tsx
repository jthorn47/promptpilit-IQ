import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PayrollEmployeeNotesTabProps {
  employeeId: string;
}

export const PayrollEmployeeNotesTab: React.FC<PayrollEmployeeNotesTabProps> = ({ employeeId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Notes management coming soon...</p>
      </CardContent>
    </Card>
  );
};