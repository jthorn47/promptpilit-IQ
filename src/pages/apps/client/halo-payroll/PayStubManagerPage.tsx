import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  Mail,
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  Archive,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  useRealPayStubs,
  useDownloadPayStubPDF as useDownloadPayStub,
  useBatchPayStubActions,
  usePayStubMetrics,
  useResendPayStub,
  usePayrollRuns 
} from '@/hooks/useEmployeePayStubs';
import type { PayStub, PayStubSearchFilters } from '@/modules/HaaLO.PayStubGenerator/types';

const PayStubManagerPage: React.FC = () => {
  const [selectedStubs, setSelectedStubs] = useState<string[]>([]);
  const [filters, setFilters] = useState<PayStubSearchFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayrollRun, setSelectedPayrollRun] = useState<string>('');

  // Fetch company ID from user profile
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch pay groups for filtering
  const { data: payGroups } = useQuery({
    queryKey: ['pay-groups'],
    queryFn: async () => {
      if (!userProfile?.company_id) return [];
      
      const { data, error } = await supabase
        .from('pay_groups')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.company_id
  });

  // Fetch payroll runs for grouping
  const { data: payrollRuns } = usePayrollRuns(userProfile?.company_id || '');

  // Fetch pay stubs with filters using real data
  const { data: payStubs, isLoading, refetch } = useRealPayStubs(
    userProfile?.company_id || '',
    {
      ...filters,
      employee_name: searchTerm || undefined,
      payroll_run_id: selectedPayrollRun || undefined
    }
  );

  // Fetch metrics
  const { data: metrics } = usePayStubMetrics(
    userProfile?.company_id || '',
    filters.pay_date_start && filters.pay_date_end 
      ? { start: filters.pay_date_start, end: filters.pay_date_end }
      : undefined
  );

  const downloadPayStub = useDownloadPayStub();
  const batchOperation = useBatchPayStubActions();
  const resendPayStub = useResendPayStub();

  const handleSelectStub = (stubId: string) => {
    setSelectedStubs(prev => 
      prev.includes(stubId) 
        ? prev.filter(id => id !== stubId)
        : [...prev, stubId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStubs.length === payStubs?.length) {
      setSelectedStubs([]);
    } else {
      setSelectedStubs(payStubs?.map(stub => stub.id) || []);
    }
  };

  const handleDownloadStub = async (stubId: string) => {
    try {
      await downloadPayStub.mutateAsync(stubId);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleResendStub = async (stubId: string, employeeEmail?: string) => {
    if (!employeeEmail) {
      toast.error('Employee email not found. Cannot send pay stub.');
      return;
    }
    
    try {
      await resendPayStub.mutateAsync({ stubId, employeeEmail });
    } catch (error) {
      console.error('Resend failed:', error);
    }
  };

  const handleBatchDownload = async () => {
    if (selectedStubs.length === 0) {
      toast.error('Please select pay stubs to download');
      return;
    }

    try {
      await batchOperation.mutateAsync({
        action: 'export_zip',
        stubIds: selectedStubs
      });
      setSelectedStubs([]);
    } catch (error) {
      console.error('Batch download failed:', error);
    }
  };

  const handleBatchEmail = async () => {
    if (selectedStubs.length === 0) {
      toast.error('Please select pay stubs to email');
      return;
    }

    try {
      await batchOperation.mutateAsync({
        action: 'email',
        stubIds: selectedStubs
      });
      setSelectedStubs([]);
    } catch (error) {
      console.error('Batch email failed:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'emailed':
        return <Mail className="h-4 w-4 text-info" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-primary" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'generated':
        return 'default';
      case 'emailed':
        return 'secondary';
      case 'viewed':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pay Stub Manager</h1>
          <p className="text-muted-foreground">
            Manage and distribute employee pay stubs
          </p>
        </div>
        <div className="flex gap-2">
          {selectedStubs.length > 0 && (
            <>
              <Button 
                variant="outline" 
                onClick={handleBatchDownload}
                disabled={batchOperation.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Selected ({selectedStubs.length})
              </Button>
              <Button 
                variant="outline"
                onClick={handleBatchEmail}
                disabled={batchOperation.isPending}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Selected ({selectedStubs.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-4">
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
              <CardTitle className="text-sm font-medium">Downloads</CardTitle>
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
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={selectedPayrollRun}
              onValueChange={setSelectedPayrollRun}
            >
              <SelectTrigger>
                <SelectValue placeholder="Payroll Run" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Runs</SelectItem>
                {payrollRuns?.map((run) => (
                  <SelectItem key={run.id} value={run.id}>
                    {format(new Date(run.start_date), 'MMM dd')} - {format(new Date(run.end_date), 'MMM dd, yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => 
                setFilters(prev => ({ ...prev, status: value as any }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="emailed">Emailed</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Start Date"
              value={filters.pay_date_start || ''}
              onChange={(e) => 
                setFilters(prev => ({ ...prev, pay_date_start: e.target.value }))
              }
            />
            <Input
              type="date"
              placeholder="End Date"
              value={filters.pay_date_end || ''}
              onChange={(e) => 
                setFilters(prev => ({ ...prev, pay_date_end: e.target.value }))
              }
            />
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({});
                setSearchTerm('');
                setSelectedPayrollRun('');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pay Stubs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pay Stubs</CardTitle>
          <CardDescription>
            {payStubs?.length || 0} pay stubs found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedStubs.length === payStubs?.length && payStubs.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border border-input"
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading pay stubs...
                    </TableCell>
                  </TableRow>
                ) : payStubs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No pay stubs found
                    </TableCell>
                  </TableRow>
                ) : (
                  payStubs?.map((stub) => (
                    <TableRow key={stub.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedStubs.includes(stub.id)}
                          onChange={() => handleSelectStub(stub.id)}
                          className="rounded border border-input"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{stub.employee_name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {stub.employee_id_number || stub.employee_id}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(stub.pay_period_start), 'MMM dd')} - {format(new Date(stub.pay_period_end), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Pay Date: {format(new Date(stub.pay_date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${stub.gross_pay.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        ${stub.total_deductions.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${stub.net_pay.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(stub.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(stub.status)}
                          {stub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownloadStub(stub.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResendStub(stub.id, stub.employee_email)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Resend via Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayStubManagerPage;