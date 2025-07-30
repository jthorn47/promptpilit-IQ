import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Mail, Plus, Settings, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

interface ScheduledReport {
  id: string;
  name: string;
  reportType: string;
  frequency: Frequency;
  recipients: string[];
  isActive: boolean;
  nextRun: string;
  lastRun: string | null;
  filters: Record<string, any>;
}

interface ScheduledReportsProps {
  companyId?: string;
}

export function ScheduledReports({ companyId }: ScheduledReportsProps) {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly';

  // New report form state
  const [newReport, setNewReport] = useState<{
    name: string;
    reportType: string;
    frequency: Frequency;
    recipients: string[];
    filters: Record<string, any>;
  }>({
    name: '',
    reportType: 'training_completion',
    frequency: 'weekly',
    recipients: [''],
    filters: {}
  });

  useEffect(() => {
    fetchScheduledReports();
  }, [companyId]);

  const fetchScheduledReports = async () => {
    try {
      setLoading(true);
      // Note: This would typically fetch from a scheduled_reports table
      // For now, we'll simulate with empty data
      setScheduledReports([]);
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scheduled reports.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createScheduledReport = async () => {
    try {
      if (!newReport.name || !newReport.reportType) {
        toast({
          title: "Invalid input",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const filteredRecipients = newReport.recipients.filter(email => email.trim());
      if (filteredRecipients.length === 0) {
        toast({
          title: "No recipients",
          description: "Please add at least one email recipient.",
          variant: "destructive",
        });
        return;
      }

      // Calculate next run date based on frequency
      const now = new Date();
      let nextRun = new Date();
      
      switch (newReport.frequency) {
        case 'daily':
          nextRun.setDate(now.getDate() + 1);
          break;
        case 'weekly':
          nextRun.setDate(now.getDate() + 7);
          break;
        case 'monthly':
          nextRun.setMonth(now.getMonth() + 1);
          break;
        case 'quarterly':
          nextRun.setMonth(now.getMonth() + 3);
          break;
      }

      // In a real implementation, this would save to the database
      const newScheduledReport: ScheduledReport = {
        id: Date.now().toString(),
        name: newReport.name,
        reportType: newReport.reportType,
        frequency: newReport.frequency,
        recipients: filteredRecipients,
        isActive: true,
        nextRun: nextRun.toISOString(),
        lastRun: null,
        filters: newReport.filters
      };

      setScheduledReports(prev => [...prev, newScheduledReport]);
      setIsCreating(false);
      setNewReport({
        name: '',
        reportType: 'training_completion',
        frequency: 'weekly',
        recipients: [''],
        filters: {}
      });

      toast({
        title: "Report scheduled",
        description: `${newReport.name} has been scheduled successfully.`,
      });
    } catch (error) {
      console.error('Error creating scheduled report:', error);
      toast({
        title: "Error",
        description: "Failed to create scheduled report.",
        variant: "destructive",
      });
    }
  };

  const toggleReportStatus = async (reportId: string) => {
    setScheduledReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, isActive: !report.isActive }
          : report
      )
    );

    toast({
      title: "Status updated",
      description: "Report status has been updated.",
    });
  };

  const deleteReport = async (reportId: string) => {
    setScheduledReports(prev => prev.filter(report => report.id !== reportId));
    
    toast({
      title: "Report deleted",
      description: "Scheduled report has been deleted.",
    });
  };

  const addRecipient = () => {
    setNewReport(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }));
  };

  const updateRecipient = (index: number, email: string) => {
    setNewReport(prev => ({
      ...prev,
      recipients: prev.recipients.map((recipient, i) => 
        i === index ? email : recipient
      )
    }));
  };

  const removeRecipient = (index: number) => {
    setNewReport(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: 'bg-blue-500',
      weekly: 'bg-green-500',
      monthly: 'bg-purple-500',
      quarterly: 'bg-orange-500'
    };
    
    return (
      <Badge className={`${colors[frequency as keyof typeof colors]} text-white`}>
        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
      </Badge>
    );
  };

  const reportTypes = [
    { value: 'training_completion', label: 'Training Completion Report' },
    { value: 'compliance_status', label: 'Compliance Status Report' },
    { value: 'certificate_tracking', label: 'Certificate Tracking Report' },
    { value: 'employee_progress', label: 'Employee Progress Report' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Scheduled Reports</h3>
          <p className="text-sm text-muted-foreground">
            Automate regular report delivery to stakeholders
          </p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule New Report
        </Button>
      </div>

      {/* Create New Report Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Report</CardTitle>
            <CardDescription>
              Set up automated report delivery for your team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  placeholder="Weekly Training Summary"
                  value={newReport.name}
                  onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select 
                  value={newReport.reportType}
                  onValueChange={(value) => setNewReport(prev => ({ ...prev, reportType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select 
                value={newReport.frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'quarterly') => 
                  setNewReport(prev => ({ ...prev, frequency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Email Recipients</Label>
              <div className="space-y-2 mt-2">
                {newReport.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="email@company.com"
                      value={recipient}
                      onChange={(e) => updateRecipient(index, e.target.value)}
                    />
                    {newReport.recipients.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRecipient(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRecipient}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
              <Button onClick={createScheduledReport}>
                <Calendar className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Schedules</CardTitle>
          <CardDescription>
            Manage your automated report schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled reports yet.</p>
              <p className="text-sm">Create your first automated report schedule above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{report.name}</h4>
                      {getFrequencyBadge(report.frequency)}
                      <Badge variant={report.isActive ? "default" : "secondary"}>
                        {report.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Type: {reportTypes.find(t => t.value === report.reportType)?.label}</p>
                      <p>Recipients: {report.recipients.join(', ')}</p>
                      <p>Next run: {new Date(report.nextRun).toLocaleDateString()}</p>
                      {report.lastRun && (
                        <p>Last run: {new Date(report.lastRun).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleReportStatus(report.id)}
                    >
                      {report.isActive ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}