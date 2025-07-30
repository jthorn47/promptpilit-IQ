import React, { useState } from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format, startOfWeek } from 'date-fns';
import { WeekNavigator } from './WeekNavigator';
import { TimeSummaryCharts } from './TimeSummaryCharts';
import { useTimeSummary } from '../hooks/useTimeSummary';
import { ComplianceFlag } from '../types';

export const TimeSummaryPage: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(() => 
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );

  const {
    summary,
    isLoading,
    error,
    exportSummary,
    isExporting
  } = useTimeSummary(currentWeek);

  const getSeverityIcon = (severity: string) => {
    return severity === 'error' ? (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
    );
  };

  const getSeverityVariant = (severity: string) => {
    return severity === 'error' ? 'destructive' : 'secondary';
  };

  const getComplianceStatus = (flags: ComplianceFlag[]) => {
    const hasErrors = flags.some(flag => flag.severity === 'error');
    const hasWarnings = flags.some(flag => flag.severity === 'warning');
    
    if (hasErrors) {
      return { status: 'Issues Found', variant: 'destructive', icon: AlertTriangle };
    }
    if (hasWarnings) {
      return { status: 'Warnings', variant: 'secondary', icon: AlertTriangle };
    }
    return { status: 'Compliant', variant: 'default', icon: CheckCircle };
  };

  if (isLoading) {
    return (
      <UnifiedLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Time Summary</h1>
              <p className="text-muted-foreground">Weekly time activity and compliance overview</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (error || !summary) {
    return (
      <UnifiedLayout>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-destructive">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>Failed to load time summary</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </UnifiedLayout>
    );
  }

  const complianceStatus = getComplianceStatus(summary.complianceFlags);
  const StatusIcon = complianceStatus.icon;

  return (
    <UnifiedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Time Summary</h1>
            <p className="text-muted-foreground">Weekly time activity and compliance overview</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportSummary('pdf')}
              disabled={isExporting}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportSummary('excel')}
              disabled={isExporting}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Week Navigator */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <WeekNavigator
                currentWeek={currentWeek}
                onWeekChange={setCurrentWeek}
              />
              
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-4 w-4 ${
                  complianceStatus.variant === 'destructive' ? 'text-red-500' :
                  complianceStatus.variant === 'secondary' ? 'text-yellow-500' :
                  'text-green-500'
                }`} />
                <Badge variant={complianceStatus.variant as any}>
                  {complianceStatus.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Compliance Alerts */}
        {summary.complianceFlags.length > 0 && (
          <div className="space-y-3">
            {summary.complianceFlags.map((flag, index) => (
              <Alert key={index} variant={getSeverityVariant(flag.severity) as any}>
                <div className="flex items-start gap-3">
                  {getSeverityIcon(flag.severity)}
                  <div className="flex-1">
                    <AlertDescription>
                      <span className="font-medium">{flag.message}</span>
                      {flag.value && flag.threshold && (
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({flag.value}h vs {flag.threshold}h limit)
                        </span>
                      )}
                      {flag.dates && flag.dates.length > 0 && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          Affected dates: {flag.dates.map(date => format(new Date(date), 'MMM d')).join(', ')}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalHours}h</div>
              <p className="text-xs text-muted-foreground">
                {summary.totalHours > summary.weeklyTarget ? '+' : ''}
                {(summary.totalHours - summary.weeklyTarget).toFixed(1)}h vs target
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regular Hours</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.regularHours}h</div>
              <p className="text-xs text-muted-foreground">
                {((summary.regularHours / summary.totalHours) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.overtimeHours}h</div>
              <p className="text-xs text-muted-foreground">
                {summary.overtimeHours > 0 ? 'Above 40h/week' : 'Within limits'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PTO/Sick Hours</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.ptoHours + summary.sickHours}h</div>
              <p className="text-xs text-muted-foreground">
                PTO: {summary.ptoHours}h | Sick: {summary.sickHours}h
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <TimeSummaryCharts data={summary} />

        {/* Time Code Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>Time Code Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.timeCodeBreakdown.map((code, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: code.color }}
                    />
                    <span className="font-medium">{code.timeCodeName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{code.hours}h</span>
                    <Badge variant="outline">{code.percentage.toFixed(1)}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {summary.dailyBreakdown.map((day, index) => (
                <div 
                  key={index} 
                  className={`p-3 border rounded-lg text-center ${
                    !day.isCompliant ? 'border-yellow-300 bg-yellow-50' : 'border-border'
                  }`}
                >
                  <div className="text-sm font-medium">{day.dayName}</div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {format(new Date(day.date), 'MMM d')}
                  </div>
                  <div className={`text-lg font-bold ${
                    day.hours > day.target ? 'text-red-600' :
                    day.hours < day.target && day.target > 0 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {day.hours}h
                  </div>
                  {day.target > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Target: {day.target}h
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedLayout>
  );
};