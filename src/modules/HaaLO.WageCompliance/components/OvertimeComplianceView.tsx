/**
 * OvertimeComplianceView - Component for tracking overtime compliance
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, AlertTriangle, DollarSign, Loader2 } from 'lucide-react';
import { useOvertimeViolations } from '../hooks/useWageCompliance';

export const OvertimeComplianceView: React.FC = () => {
  const { violations, loading } = useOvertimeViolations();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overtime Compliance</CardTitle>
          <CardDescription>Monitor overtime violations and owed compensation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalOwed = violations.reduce((sum, v) => sum + v.overtimeOwed, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{violations.length}</div>
            <p className="text-xs text-muted-foreground">Overtime violations found</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Owed</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalOwed.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">In unpaid overtime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affected Employees</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(violations.map(v => v.employeeId)).size}
            </div>
            <p className="text-xs text-muted-foreground">Employees with violations</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overtime Violations</CardTitle>
          <CardDescription>Unpaid overtime by employee and pay period</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Pay Period</TableHead>
                <TableHead>Hours Worked</TableHead>
                <TableHead>Overtime Hours</TableHead>
                <TableHead>Overtime Paid</TableHead>
                <TableHead>Amount Owed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {violations.map((violation, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{violation.employeeName}</TableCell>
                  <TableCell>
                    {violation.payPeriodStart.toLocaleDateString()} - {violation.payPeriodEnd.toLocaleDateString()}
                  </TableCell>
                  <TableCell>{violation.hoursWorked}</TableCell>
                  <TableCell>{violation.overtimeHours}</TableCell>
                  <TableCell>{violation.overtimePaid}</TableCell>
                  <TableCell className="font-mono text-red-600">
                    ${violation.overtimeOwed.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={violation.status === 'violation' ? 'destructive' : 'secondary'}>
                      {violation.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};