/**
 * Batch Dashboard Component
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  PlayCircle, 
  PauseCircle, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Users,
  DollarSign,
  Clock
} from 'lucide-react';

interface BatchSummary {
  id: string;
  name: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  employeeCount: number;
  totalAmount: number;
  payDate: string;
  createdAt: string;
}

const BatchDashboard: React.FC = () => {
  // Mock data - in real implementation, this would come from API
  const recentBatches: BatchSummary[] = [
    {
      id: '1',
      name: 'Weekly Payroll - Week 03/2024',
      status: 'completed',
      employeeCount: 42,
      totalAmount: 125750.00,
      payDate: '2024-01-19',
      createdAt: '2024-01-17'
    },
    {
      id: '2',
      name: 'Bonus Payroll - Q4 2023',
      status: 'processing',
      employeeCount: 38,
      totalAmount: 85000.00,
      payDate: '2024-01-20',
      createdAt: '2024-01-18'
    },
    {
      id: '3',
      name: 'Weekly Payroll - Week 02/2024',
      status: 'failed',
      employeeCount: 42,
      totalAmount: 123900.00,
      payDate: '2024-01-12',
      createdAt: '2024-01-10'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary"><PlayCircle className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'draft':
        return <Badge variant="outline"><PauseCircle className="w-3 h-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Batch Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor payroll batch processing</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create New Batch
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 processing, 1 pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">122</div>
            <p className="text-xs text-muted-foreground">Across all active batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$334.6K</div>
            <p className="text-xs text-muted-foreground">This pay period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Pay Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jan 26</div>
            <p className="text-xs text-muted-foreground">5 days remaining</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payroll Batches</CardTitle>
          <CardDescription>Monitor the status and details of your payroll batches</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Pay Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell>{getStatusBadge(batch.status)}</TableCell>
                  <TableCell>{batch.employeeCount}</TableCell>
                  <TableCell>{formatCurrency(batch.totalAmount)}</TableCell>
                  <TableCell>{formatDate(batch.payDate)}</TableCell>
                  <TableCell>{formatDate(batch.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">View</Button>
                      {batch.status === 'failed' && (
                        <Button variant="outline" size="sm">Retry</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common payroll batch operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Plus className="w-6 h-6" />
              <span>Create Regular Payroll</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <DollarSign className="w-6 h-6" />
              <span>Create Bonus Batch</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Clock className="w-6 h-6" />
              <span>View Processing Queue</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchDashboard;