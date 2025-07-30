import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Building2, 
  AlertTriangle, 
  PlayCircle, 
  Users, 
  Settings,
  RefreshCw,
  Shield,
  Ban,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Calculator,
  Brain,
  Timer,
  Calendar,
  Shield as ShieldIcon,
  FolderOpen,
  CheckSquare,
  GraduationCap,
  Lock,
  Zap,
  Users as UsersIcon
} from 'lucide-react';
import { EmployeesTab } from './tabs/EmployeesTab';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AdminClientViewProps {
  clientId: string;
  onBack: () => void;
}

export const AdminClientView = ({ clientId, onBack }: AdminClientViewProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  console.log('🔍 AdminClientView - clientId:', clientId);
  console.log('🔍 AdminClientView - activeTab:', activeTab);

  // Mock client data
  const client = {
    id: clientId,
    name: 'TechFlow Solutions',
    status: 'active',
    employees: 45,
    onboardingManager: 'Sarah Johnson',
    lastPayRun: '2024-01-15',
    nextPayRun: '2024-01-30',
    fundingMethod: 'ACH Auto-Debit',
    bankAccount: '**** 4567',
    alerts: [
      {
        id: 'alert_001',
        type: 'compliance',
        severity: 'high',
        message: 'Missing W-4 forms for 3 new employees',
        timestamp: '2024-01-16 09:30',
        status: 'unresolved'
      },
      {
        id: 'alert_002',
        type: 'forecast',
        severity: 'medium',
        message: 'Payroll cost 15% higher than previous period',
        timestamp: '2024-01-15 16:45',
        status: 'resolved'
      }
    ],
    payRuns: [
      {
        id: 'pr_001',
        period: '2024-01-01 to 2024-01-15',
        status: 'completed',
        amount: 125000,
        employees: 45,
        processedAt: '2024-01-15 14:30',
        issues: 0
      },
      {
        id: 'pr_002',
        period: '2023-12-16 to 2023-12-31',
        status: 'completed',
        amount: 118000,
        employees: 43,
        processedAt: '2023-12-31 14:30',
        issues: 1
      }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAlertSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              {client.name}
            </h1>
            <p className="text-muted-foreground">Client ID: {client.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(client.status)}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="destructive" size="sm">
            <Ban className="h-4 w-4 mr-2" />
            Emergency Lock
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Employees</p>
                <p className="text-2xl font-bold">{client.employees}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{client.alerts.filter(a => a.status === 'unresolved').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Payroll</p>
                <p className="text-2xl font-bold">$125K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Pay Run</p>
                <p className="text-sm font-medium">{client.nextPayRun}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="space-y-2">
          {/* First row of tabs */}
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="contract">Contract</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          
          {/* Second row of tabs */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="halo-payroll">Halo Payroll</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">{getStatusBadge(client.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employees</label>
                    <p className="mt-1 font-medium">{client.employees}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Onboarding Manager</label>
                    <p className="mt-1 font-medium">{client.onboardingManager}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Funding Method</label>
                    <p className="mt-1 font-medium">{client.fundingMethod}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Quick Actions
                  <RefreshCw className="h-4 w-4" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calculator className="h-4 w-4 mr-2" />
                  Run Payroll Simulation
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Force Recalculation
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Deposit Settings
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Audit Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          <EmployeesTab clientId={clientId} />
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Contact management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contract" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Contract management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Activity tracking coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="mt-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
                <Brain className="h-6 w-6 text-primary" />
                HaaLO IQ - Module Management
              </h3>
              <p className="text-muted-foreground">
                Manage and configure HaaLO modules for {client.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Time Tracking Module */}
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Timer className="h-8 w-8 text-blue-600" />
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <CardTitle className="text-lg">Time Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Advanced time tracking with GPS verification and project-based billing.
                  </p>
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </CardContent>
              </Card>

              {/* Leave Management Module */}
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Calendar className="h-8 w-8 text-emerald-600" />
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <CardTitle className="text-lg">Leave Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Streamlined PTO requests, approvals, and accrual tracking.
                  </p>
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </CardContent>
              </Card>

              {/* Compliance Module */}
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <ShieldIcon className="h-8 w-8 text-orange-600" />
                    <Badge className="bg-yellow-100 text-yellow-800">Locked</Badge>
                  </div>
                  <CardTitle className="text-lg">Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Automated compliance monitoring and reporting tools.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>

              {/* Documents Module */}
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <FolderOpen className="h-8 w-8 text-purple-600" />
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Secure document storage, e-signatures, and workflow automation.
                  </p>
                  <Button className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </CardContent>
              </Card>

              {/* Tasks & Workflows Module */}
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CheckSquare className="h-8 w-8 text-indigo-600" />
                    <Badge className="bg-gray-100 text-gray-800">Not Installed</Badge>
                  </div>
                  <CardTitle className="text-lg">Tasks & Workflows</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Customizable task management and automated workflow processes.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>

              {/* EaseLearn Module */}
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <GraduationCap className="h-8 w-8 text-red-600" />
                    <Badge className="bg-yellow-100 text-yellow-800">Locked</Badge>
                  </div>
                  <CardTitle className="text-lg">EaseLearn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Interactive training platform with certification tracking.
                  </p>
                  <Button variant="outline" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="halo-payroll" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Recent Pay Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.payRuns.map((payRun) => (
                    <TableRow key={payRun.id}>
                      <TableCell className="font-medium">{payRun.period}</TableCell>
                      <TableCell>{getStatusBadge(payRun.status)}</TableCell>
                      <TableCell>${payRun.amount.toLocaleString()}</TableCell>
                      <TableCell>{payRun.employees}</TableCell>
                      <TableCell>{payRun.processedAt}</TableCell>
                      <TableCell>
                        {payRun.issues > 0 ? (
                          <Badge variant="destructive">{payRun.issues}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600">0</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};