import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PayrollEmployeeJobTabProps {
  employee: any;
}

export const PayrollEmployeeJobTab: React.FC<PayrollEmployeeJobTabProps> = ({ employee }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job & Organization Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Job Title</label>
            <p>{employee.job_title || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Department</label>
            <p>{employee.department || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Hire Type</label>
            <p className="capitalize">{employee.hire_type}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Employee Number</label>
            <p>{employee.employee_number || 'Not set'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};