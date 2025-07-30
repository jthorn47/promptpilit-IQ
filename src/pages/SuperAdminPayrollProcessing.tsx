import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Edit,
  Check,
  Send,
  Lock,
  Settings,
  Download,
  UserPlus,
  Copy,
  Calendar,
  FileText,
  ExternalLink,
  TrendingUp,
  Bell,
  Shield,
  Zap,
  Building2,
  Timer,
  Plus
} from 'lucide-react';

interface PayrollMetrics {
  payrolls_in_progress: number;
  payrolls_approved: number;
  payrolls_with_errors: number;
  payrolls_submitted_today: number;
}

interface PayrollRecord {
  id: string;
  client_name: string;
  pay_period: string;
  payroll_status: 'draft' | 'needs_review' | 'approved' | 'submitted';
  total_gross_pay: number;
  issues_count: number;
  assigned_processor: string;
  due_date: string;
  employee_count: number;
  total_hours: number;
  created_at: string;
  client_id: string;
}

interface PayrollIssue {
  id: string;
  client_name: string;
  employee_name: string;
  issue_type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  payroll_id: string;
}

export const SuperAdminPayrollProcessing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayrolls, setSelectedPayrolls] = useState<string[]>([]);
  const [showSubmissionDrawer, setShowSubmissionDrawer] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);

  const breadcrumbItems = [
    { label: 'Super Admin', href: '/admin' },
    { label: 'Payroll Processing' }
  ];

  // Mock data for demonstration
  const payrollMetrics: PayrollMetrics = {
    payrolls_in_progress: 23,
    payrolls_approved: 8,
    payrolls_with_errors: 5,
    payrolls_submitted_today: 12
  };

  const payrollRecords: PayrollRecord[] = [
    {
      id: '1',
      client_name: 'Tech Solutions Inc',
      pay_period: '12/01/2024 - 12/15/2024',
      payroll_status: 'needs_review',
      total_gross_pay: 125340.50,
      issues_count: 2,
      assigned_processor: 'Sarah Johnson',
      due_date: '2024-01-20',
      employee_count: 45,
      total_hours: 3600,
      created_at: '2024-01-15',
      client_id: 'client_1'
    },
    {
      id: '2',
      client_name: 'Manufacturing Corp',
      pay_period: '12/01/2024 - 12/15/2024',
      payroll_status: 'approved',
      total_gross_pay: 248750.00,
      issues_count: 0,
      assigned_processor: 'Mike Chen',
      due_date: '2024-01-22',
      employee_count: 120,
      total_hours: 9600,
      created_at: '2024-01-14',
      client_id: 'client_2'
    },
    {
      id: '3',
      client_name: 'Healthcare Partners',
      pay_period: '12/01/2024 - 12/15/2024',
      payroll_status: 'draft',
      total_gross_pay: 189500.75,
      issues_count: 4,
      assigned_processor: 'Lisa Rodriguez',
      due_date: '2024-01-25',
      employee_count: 78,
      total_hours: 6240,
      created_at: '2024-01-16',
      client_id: 'client_3'
    },
    {
      id: '4',
      client_name: 'Retail Chain LLC',
      pay_period: '11/16/2024 - 11/30/2024',
      payroll_status: 'submitted',
      total_gross_pay: 167890.25,
      issues_count: 0,
      assigned_processor: 'David Park',
      due_date: '2024-01-18',
      employee_count: 95,
      total_hours: 7600,
      created_at: '2024-01-12',
      client_id: 'client_4'
    }
  ];

  const payrollIssues: PayrollIssue[] = [
    {
      id: '1',
      client_name: 'Tech Solutions Inc',
      employee_name: 'John Doe',
      issue_type: 'Missing Timecard',
      severity: 'high',
      description: 'Employee has no timecard entries for week ending 12/15',
      payroll_id: '1'
    },
    {
      id: '2',
      client_name: 'Tech Solutions Inc',
      employee_name: 'Jane Smith',
      issue_type: 'Negative Net Pay',
      severity: 'high',
      description: 'Deductions exceed gross pay by $45.50',
      payroll_id: '1'
    },
    {
      id: '3',
      client_name: 'Healthcare Partners',
      employee_name: 'Bob Wilson',
      issue_type: 'Invalid Bank Account',
      severity: 'medium',
      description: 'Bank routing number failed validation',
      payroll_id: '3'
    },
    {
      id: '4',
      client_name: 'Healthcare Partners',
      employee_name: 'Alice Brown',
      issue_type: 'Missing Pay Rate',
      severity: 'high',
      description: 'No hourly rate configured for employee',
      payroll_id: '3'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'needs_review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Needs Review</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'submitted':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Submitted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const handleSelectPayroll = (payrollId: string) => {
    setSelectedPayrolls(prev => 
      prev.includes(payrollId) 
        ? prev.filter(id => id !== payrollId)
        : [...prev, payrollId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayrolls.length === payrollRecords.length) {
      setSelectedPayrolls([]);
    } else {
      setSelectedPayrolls(payrollRecords.map(p => p.id));
    }
  };

  const openSubmissionDrawer = (payroll: PayrollRecord) => {
    setSelectedPayroll(payroll);
    setShowSubmissionDrawer(true);
  };

  return (
    <>
      <BreadcrumbNav items={breadcrumbItems} />
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payroll Processing Hub</h1>
            <p className="text-muted-foreground">Operational center for managing all client payrolls</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Admin Tools
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Payroll
            </Button>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{payrollMetrics.payrolls_in_progress}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{payrollMetrics.payrolls_approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">With Errors</p>
                  <p className="text-2xl font-bold text-red-600">{payrollMetrics.payrolls_with_errors}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Submitted Today</p>
                  <p className="text-2xl font-bold text-blue-600">{payrollMetrics.payrolls_submitted_today}</p>
                </div>
                <Send className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Tracker Panel */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-800">Payroll Issues Requiring Attention</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payrollIssues.slice(0, 3).map((issue) => (
                <div key={issue.id} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{issue.client_name}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm">{issue.employee_name}</span>
                      {getSeverityBadge(issue.severity)}
                    </div>
                    <p className="text-sm font-medium text-red-800 mt-1">{issue.issue_type}</p>
                    <p className="text-sm text-red-600">{issue.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm">
                      <Zap className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
              {payrollIssues.length > 3 && (
                <Button variant="outline" className="w-full">
                  View All {payrollIssues.length} Issues
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filter & Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client name, EIN, or employee..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Status Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('draft')}>Draft</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('needs_review')}>Needs Review</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('approved')}>Approved</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('submitted')}>Submitted</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedPayrolls.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Check className="w-4 h-4 mr-2" />
                    Bulk Approve ({selectedPayrolls.length})
                  </Button>
                  <Button>
                    <Send className="w-4 h-4 mr-2" />
                    Bulk Submit ({selectedPayrolls.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Payrolls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPayrolls.length === payrollRecords.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Gross Pay</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Assigned Processor</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((payroll) => (
                    <TableRow key={payroll.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedPayrolls.includes(payroll.id)}
                          onCheckedChange={() => handleSelectPayroll(payroll.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <p>{payroll.client_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {payroll.employee_count} employees • {payroll.total_hours.toLocaleString()} hours
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{payroll.pay_period}</TableCell>
                      <TableCell>{getStatusBadge(payroll.payroll_status)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(payroll.total_gross_pay)}</TableCell>
                      <TableCell>
                        {payroll.issues_count > 0 ? (
                          <Badge variant="destructive">{payroll.issues_count} issues</Badge>
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{payroll.assigned_processor}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(payroll.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {payroll.payroll_status === 'approved' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openSubmissionDrawer(payroll)}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Reassign Processor
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Clone Payroll
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Lock className="w-4 h-4 mr-2" />
                                Lock/Unlock
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Impersonate Client
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Submission Drawer */}
        <Sheet open={showSubmissionDrawer} onOpenChange={setShowSubmissionDrawer}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Payroll Submission</SheetTitle>
              <SheetDescription>
                {selectedPayroll?.client_name} - {selectedPayroll?.pay_period}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              {/* Payroll Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold">Payroll Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Gross Pay</p>
                    <p className="text-lg font-semibold">
                      {selectedPayroll && formatCurrency(selectedPayroll.total_gross_pay)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Employees</p>
                    <p className="text-lg font-semibold">{selectedPayroll?.employee_count}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                    <p className="text-lg font-semibold">{selectedPayroll?.total_hours.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div>{selectedPayroll && getStatusBadge(selectedPayroll.payroll_status)}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <h3 className="font-semibold">Actions</h3>
                
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Generate Preview Reports
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Pay Register
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Payroll Summary
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Export YTD Reports
                </Button>
                
                <div className="border-t pt-3">
                  <Button className="w-full justify-start">
                    <Check className="w-4 h-4 mr-2" />
                    Approve Payroll
                  </Button>
                  
                  <Button className="w-full justify-start mt-2" variant="default">
                    <Send className="w-4 h-4 mr-2" />
                    Submit ACH (Generate NACHA)
                  </Button>
                  
                  <Button className="w-full justify-start mt-2" variant="outline">
                    <Bell className="w-4 h-4 mr-2" />
                    Notify Client Admin
                  </Button>
                </div>
              </div>

              {/* Compliance Checks */}
              <div className="space-y-3">
                <h3 className="font-semibold">Compliance Checks</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">No overtime violations detected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">All deductions within limits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Tax calculations verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Dual approval required</span>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};