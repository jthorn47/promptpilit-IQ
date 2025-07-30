import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UnifiedTabNavigation } from '@/components/shared/UnifiedTabNavigation';
import { useAuthRole } from '@/hooks/useAuthRole';
import { 
  Clock, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Shield, 
  Monitor, 
  AlertTriangle,
  DollarSign,
  FileText,
  History,
  CheckCircle
} from 'lucide-react';

// Import the existing Time Track components
import { MyTimePage } from './MyTimePage';
import { TeamTimePage } from './TeamTimePage';
import { WeeklySummaryPage } from './WeeklySummaryPage';
import { TimeReportsPage } from './TimeReportsPage';
import { TimeSettingsPage } from './TimeSettingsPage';

// Placeholder components for missing functionality
const TimeAttendanceDashboard = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Time & Attendance Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Advanced time & attendance tracking with labor cost analysis</p>
          <p className="text-sm">Employee scheduling • Overtime tracking • Cost centers</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const PunchLogsComponent = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Punch Logs & Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Real-time punch tracking and comprehensive audit logs</p>
          <p className="text-sm">GPS verification • Device tracking • Exception alerts</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const ShiftSchedulingComponent = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Shift Scheduling & Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Advanced shift scheduling with auto-rotation</p>
          <p className="text-sm">Shift templates • Coverage optimization • Break scheduling</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const BreakComplianceComponent = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Break & Compliance Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Automated compliance monitoring and enforcement</p>
          <p className="text-sm">Break reminders • Overtime alerts • Labor law compliance</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const KioskManagementComponent = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Kiosk Management & Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Time clock kiosk deployment and management</p>
          <p className="text-sm">Device registration • Remote configuration • Health monitoring</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const JobCostingComponent = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Job Costing & Project Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Advanced job costing with real-time profitability</p>
          <p className="text-sm">Project budgets • Resource allocation • Cost analysis</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const SupervisorReviewComponent = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Supervisor Review & Approvals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Streamlined timesheet approval workflow</p>
          <p className="text-sm">Bulk approvals • Exception handling • Approval hierarchy</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

const AuditLogsComponent = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Audit Logs & Compliance Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Comprehensive audit trail and compliance reporting</p>
          <p className="text-sm">Change tracking • Access logs • Compliance dashboards</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Overview component that shows dashboard statistics
const OverviewComponent = () => {
  const mockStats = {
    totalEmployees: 245,
    activeEmployees: 198,
    pendingApprovals: 23,
    complianceIssues: 4,
    totalHoursToday: 1847.5,
    totalHoursWeek: 9234.0,
    overtimeHours: 324.5,
    billableHours: 7891.2
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalHoursToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.totalEmployees} total employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Require manager review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{mockStats.complianceIssues}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Hours</span>
              <Badge variant="outline">{mockStats.totalHoursWeek.toLocaleString()}h</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Billable Hours</span>
              <Badge variant="default">{mockStats.billableHours.toLocaleString()}h</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overtime Hours</span>
              <Badge variant="secondary">{mockStats.overtimeHours.toLocaleString()}h</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Billable Rate</span>
              <Badge variant="outline">85.4%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Pending Timesheets
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Weekly Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Review Compliance Issues
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Update Time Policies
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const TimeTrackAdminDashboard: React.FC = () => {
  const { isSuperAdmin, isCompanyAdmin, hasAnyRole } = useAuthRole();
  const [activeTab, setActiveTab] = useState('overview');

  // Define tabs based on user roles  
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      component: <OverviewComponent />,
      hidden: false
    },
    // Employee-level access
    {
      id: 'my-timecard',
      label: 'My Timecard',
      component: <MyTimePage />,
      hidden: !hasAnyRole(['super_admin', 'company_admin', 'employee'])
    },
    // Supervisor and admin access
    {
      id: 'team-timecards',
      label: 'Team Timecards',
      component: <TeamTimePage />,
      hidden: !hasAnyRole(['super_admin', 'company_admin', 'supervisor'])
    },
    {
      id: 'supervisor-review',
      label: 'Supervisor Review',
      component: <SupervisorReviewComponent />,
      hidden: !hasAnyRole(['super_admin', 'company_admin', 'supervisor'])
    },
    // Admin-only sections
    {
      id: 'attendance',
      label: 'Time & Attendance',
      component: <TimeAttendanceDashboard />,
      hidden: !hasAnyRole(['super_admin', 'company_admin'])
    },
    {
      id: 'punch-logs',
      label: 'Punch Logs',
      component: <PunchLogsComponent />,
      hidden: !hasAnyRole(['super_admin', 'company_admin'])
    },
    {
      id: 'shift-scheduling',
      label: 'Shift Scheduling',
      component: <ShiftSchedulingComponent />,
      hidden: !hasAnyRole(['super_admin', 'company_admin'])
    },
    {
      id: 'break-compliance',
      label: 'Break Compliance',
      component: <BreakComplianceComponent />,
      hidden: !hasAnyRole(['super_admin', 'company_admin'])
    },
    {
      id: 'kiosk-management',
      label: 'Kiosk Management',
      component: <KioskManagementComponent />,
      hidden: !hasAnyRole(['super_admin', 'company_admin'])
    },
    {
      id: 'job-costing',
      label: 'Job Costing',
      component: <JobCostingComponent />,
      hidden: !hasAnyRole(['super_admin', 'company_admin'])
    },
    {
      id: 'weekly-summary',
      label: 'Weekly Summary',
      component: <WeeklySummaryPage />,
      hidden: !hasAnyRole(['super_admin', 'company_admin'])
    },
    {
      id: 'reports',
      label: 'Reports',
      component: <TimeReportsPage />,
      hidden: !hasAnyRole(['super_admin', 'company_admin'])
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      component: <AuditLogsComponent />,
      hidden: !hasAnyRole(['super_admin', 'company_admin'])
    },
    {
      id: 'settings',
      label: 'Configuration',
      component: <TimeSettingsPage />,
      hidden: !hasAnyRole(['super_admin', 'company_admin'])
    }
  ];

  // Filter out hidden tabs based on user role
  const visibleTabs = tabs.filter(tab => !tab.hidden);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Time Track Enterprise
            </h1>
            <p className="text-muted-foreground">
              Advanced time tracking with GPS verification and job-based billing
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              {isSuperAdmin ? 'Super Admin' : isCompanyAdmin ? 'Company Admin' : 'User'}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {visibleTabs.length} modules available
            </Badge>
          </div>
        </div>

        {/* Navigation and Content */}
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <UnifiedTabNavigation
              tabs={visibleTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              showSettings={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};