/**
 * MinimumWageTracker - Component for tracking minimum wage compliance
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useWageChecks } from '../hooks/useWageCompliance';

export const MinimumWageTracker: React.FC = () => {
  const { wageChecks, loading } = useWageChecks();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minimum Wage Compliance</CardTitle>
          <CardDescription>
            Monitor compliance with federal, state, and local minimum wage requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'violation':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge variant="default" className="bg-green-100 text-green-800">Compliant</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'violation':
        return <Badge variant="destructive">Violation</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const violations = wageChecks.filter(check => check.status === 'violation');
  const warnings = wageChecks.filter(check => check.status === 'warning');

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wageChecks.length}</div>
            <p className="text-xs text-muted-foreground">
              Under minimum wage monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{violations.length}</div>
            <p className="text-xs text-muted-foreground">
              Below minimum wage requirements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warnings.length}</div>
            <p className="text-xs text-muted-foreground">
              Within $1.00 of minimum wage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Violations Alert */}
      {violations.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{violations.length} employees</strong> are currently being paid below minimum wage requirements.
            Immediate action required to avoid penalties and legal issues.
          </AlertDescription>
        </Alert>
      )}

      {/* Employee Wage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Wage Analysis</CardTitle>
          <CardDescription>
            Current wages compared to applicable minimum wage requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Current Wage</TableHead>
                <TableHead>Minimum Required</TableHead>
                <TableHead>Difference</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wageChecks.map((check) => (
                <TableRow key={check.employeeId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(check.status)}
                      <span className="font-medium">{check.employeeName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {check.jurisdiction}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">${check.currentWage.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono">${check.minimumRequired.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`font-mono ${
                        check.difference < 0 ? 'text-red-600' : 
                        check.difference < 1 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}
                    >
                      {check.difference >= 0 ? '+' : ''}${check.difference.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(check.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Guidance */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Guidance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <h4 className="font-medium">Federal Minimum Wage</h4>
            <p className="text-muted-foreground">
              Current federal minimum wage is $7.25/hour. States and localities may have higher requirements.
            </p>
          </div>
          <div className="text-sm">
            <h4 className="font-medium">State Requirements</h4>
            <p className="text-muted-foreground">
              Many states have minimum wages higher than federal. Always pay the highest applicable rate.
            </p>
          </div>
          <div className="text-sm">
            <h4 className="font-medium">Local Ordinances</h4>
            <p className="text-muted-foreground">
              Cities and counties may have additional requirements. Check local laws in each work location.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};