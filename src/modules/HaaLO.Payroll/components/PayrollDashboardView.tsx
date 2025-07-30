/**
 * Payroll Dashboard View Component
 * Main dashboard view for payroll overview
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  PlayCircle,
  FileText,
  Calendar
} from 'lucide-react';

import type { 
  PayrollDashboardData, 
  PayrollEmployee,
  PayrollUserPermissions 
} from '../types/PayrollMicroservice';

interface PayrollDashboardViewProps {
  dashboard: PayrollDashboardData | undefined;
  employees: PayrollEmployee[];
  permissions: PayrollUserPermissions;
  onRunPayroll: () => void;
  onViewPayStub: (payStubId: string) => void;
}

const PayrollDashboardView: React.FC<PayrollDashboardViewProps> = ({
  dashboard,
  employees,
  permissions,
  onRunPayroll,
  onViewPayStub
}) => {
  if (!dashboard) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Period */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboard.current_period ? (
              <div>
                <div className="text-2xl font-bold">
                  {new Date(dashboard.current_period.start_date).toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  to {new Date(dashboard.current_period.end_date).toLocaleDateString()}
                </p>
                <Badge 
                  variant={dashboard.current_period.status === 'draft' ? 'default' : 'secondary'}
                  className="mt-2"
                >
                  {dashboard.current_period.status}
                </Badge>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No active period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Adjustments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Adjustments</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.pending_adjustments_count}</div>
            <p className="text-xs text-muted-foreground">
              requiring review
            </p>
          </CardContent>
        </Card>

        {/* Time Entries Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Entries</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboard.time_entries_summary.total_hours.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard.time_entries_summary.pending_approvals} pending approval
            </p>
          </CardContent>
        </Card>

        {/* Active Employees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              employees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warnings and Alerts */}
      {dashboard.warnings && dashboard.warnings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Warnings & Alerts</h3>
          {dashboard.warnings.map((warning, index) => (
            <Alert key={index} variant={warning.type === 'error' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{warning.employee_name}:</strong> {warning.message}
                {warning.suggested_action && (
                  <div className="mt-1 text-sm">
                    Suggested: {warning.suggested_action}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Recent Payroll Runs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Payroll Runs
          </CardTitle>
          <CardDescription>
            Latest payroll processing activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboard.recent_runs && dashboard.recent_runs.length > 0 ? (
            <div className="space-y-3">
              {dashboard.recent_runs.map((run) => (
                <div 
                  key={run.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">
                        {new Date(run.pay_date).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {run.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${run.total_gross?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {run.employee_count} employees
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No recent payroll runs found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {permissions.canRunPayroll && (
        <div className="flex gap-4">
          <Button onClick={onRunPayroll} className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            Start Payroll Run
          </Button>
          {permissions.canEditTime && (
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Manage Time Entries
            </Button>
          )}
          {permissions.canManageSettings && (
            <Button variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              Pay Adjustments
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PayrollDashboardView;