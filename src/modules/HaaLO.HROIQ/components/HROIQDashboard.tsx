import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Users,
  FileText,
  Building2,
  Activity
} from 'lucide-react';
import { useMonthlyServiceReports } from '@/hooks/useMonthlyServiceReports';
import { useUnifiedTimeTracking } from '@/hooks/useUnifiedTimeTracking';
import { useRetainerUsageAlerts } from '@/hooks/useRetainerUsageAlerts';
import { UnifiedClientDashboard } from '@/components/hroiq/UnifiedClientDashboard';

export const HROIQDashboard: React.FC = () => {
  const { reports, generateReport } = useMonthlyServiceReports();
  const { timeEntries, getTotalHours, getBillableHours } = useUnifiedTimeTracking();
  const { getActiveAlerts } = useRetainerUsageAlerts();

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
  const activeAlerts = getActiveAlerts();
  
  // Calculate this month's metrics
  const thisMonthEntries = timeEntries?.filter(entry => {
    const entryDate = new Date(entry.work_date);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  }) || [];
  
  const thisMonthHours = getTotalHours(thisMonthEntries);
  const billableHours = getBillableHours(thisMonthEntries);
  const estimatedRevenue = billableHours * 150; // Assume $150/hour average

  // Mock retainer data for the overview - will be replaced with real data
  const retainerData = {
    totalHours: 40,
    usedHours: thisMonthHours,
    rolloverBank: 15,
    overageHours: Math.max(0, thisMonthHours - 40),
    billingPeriod: 'Monthly',
    overageRate: 175
  };

  const utilizationPercentage = (retainerData.usedHours / retainerData.totalHours) * 100;
  const isOverage = retainerData.overageHours > 0;

  const handleGenerateReport = (companyId: string) => {
    generateReport({ companyId, reportMonth: currentMonth });
  };

  return (
    <div className="space-y-6">

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts ({activeAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activeAlerts.slice(0, 3).map((alert) => (
                <Badge key={alert.id} variant="outline" className="border-warning text-warning">
                  {alert.alert_type.replace('_', ' ').toUpperCase()}
                </Badge>
              ))}
              {activeAlerts.length > 3 && (
                <Badge variant="outline" className="border-warning text-warning">
                  +{activeAlerts.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  With active retainers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{thisMonthHours.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  {billableHours.toFixed(1)} billable
                </p>
                <Progress value={(billableHours / thisMonthHours) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${estimatedRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usage Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAlerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  Require attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest service deliveries and case work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {thisMonthEntries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {entry.description || 'Service delivery'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.time_type.replace('_', ' ')} • {new Date(entry.work_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {entry.hours_logged}h
                      </Badge>
                    </div>
                  ))}
                  {thisMonthEntries.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and report generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleGenerateReport('current')} 
                  className="w-full"
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Monthly Reports
                </Button>
                
                <Button variant="outline" className="w-full">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">System Health</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pulse Integration</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Active
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Sync</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Current
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>
                View and manage all HRO IQ clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Select a client to view their unified dashboard with retainer usage, 
                active cases, and service history.
              </p>
              {/* This would be a list of clients - using placeholder for now */}
              <div className="space-y-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Acme Corporation</h4>
                      <p className="text-sm text-muted-foreground">Standard retainer • 85% used</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Dashboard
                    </Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">TechStart Inc</h4>
                      <p className="text-sm text-muted-foreground">Premium retainer • 62% used</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Service Reports</CardTitle>
              <CardDescription>
                Generate and manage monthly service reports for all clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Current Month Reports</h4>
                  <Button onClick={() => handleGenerateReport('all')}>
                    Generate All Reports
                  </Button>
                </div>
                
                {reports && reports.length > 0 ? (
                  <div className="space-y-2">
                    {reports.slice(0, 5).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {new Date(report.report_month).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {report.total_hours_used}h used • {report.total_cases_resolved} cases resolved
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            report.status === 'sent' ? 'default' : 
                            report.status === 'final' ? 'secondary' : 'outline'
                          }>
                            {report.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reports generated yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>HRO IQ Analytics</CardTitle>
                <CardDescription>
                  Performance metrics and business intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{billableHours.toFixed(1)}h</div>
                    <p className="text-sm text-muted-foreground">Billable Hours MTD</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">92%</div>
                    <p className="text-sm text-muted-foreground">Utilization Rate</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">2.3</div>
                    <p className="text-sm text-muted-foreground">Avg Cases/Client</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>
                  Status of HRO IQ and Pulse integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Unified Time Tracking</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Case-Retainer Linking</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Monthly Report Generation</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Usage Alert System</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};