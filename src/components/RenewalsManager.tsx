import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const RenewalsManager: React.FC = () => {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data - replace with real API call
  useEffect(() => {
    const mockRenewals = [
      {
        id: '1',
        employee_name: 'John Smith',
        training_module: 'Workplace Violence Prevention',
        original_completion: '2023-06-15',
        renewal_due: '2024-06-15',
        status: 'due_soon',
        days_remaining: 15
      },
      {
        id: '2',
        employee_name: 'Jane Doe',
        training_module: 'Sexual Harassment Prevention',
        original_completion: '2023-05-10',
        renewal_due: '2024-05-10',
        status: 'overdue',
        days_remaining: -5
      },
      {
        id: '3',
        employee_name: 'Mike Johnson',
        training_module: 'Safety Training',
        original_completion: '2023-08-20',
        renewal_due: '2024-08-20',
        status: 'upcoming',
        days_remaining: 90
      }
    ];

    setTimeout(() => {
      setRenewals(mockRenewals);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'due_soon':
        return <Badge variant="secondary">Due Soon</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRenewal = (renewalId: string) => {
    toast({
      title: "Renewal Initiated",
      description: "Training renewal has been assigned to the employee."
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Renewals</h1>
          <p className="text-muted-foreground">
            Manage and track training renewal requirements
          </p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">1</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">1</div>
            <p className="text-xs text-muted-foreground">Due within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">1</div>
            <p className="text-xs text-muted-foreground">Due in future</p>
          </CardContent>
        </Card>
      </div>

      {/* Renewals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Training Module</TableHead>
                <TableHead>Original Completion</TableHead>
                <TableHead>Renewal Due</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renewals.map((renewal) => (
                <TableRow key={renewal.id}>
                  <TableCell className="font-medium">{renewal.employee_name}</TableCell>
                  <TableCell>{renewal.training_module}</TableCell>
                  <TableCell>{new Date(renewal.original_completion).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(renewal.renewal_due).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      renewal.days_remaining < 0 ? 'text-destructive' : 
                      renewal.days_remaining <= 30 ? 'text-orange-500' : 'text-blue-500'
                    }`}>
                      {renewal.days_remaining > 0 ? `${renewal.days_remaining} days` : `${Math.abs(renewal.days_remaining)} days overdue`}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(renewal.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRenewal(renewal.id)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Renew
                    </Button>
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