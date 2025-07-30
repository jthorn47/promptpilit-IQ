import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  Eye, 
  Filter, 
  Plus, 
  Users, 
  DollarSign,
  Calendar,
  TrendingUp,
  Search
} from 'lucide-react';
import { usePayStubs, usePayStubMetrics, useDownloadPayStub, useBatchPayStubOperation } from '../hooks/usePayStubs';
import { PayStubSearchFilters } from '../types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';

const AdminPayStubDashboard = () => {
  const [filters, setFilters] = useState<PayStubSearchFilters>({});
  const [selectedStubs, setSelectedStubs] = useState<string[]>([]);
  
  const { data: payStubs, isLoading } = usePayStubs(filters);
  const { data: metrics } = usePayStubMetrics('current-company'); // TODO: Get actual company ID
  const downloadPayStub = useDownloadPayStub();
  const batchOperation = useBatchPayStubOperation();

  const handleFilterChange = (key: keyof PayStubSearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleSelectStub = (stubId: string, checked: boolean) => {
    setSelectedStubs(prev => 
      checked 
        ? [...prev, stubId]
        : prev.filter(id => id !== stubId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedStubs(checked ? payStubs?.map(stub => stub.id) || [] : []);
  };

  const handleBatchDownload = () => {
    if (selectedStubs.length === 0) return;
    
    batchOperation.mutate({
      operation: 'download',
      pay_stub_ids: selectedStubs,
      options: {
        pdf_options: { format: 'A4', orientation: 'portrait' }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800';
      case 'pdf_ready': return 'bg-green-100 text-green-800';
      case 'emailed': return 'bg-purple-100 text-purple-800';
      case 'viewed': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pay Stub Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and generate employee pay stubs
          </p>
        </div>
        <Link to="/admin/payroll/paystubs/generate">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generate Pay Stubs
          </Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Generated</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_generated}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_downloaded}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.employee_count}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metrics.total_payroll_amount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={filters.employee_name || ''}
                  onChange={(e) => handleFilterChange('employee_name', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="generated">Generated</SelectItem>
                  <SelectItem value="pdf_ready">PDF Ready</SelectItem>
                  <SelectItem value="emailed">Emailed</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Pay Date From</label>
              <Input
                type="date"
                value={filters.pay_date_start || ''}
                onChange={(e) => handleFilterChange('pay_date_start', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Pay Date To</label>
              <Input
                type="date"
                value={filters.pay_date_end || ''}
                onChange={(e) => handleFilterChange('pay_date_end', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      {selectedStubs.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedStubs.length} pay stubs selected
              </span>
              <Button
                onClick={handleBatchDownload}
                disabled={batchOperation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pay Stubs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pay Stubs</CardTitle>
          <CardDescription>
            {payStubs?.length || 0} pay stubs found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : payStubs?.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No pay stubs found matching your criteria
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedStubs.length === payStubs?.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Stub Number</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payStubs?.map((stub) => (
                  <TableRow key={stub.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStubs.includes(stub.id)}
                        onCheckedChange={(checked) => handleSelectStub(stub.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {stub.stub_number}
                    </TableCell>
                    <TableCell>
                      {Array.isArray(stub.employees) ? stub.employees[0]?.instructor_name : 'Unknown Employee'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(stub.pay_period_start), 'MMM d')} - {format(new Date(stub.pay_period_end), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(stub.pay_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      ${stub.gross_pay.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      ${stub.net_pay.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(stub.status)}>
                        {stub.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/payroll/paystubs/${stub.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadPayStub.mutate(stub.id)}
                          disabled={downloadPayStub.isPending}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayStubDashboard;