import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PayrollEmployeeDocumentsTabProps {
  employeeId: string;
}

export const PayrollEmployeeDocumentsTab: React.FC<PayrollEmployeeDocumentsTabProps> = ({ employeeId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Document management coming soon...</p>
      </CardContent>
    </Card>
  );
};