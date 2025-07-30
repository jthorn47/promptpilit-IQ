import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { useHROIQRetainer } from '@/modules/HaaLO.HROIQ/hooks/useHROIQRetainer';
import { useUnifiedTimeTracking } from '@/hooks/useUnifiedTimeTracking';
import { useRetainerUsageAlerts } from '@/hooks/useRetainerUsageAlerts';
import { usePulseCases } from '@/modules/CaseManagement/hooks/usePulseCases';

interface UnifiedClientDashboardProps {
  companyId: string;
}

export const UnifiedClientDashboard = ({ companyId }: UnifiedClientDashboardProps) => {
  const { retainer, calculateUsage } = useHROIQRetainer(companyId);
  const { timeEntries, getTotalHours, getBillableHours } = useUnifiedTimeTracking(companyId);
  const { getActiveAlerts } = useRetainerUsageAlerts(companyId);
  const { cases } = usePulseCases({ company_id: companyId });

  const usage = calculateUsage();
  const activeAlerts = getActiveAlerts();
  const activeCases = cases?.filter(c => ['open', 'in_progress'].includes(c.status)) || [];
  const monthlyHours = getTotalHours(timeEntries?.filter(entry => {
    const entryDate = new Date(entry.work_date);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  }));

  return (
    <div className="space-y-6">
      {/* Retainer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Used</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.used} / {usage.total}</div>
            <Progress value={usage.percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {usage.remaining} hours remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCases.length}</div>
            <p className="text-xs text-muted-foreground">
              {cases?.length || 0} total cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Hours logged this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Active Alerts
            </CardTitle>
            <CardDescription>
              Important notifications about your retainer usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {alert.alert_type === '75_percent' && 'Retainer 75% Used'}
                      {alert.alert_type === '90_percent' && 'Retainer 90% Used'}
                      {alert.alert_type === '100_percent' && 'Retainer Fully Used'}
                      {alert.alert_type === 'overage' && 'Retainer Overage'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {alert.current_hours} / {alert.threshold_hours} hours
                    </p>
                  </div>
                  <Badge variant="outline" className="border-warning text-warning">
                    {alert.alert_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest cases and time entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Recent Cases */}
            <div>
              <h4 className="font-medium mb-2">Recent Cases</h4>
              <div className="space-y-2">
                {activeCases.slice(0, 3).map((case_) => (
                  <div key={case_.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium text-sm">{case_.title}</p>
                      <p className="text-xs text-muted-foreground">{case_.type}</p>
                    </div>
                    <Badge variant="outline">
                      {case_.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Time Entries */}
            <div>
              <h4 className="font-medium mb-2">Recent Time Entries</h4>
              <div className="space-y-2">
                {timeEntries?.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <p className="font-medium text-sm">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.time_type.replace('_', ' ')} • {new Date(entry.work_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {entry.hours_logged}h
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};