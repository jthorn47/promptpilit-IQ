import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Clock, Calendar, Mail, Pause, Play, Edit, Trash2, Eye, Users } from 'lucide-react';

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  timeOfDay: string;
  recipients: string[];
  isEnabled: boolean;
  prompt: string;
  nextRun: string;
  lastRun?: string;
  createdAt: string;
}

export const ScheduledReports = () => {
  // Mock data - replace with actual data fetching
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Weekly Payroll Summary',
      description: 'Weekly breakdown of payroll costs by department',
      frequency: 'weekly',
      timeOfDay: '09:00',
      recipients: ['manager@company.com', 'hr@company.com'],
      isEnabled: true,
      prompt: 'Show me weekly payroll costs by department',
      nextRun: '2024-01-22T09:00:00Z',
      lastRun: '2024-01-15T09:00:00Z',
      createdAt: '2024-01-01T10:00:00Z'
    },
    {
      id: '2',
      name: 'Monthly Employee Metrics',
      description: 'Comprehensive employee metrics and KPIs',
      frequency: 'monthly',
      timeOfDay: '08:00',
      recipients: ['ceo@company.com'],
      isEnabled: false,
      prompt: 'Monthly employee metrics including headcount, turnover, and satisfaction',
      nextRun: '2024-02-01T08:00:00Z',
      lastRun: '2024-01-01T08:00:00Z',
      createdAt: '2023-12-15T14:30:00Z'
    }
  ]);

  const handleToggleSchedule = (reportId: string, enabled: boolean) => {
    setScheduledReports(reports =>
      reports.map(report =>
        report.id === reportId
          ? { ...report, isEnabled: enabled }
          : report
      )
    );
  };

  const handleDeleteSchedule = (reportId: string) => {
    setScheduledReports(reports =>
      reports.filter(report => report.id !== reportId)
    );
  };

  const handleEditSchedule = (report: ScheduledReport) => {
    console.log('Editing schedule:', report.name);
    // TODO: Implement schedule editing
  };

  const handleRunNow = (report: ScheduledReport) => {
    console.log('Running report now:', report.name);
    // TODO: Implement immediate report execution
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: 'default',
      weekly: 'secondary',
      monthly: 'outline'
    };
    return (
      <Badge variant={colors[frequency as keyof typeof colors] as any}>
        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
      </Badge>
    );
  };

  const getNextRunDisplay = (nextRun: string) => {
    const date = new Date(nextRun);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'soon';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Scheduled Reports
          </h2>
          <p className="text-muted-foreground">
            Manage automated report delivery schedules
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {scheduledReports.filter(r => r.isEnabled).length} active
          </Badge>
          <Badge variant="outline">
            {scheduledReports.length} total
          </Badge>
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="space-y-4">
        {scheduledReports.map((report) => (
          <Card key={report.id} className={`transition-all ${report.isEnabled ? 'border-l-4 border-l-primary' : 'opacity-60'}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    {getFrequencyBadge(report.frequency)}
                    <Badge variant={report.isEnabled ? 'default' : 'secondary'}>
                      {report.isEnabled ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </div>
                <Switch
                  checked={report.isEnabled}
                  onCheckedChange={(checked) => handleToggleSchedule(report.id, checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Schedule Details */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Frequency
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {report.frequency} at {report.timeOfDay}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Next Run
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getNextRunDisplay(report.nextRun)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Recipients
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {report.recipients.length} recipient{report.recipients.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Run</p>
                  <p className="text-sm text-muted-foreground">
                    {report.lastRun
                      ? new Date(report.lastRun).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>

              {/* Recipients List */}
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Email Recipients
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.recipients.map((email, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {email}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Prompt Preview */}
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Report Query</p>
                <p className="text-sm text-muted-foreground">{report.prompt}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleRunNow(report)}
                  disabled={!report.isEnabled}
                >
                  <Play className="h-3 w-3 mr-2" />
                  Run Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditSchedule(report)}
                >
                  <Edit className="h-3 w-3 mr-2" />
                  Edit Schedule
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleSchedule(report.id, !report.isEnabled)}
                >
                  {report.isEnabled ? (
                    <>
                      <Pause className="h-3 w-3 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-2" />
                      Resume
                    </>
                  )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Scheduled Report</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the schedule for "{report.name}"? This will stop all future automated deliveries.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteSchedule(report.id)}>
                        Delete Schedule
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scheduledReports.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scheduled reports</h3>
            <p className="text-muted-foreground mb-4">
              Set up automated delivery for your reports to receive them regularly via email.
            </p>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Your First Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};