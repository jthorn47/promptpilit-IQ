/**
 * Payroll History Table Component
 * Displays historical payroll runs and pay stubs
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Eye, 
  Download, 
  Search, 
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';

import { usePayrollContext } from '../hooks/usePayrollMicroservice';

interface PayrollHistoryTableProps {
  companyId: string;
  onViewPayStub: (payStubId: string) => void;
  onViewDetails: (runId: string) => void;
}

const PayrollHistoryTable: React.FC<PayrollHistoryTableProps> = ({
  companyId,
  onViewPayStub,
  onViewDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const { dashboard } = usePayrollContext(companyId);

  // Mock data for demonstration - would come from API
  const mockPayrollRuns = [
    {
      id: '1',
      run_date: '2024-01-15',
      period_start: '2024-01-01',
      period_end: '2024-01-15',
      status: 'completed',
      employee_count: 12,
      total_gross_amount: 25430,
      total_net_amount: 17801,
      created_by: 'admin@company.com'
    },
    {
      id: '2',
      run_date: '2024-01-01',
      period_start: '2023-12-16',
      period_end: '2023-12-31',
      status: 'completed',
      employee_count: 11,
      total_gross_amount: 23200,
      total_net_amount: 16240,
      created_by: 'admin@company.com'
    },
    {
      id: '3',
      run_date: '2023-12-16',
      period_start: '2023-12-01',
      period_end: '2023-12-15',
      status: 'approved',
      employee_count: 11,
      total_gross_amount: 24100,
      total_net_amount: 16870,
      created_by: 'admin@company.com'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      processing: { variant: 'default' as const, label: 'Processing' },
      approved: { variant: 'default' as const, label: 'Approved' },
      completed: { variant: 'default' as const, label: 'Completed' },
      error: { variant: 'destructive' as const, label: 'Error' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredRuns = mockPayrollRuns.filter(run => {
    const matchesSearch = searchTerm === '' || 
      run.run_date.includes(searchTerm) ||
      run.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || run.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payroll History
          </CardTitle>
          <CardDescription>
            View and manage historical payroll runs and pay stubs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by date or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="error">Error</option>
            </select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Runs</CardTitle>
          <CardDescription>
            Historical payroll processing runs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run Date</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Gross Amount</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">
                      {new Date(run.run_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(run.period_start).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          to {new Date(run.period_end).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(run.status)}
                    </TableCell>
                    <TableCell>{run.employee_count}</TableCell>
                    <TableCell className="font-medium">
                      ${run.total_gross_amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${run.total_net_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(run.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Mock pay stub ID
                            onViewPayStub(`stub-${run.id}-001`);
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Stubs
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredRuns.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No payroll runs match your search criteria'
                  : 'No payroll runs found'
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollHistoryTable;