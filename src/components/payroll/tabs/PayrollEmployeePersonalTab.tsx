import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PayrollEmployeePersonalTabProps {
  employee: any;
}

export const PayrollEmployeePersonalTab: React.FC<PayrollEmployeePersonalTabProps> = ({ employee }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Legal Name</label>
              <p>{employee.legal_first_name} {employee.legal_middle_name} {employee.legal_last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Preferred Name</label>
              <p>{employee.preferred_name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p>{employee.personal_email || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <p>{employee.mobile_phone || 'Not set'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};