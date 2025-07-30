import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, TrendingUp, AlertTriangle, Plus, Play, Square, Timer, Calendar, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AccessibleDataTable, TableColumn } from '@/components/AccessibleDataTable';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export const TimeDashboard: React.FC = () => {
  const { user, companyId } = useAuth();
  const navigate = useNavigate();
  
  const mockTimeEntries = [
    {
      id: '1',
      employee_id: user?.id || '',
      company_id: companyId || '',
      date: '2024-01-26',
      project_id: 'Website Redesign',
      time_code_id: 'regular',
      hours: 8,
      hours_worked: 8,
      notes: 'Frontend development and UI testing',
      tags: ['development', 'ui'],
      is_billable: true,
      status: 'approved' as const,
      is_remote: false,
      created_at: '2024-01-26T10:00:00Z',
      updated_at: '2024-01-26T10:00:00Z'
    },
    {
      id: '2',
      employee_id: user?.id || '',
      company_id: companyId || '',
      date: '2024-01-25',
      project_id: 'Mobile App',
      time_code_id: 'regular',
      hours: 6.5,
      hours_worked: 6.5,
      notes: 'Bug fixes and testing',
      tags: ['testing', 'bugfix'],
      is_billable: true,
      status: 'pending' as const,
      is_remote: true,
      created_at: '2024-01-25T09:00:00Z',
      updated_at: '2024-01-25T09:00:00Z'
    }
  ];

  const recentEntriesColumns: TableColumn<typeof mockTimeEntries[0]>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (_, row) => new Date(row.date).toLocaleDateString()
    },
    {
      key: 'project_id',
      header: 'Project',
      render: (_, row) => (
        <div className="font-medium">{row.project_id}</div>
      )
    },
    {
      key: 'hours',
      header: 'Hours',
      render: (value) => (
        <Badge variant="outline" className="font-mono">
          {value}h
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge variant={value === 'approved' ? 'default' : value === 'pending' ? 'secondary' : 'destructive'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'is_remote',
      header: 'Location',
      render: (_, row) => (
        <span className="text-sm text-muted-foreground">
          {row.is_remote ? 'Remote' : 'Office'}
        </span>
      )
    }
  ];

  const mockStats = {
    totalHoursToday: 7.5,
    totalHoursWeek: 32.5,
    billableHours: 28.0,
    overdueApprovals: 3,
    teamMembers: 12,
    activeProjects: 5
  };

  return (
    <StandardPageLayout
      title="Time Tracking Dashboard"
      subtitle="Track time, manage projects, and monitor team productivity"
      headerActions={
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/halo/time/my')}
          >
            <Timer className="w-4 h-4 mr-2" />
            Start Timer
          </Button>
          <Button 
            size="sm"
            onClick={() => navigate('/halo/time/my')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      }
    >
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-900">Clock In/Out</h3>
                    <p className="text-sm text-blue-700">Quick time tracking</p>
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate('/halo/time/my')}
                  >
                    <Play className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-900">Today's Total</h3>
                    <p className="text-2xl font-bold text-green-800">{mockStats.totalHoursToday}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-purple-900">This Week</h3>
                    <p className="text-2xl font-bold text-purple-800">{mockStats.totalHoursWeek}h</p>
                  </div>
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.billableHours}h</div>
                <p className="text-xs text-muted-foreground">
                  86% billable rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.overdueApprovals}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.activeProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Currently tracking
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.teamMembers}</div>
                <p className="text-xs text-muted-foreground">
                  Active this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Time Entries</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/halo/time/my')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AccessibleDataTable
                data={mockTimeEntries}
                columns={recentEntriesColumns}
                emptyMessage="No recent time entries found"
              />
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/halo/time/my')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Timesheet
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/halo/time/reports')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/halo/time/team')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Team Overview
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Timer Status</p>
                      <p className="text-sm text-muted-foreground">Not running</p>
                    </div>
                    <Badge variant="secondary">Stopped</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Last Entry</p>
                      <p className="text-sm text-muted-foreground">Website Redesign - 8h</p>
                    </div>
                    <Badge variant="default">Approved</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </StandardPageLayout>
  );
};