/**
 * Batch Viewer Component
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CheckCircle, 
  AlertCircle,
  Download,
  FileText,
  DollarSign,
  Users,
  Calendar,
  Clock,
  Eye,
  Edit,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

interface BatchDetail {
  id: string;
  name: string;
  status: 'completed' | 'failed' | 'processing';
  batchType: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  createdAt: string;
  createdBy: string;
  totalEmployees: number;
  processedEmployees: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalTaxes: number;
  totalDeductions: number;
  processingTime: string;
  completedAt?: string;
  errorCount: number;
}

interface EmployeeRecord {
  id: string;
  name: string;
  department: string;
  regularHours: number;
  overtimeHours: number;
  grossPay: number;
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  deductions: number;
  netPay: number;
  status: 'processed' | 'error' | 'pending';
  errorMessage?: string;
}

const BatchViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'reports'>('overview');

  // Mock batch data
  const batchDetail: BatchDetail = {
    id: 'batch_001',
    name: 'Weekly Payroll - Week 04/2024',
    status: 'completed',
    batchType: 'Regular Payroll',
    payPeriodStart: '2024-01-15',
    payPeriodEnd: '2024-01-21',
    payDate: '2024-01-26',
    createdAt: '2024-01-22T08:30:00Z',
    createdBy: 'Sarah Johnson',
    totalEmployees: 42,
    processedEmployees: 42,
    totalGrossPay: 125750.00,
    totalNetPay: 98250.00,
    totalTaxes: 19500.00,
    totalDeductions: 8000.00,
    processingTime: '12m 34s',
    completedAt: '2024-01-22T09:15:00Z',
    errorCount: 0
  };

  // Mock employee records
  const employeeRecords: EmployeeRecord[] = [
    {
      id: '1',
      name: 'John Smith',
      department: 'Engineering',
      regularHours: 40,
      overtimeHours: 5,
      grossPay: 3250.00,
      federalTax: 487.50,
      stateTax: 162.50,
      ficaTax: 248.63,
      deductions: 150.00,
      netPay: 2201.37,
      status: 'processed'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      department: 'Marketing',
      regularHours: 40,
      overtimeHours: 0,
      grossPay: 2800.00,
      federalTax: 420.00,
      stateTax: 140.00,
      ficaTax: 214.20,
      deductions: 200.00,
      netPay: 1825.80,
      status: 'processed'
    },
    {
      id: '3',
      name: 'Mike Davis',
      department: 'Sales',
      regularHours: 32,
      overtimeHours: 0,
      grossPay: 1920.00,
      federalTax: 0,
      stateTax: 0,
      ficaTax: 0,
      deductions: 0,
      netPay: 0,
      status: 'error',
      errorMessage: 'Missing bank account information'
    }
  ];

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'processed':
        return <Badge variant="default" className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'error':
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{batchDetail.name}</h1>
            <p className="text-muted-foreground">Batch ID: {batchDetail.id}</p>
          </div>
          {getStatusBadge(batchDetail.status)}
        </div>
        <div className="flex space-x-2">
          {batchDetail.status === 'completed' && (
            <>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Reports
              </Button>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Pay Stubs
              </Button>
            </>
          )}
          {batchDetail.status === 'failed' && (
            <Button>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Batch
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batchDetail.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {batchDetail.processedEmployees} processed successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(batchDetail.totalGrossPay)}</div>
            <p className="text-xs text-muted-foreground">
              Net: {formatCurrency(batchDetail.totalNetPay)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pay Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(batchDetail.payDate)}</div>
            <p className="text-xs text-muted-foreground">
              Period: {formatDate(batchDetail.payPeriodStart)} - {formatDate(batchDetail.payPeriodEnd)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batchDetail.processingTime}</div>
            <p className="text-xs text-muted-foreground">
              {batchDetail.completedAt ? `Completed ${formatDateTime(batchDetail.completedAt)}` : 'In progress'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {['overview', 'employees', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Batch Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Batch Type:</span>
                <span>{batchDetail.batchType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created By:</span>
                <span>{batchDetail.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created At:</span>
                <span>{formatDateTime(batchDetail.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                {getStatusBadge(batchDetail.status)}
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Error Count:</span>
                <span className={batchDetail.errorCount > 0 ? 'text-red-600' : 'text-green-600'}>
                  {batchDetail.errorCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Total Gross Pay:</span>
                <span>{formatCurrency(batchDetail.totalGrossPay)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Taxes:</span>
                <span>{formatCurrency(batchDetail.totalTaxes)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Deductions:</span>
                <span>{formatCurrency(batchDetail.totalDeductions)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Total Net Pay:</span>
                <span className="font-bold">{formatCurrency(batchDetail.totalNetPay)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'employees' && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Records</CardTitle>
            <CardDescription>Detailed payroll information for each employee in this batch</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Taxes</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeRecords.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      {employee.regularHours}
                      {employee.overtimeHours > 0 && ` + ${employee.overtimeHours} OT`}
                    </TableCell>
                    <TableCell>{formatCurrency(employee.grossPay)}</TableCell>
                    <TableCell>
                      {formatCurrency(employee.federalTax + employee.stateTax + employee.ficaTax)}
                    </TableCell>
                    <TableCell>{formatCurrency(employee.deductions)}</TableCell>
                    <TableCell>{formatCurrency(employee.netPay)}</TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {employee.status === 'error' && (
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Register</CardTitle>
              <CardDescription>Complete payroll summary report</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pay Stubs</CardTitle>
              <CardDescription>Individual employee pay stubs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Generate All
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Reports</CardTitle>
              <CardDescription>Tax withholding summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ACH File</CardTitle>
              <CardDescription>Direct deposit file for bank</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download NACHA
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>General Ledger</CardTitle>
              <CardDescription>Accounting journal entries</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export to QuickBooks
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Report</CardTitle>
              <CardDescription>Processing errors and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={batchDetail.errorCount === 0}>
                <AlertCircle className="w-4 h-4 mr-2" />
                View Errors ({batchDetail.errorCount})
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BatchViewer;