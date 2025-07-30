import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, CheckCircle, Edit } from 'lucide-react';
import { TimeEntry } from '@/types/timeAttendance';

interface TimecardViewProps {
  entries: TimeEntry[];
  isAdmin?: boolean;
  onEditEntry?: (entry: TimeEntry) => void;
  onApproveTimecard?: () => void;
}

export const TimecardView: React.FC<TimecardViewProps> = ({
  entries,
  isAdmin = false,
  onEditEntry,
  onApproveTimecard,
}) => {
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      approved: { variant: 'default' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
      edited: { variant: 'outline' as const, label: 'Edited' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const hasExceptions = (entry: TimeEntry) => {
    return !entry.punch_out_time || entry.overtime_hours > 0;
  };

  const totalHours = entries.reduce((sum, entry) => sum + entry.total_hours, 0);
  const totalRegular = entries.reduce((sum, entry) => sum + entry.regular_hours, 0);
  const totalOvertime = entries.reduce((sum, entry) => sum + entry.overtime_hours, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Weekly Timecard
            </CardTitle>
            <CardDescription>
              {entries.length > 0 
                ? `${formatDate(entries[entries.length - 1].entry_date)} - ${formatDate(entries[0].entry_date)}`
                : 'No entries this week'
              }
            </CardDescription>
          </div>
          {isAdmin && onApproveTimecard && (
            <Button onClick={onApproveTimecard} size="sm">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalRegular.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Regular</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalOvertime.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Overtime</div>
          </div>
        </div>

        {/* Daily Entries */}
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{formatDate(entry.entry_date)}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(entry.status)}
                    {hasExceptions(entry) && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{entry.total_hours.toFixed(1)} hrs</div>
                  {entry.overtime_hours > 0 && (
                    <div className="text-sm text-orange-600">
                      +{entry.overtime_hours.toFixed(1)} OT
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">In:</span>
                  <div className="font-mono">{formatTime(entry.punch_in_time)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Out:</span>
                  <div className="font-mono">{formatTime(entry.punch_out_time)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Break:</span>
                  <div className="font-mono">
                    {entry.break_start_time && entry.break_end_time
                      ? `${formatTime(entry.break_start_time)}-${formatTime(entry.break_end_time)}`
                      : '--:--'
                    }
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-muted-foreground">Regular:</span>
                    <div className="font-mono">{entry.regular_hours.toFixed(1)}h</div>
                  </div>
                  {isAdmin && onEditEntry && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditEntry(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {entry.notes && (
                <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                  <strong>Note:</strong> {entry.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No time entries recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};