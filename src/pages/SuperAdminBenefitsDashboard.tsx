import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  Heart, 
  Shield, 
  DollarSign, 
  Users, 
  Calendar,
  Plus,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Building2,
  FileText,
  Clock,
  TrendingUp,
  UserCheck,
  ExternalLink,
  Download,
  Upload,
  Filter,
  Search,
  Bell,
  Flag,
  Settings
} from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BenefitMetrics {
  clients_offering_benefits: number;
  plans_configured: number;
  monthly_deduction_volume: number;
  non_enrolled_eligible: number;
  compliance_flags: number;
}

interface ClientPlan {
  id: string;
  client_name: string;
  medical: boolean;
  dental: boolean;
  vision: boolean;
  retirement_401k: boolean;
  status: 'active' | 'incomplete' | 'pending_approval';
  last_updated: string;
  employee_count: number;
  enrolled_count: number;
}

interface PendingApproval {
  id: string;
  client_name: string;
  plan_type: string;
  submitted_date: string;
  documents_count: number;
  status: 'pending' | 'review' | 'approved' | 'rejected';
}

interface ComplianceAlert {
  id: string;
  client_name: string;
  alert_type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  due_date: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  admin_user: string;
  client_name: string;
  action: string;
  benefit_type: string;
  details: string;
}

export const SuperAdminBenefitsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');


  // Mock data for demonstration
  const benefitMetrics: BenefitMetrics = {
    clients_offering_benefits: 47,
    plans_configured: 89,
    monthly_deduction_volume: 245780.00,
    non_enrolled_eligible: 156,
    compliance_flags: 8
  };

  const clientPlans: ClientPlan[] = [
    {
      id: '1',
      client_name: 'Tech Solutions Inc',
      medical: true,
      dental: true,
      vision: false,
      retirement_401k: true,
      status: 'active',
      last_updated: '2024-01-15',
      employee_count: 45,
      enrolled_count: 38
    },
    {
      id: '2',
      client_name: 'Manufacturing Corp',
      medical: true,
      dental: false,
      vision: false,
      retirement_401k: false,
      status: 'incomplete',
      last_updated: '2024-01-10',
      employee_count: 120,
      enrolled_count: 95
    },
    {
      id: '3',
      client_name: 'Healthcare Partners',
      medical: true,
      dental: true,
      vision: true,
      retirement_401k: true,
      status: 'pending_approval',
      last_updated: '2024-01-12',
      employee_count: 78,
      enrolled_count: 0
    }
  ];

  const pendingApprovals: PendingApproval[] = [
    {
      id: '1',
      client_name: 'Healthcare Partners',
      plan_type: 'Medical Insurance',
      submitted_date: '2024-01-12',
      documents_count: 3,
      status: 'pending'
    },
    {
      id: '2',
      client_name: 'Retail Chain LLC',
      plan_type: '401(k) Plan',
      submitted_date: '2024-01-11',
      documents_count: 5,
      status: 'review'
    }
  ];

  const complianceAlerts: ComplianceAlert[] = [
    {
      id: '1',
      client_name: 'Tech Solutions Inc',
      alert_type: 'ERISA Filing',
      severity: 'high',
      description: 'Missing Form 5500 for plan year 2023',
      due_date: '2024-02-15'
    },
    {
      id: '2',
      client_name: 'Manufacturing Corp',
      alert_type: 'ACA Threshold',
      severity: 'medium',
      description: 'Approaching 50 FTE threshold (currently 47)',
      due_date: '2024-03-01'
    }
  ];

  const auditLog: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-15 10:30:00',
      admin_user: 'John Admin',
      client_name: 'Tech Solutions Inc',
      action: 'Updated deduction rates',
      benefit_type: 'Medical',
      details: 'Changed employee contribution from $150 to $175'
    },
    {
      id: '2',
      timestamp: '2024-01-15 09:15:00',
      admin_user: 'Sarah Manager',
      client_name: 'Manufacturing Corp',
      action: 'Approved plan setup',
      benefit_type: 'Dental',
      details: 'Approved dental plan configuration'
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
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'incomplete':
        return <Badge variant="destructive">Incomplete</Badge>;
      case 'pending_approval':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
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

  const handleGetStarted = () => {
    // Navigate to benefits configuration or open a dialog
    navigate('/payroll/benefits');
  };

  const handleUploadCSV = () => {
    // Handle CSV upload functionality
    console.log('Upload CSV clicked');
  };

  const handleGenerateReport = () => {
    // Navigate to reports page
    navigate('/payroll/reports');
  };

  const handleGlobalSettings = () => {
    // Handle global settings
    console.log('Global settings clicked');
  };

  const handleViewAnalytics = () => {
    // Navigate to analytics
    navigate('/admin/analytics');
  };

  const handleImpersonate = () => {
    // Handle client impersonation
    console.log('Impersonate clicked');
  };

  return (
    <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Benefits Management</h1>
            <p className="text-muted-foreground">Centralized oversight and management of all client benefit plans</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button onClick={() => setActiveTab('actions')}>
              <Plus className="w-4 h-4 mr-2" />
              Configure Plan
            </Button>
          </div>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/payroll/benefits/clients')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clients w/ Benefits</p>
                  <p className="text-2xl font-bold">{benefitMetrics.clients_offering_benefits}</p>
                </div>
                <Building2 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/payroll/benefits/plans')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plans Configured</p>
                  <p className="text-2xl font-bold">{benefitMetrics.plans_configured}</p>
                </div>
                <Heart className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/payroll/benefits/deductions')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Volume</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(benefitMetrics.monthly_deduction_volume)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/payroll/benefits/enrollment')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Non-Enrolled Eligible</p>
                  <p className="text-2xl font-bold text-orange-600">{benefitMetrics.non_enrolled_eligible}</p>
                </div>
                <UserCheck className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/payroll/benefits/compliance')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compliance Flags</p>
                  <p className="text-2xl font-bold text-red-600">{benefitMetrics.compliance_flags}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Client Plans</TabsTrigger>
            <TabsTrigger value="approvals" className="text-xs sm:text-sm">Approvals</TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs sm:text-sm">Compliance</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs sm:text-sm">Audit Log</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs sm:text-sm">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>Client Plan Status</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search clients..."
                        className="pl-8 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Status</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('active')}>Active</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('incomplete')}>Incomplete</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter('pending_approval')}>Pending Approval</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Medical</TableHead>
                        <TableHead>Dental</TableHead>
                        <TableHead>Vision</TableHead>
                        <TableHead>401(k)</TableHead>
                        <TableHead>Enrollment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientPlans.map((plan) => (
                        <TableRow key={plan.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{plan.client_name}</TableCell>
                          <TableCell>
                            {plan.medical ? <CheckCircle className="w-4 h-4 text-green-600" /> : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            {plan.dental ? <CheckCircle className="w-4 h-4 text-green-600" /> : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            {plan.vision ? <CheckCircle className="w-4 h-4 text-green-600" /> : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            {plan.retirement_401k ? <CheckCircle className="w-4 h-4 text-green-600" /> : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {plan.enrolled_count}/{plan.employee_count}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(plan.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(plan.last_updated).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{approval.client_name}</h4>
                          <Badge variant="outline">{approval.plan_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted: {new Date(approval.submitted_date).toLocaleDateString()} • 
                          {approval.documents_count} documents attached
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                        <Button variant="default" size="sm">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Deadline Monitor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Flag className="w-5 h-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{alert.client_name}</h4>
                            {getSeverityBadge(alert.severity)}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mt-1">{alert.alert_type}</p>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                          <p className="text-sm text-red-600 mt-1">Due: {new Date(alert.due_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Bell className="w-4 h-4 mr-2" />
                          Remind
                        </Button>
                        <Button variant="default" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deduction Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Admin User</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Benefit Type</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLog.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-sm">{entry.timestamp}</TableCell>
                          <TableCell className="font-medium">{entry.admin_user}</TableCell>
                          <TableCell>{entry.client_name}</TableCell>
                          <TableCell>{entry.action}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{entry.benefit_type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {entry.details}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Plus className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Configure New Benefit Plan</h3>
                  <p className="text-sm text-muted-foreground mb-4">Set up a new benefit plan for a client</p>
                  <Button onClick={handleGetStarted} className="w-full">Get Started</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Import Deduction Table</h3>
                  <p className="text-sm text-muted-foreground mb-4">Upload CSV with deduction rates and rules</p>
                  <Button onClick={handleUploadCSV} className="w-full">Upload CSV</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Run Deduction Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">Generate comprehensive deduction analytics</p>
                  <Button onClick={handleGenerateReport} className="w-full">Generate Report</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Settings className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Global Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">Configure system-wide benefit defaults</p>
                  <Button onClick={handleGlobalSettings} className="w-full">Configure</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-sm text-muted-foreground mb-4">View detailed benefit utilization analytics</p>
                  <Button onClick={handleViewAnalytics} className="w-full">View Analytics</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <ExternalLink className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Client Impersonation</h3>
                  <p className="text-sm text-muted-foreground mb-4">Login as client admin for troubleshooting</p>
                  <Button onClick={handleImpersonate} className="w-full">Impersonate</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
};