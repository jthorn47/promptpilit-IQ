import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";
import { SchedulingService } from "../services/SchedulingService";
import { AttendanceReport as AttendanceReportType, AttendanceVariance } from "../types/scheduling";

interface AttendanceReportProps {
  companyId: string;
}

export function AttendanceReport({ companyId }: AttendanceReportProps) {
  const [report, setReport] = useState<AttendanceReportType | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReport();
  }, [companyId, selectedDate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const reportData = await SchedulingService.generateAttendanceReport(companyId, selectedDate);
      setReport(reportData);
    } catch (error) {
      console.error('Failed to load attendance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVarianceIcon = (type: AttendanceVariance['variance_type']) => {
    switch (type) {
      case 'no_show':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'late_arrival':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'early_departure':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'unscheduled':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'early_clockin':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getVarianceBadge = (type: AttendanceVariance['variance_type']) => {
    const config = {
      no_show: { label: 'No Show', variant: 'destructive' as const },
      late_arrival: { label: 'Late', variant: 'secondary' as const },
      early_departure: { label: 'Early Leave', variant: 'outline' as const },
      unscheduled: { label: 'Unscheduled', variant: 'default' as const },
      early_clockin: { label: 'Early', variant: 'secondary' as const }
    };

    const { label, variant } = config[type];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const formatVarianceMinutes = (minutes: number) => {
    if (minutes === 0) return '';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '--';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Attendance Report
          </h2>
          <p className="text-muted-foreground">
            Track schedule compliance and attendance variances
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button variant="outline" onClick={loadReport} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold">{report.summary.total_scheduled}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-green-600">{report.summary.total_present}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{report.summary.total_late}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">No Shows</p>
                  <p className="text-2xl font-bold text-red-600">{report.summary.total_no_shows}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unscheduled</p>
                  <p className="text-2xl font-bold text-blue-600">{report.summary.total_unscheduled}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Variance Details */}
      {report && report.variances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Variances</CardTitle>
            <CardDescription>
              Detailed breakdown of schedule deviations for {new Date(selectedDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.variances.map((variance, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getVarianceIcon(variance.variance_type)}
                    <div>
                      <p className="font-medium">Employee ID: {variance.employee_id}</p>
                      <p className="text-sm text-muted-foreground">
                        Scheduled: {formatTime(variance.scheduled_start)} - {formatTime(variance.scheduled_end)}
                      </p>
                      {variance.actual_start && (
                        <p className="text-sm text-muted-foreground">
                          Actual: {formatTime(variance.actual_start)} 
                          {variance.actual_end && ` - ${formatTime(variance.actual_end)}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {variance.variance_minutes > 0 && (
                      <span className="text-sm font-medium">
                        {formatVarianceMinutes(variance.variance_minutes)}
                      </span>
                    )}
                    {getVarianceBadge(variance.variance_type)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {report && report.variances.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Perfect Attendance!</h3>
            <p className="text-muted-foreground">
              No attendance variances found for {new Date(selectedDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}