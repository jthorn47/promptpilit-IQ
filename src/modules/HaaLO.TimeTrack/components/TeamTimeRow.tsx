import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertTriangle, 
  Check, 
  X, 
  MoreVertical, 
  Clock, 
  User, 
  Calendar,
  History
} from 'lucide-react';
import { TeamTimeEntry } from '../types';
import { PulseAlertBadge } from './PulseAlertBadge';
import { format, addDays } from 'date-fns';

interface TeamTimeRowProps {
  entry: TeamTimeEntry;
  weekStart: string;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onApprove: (employeeId: string) => void;
  onReject: (employeeId: string, reason?: string) => void;
  onEdit: (employeeId: string) => void;
  onViewAudit: (employeeId: string) => void;
}

export const TeamTimeRow: React.FC<TeamTimeRowProps> = ({
  entry,
  weekStart,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  onEdit,
  onViewAudit
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(weekStart), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE'),
      fullDate: format(date, 'MMM d')
    };
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: { variant: 'outline', label: 'Draft', color: 'text-muted-foreground' },
      submitted: { variant: 'secondary', label: 'Submitted', color: 'text-blue-600' },
      approved: { variant: 'default', label: 'Approved', color: 'text-green-600' },
      rejected: { variant: 'destructive', label: 'Rejected', color: 'text-red-600' }
    } as const;

    const config = variants[status as keyof typeof variants] || variants.draft;
    
    return (
      <Badge variant={config.variant as any} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const hasComplianceIssues = entry.complianceIssues.length > 0;
  const canApprove = entry.status === 'submitted';
  const canEdit = ['draft', 'rejected'].includes(entry.status);

  return (
    <div className="border rounded-lg bg-background">
      {/* Main Row */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4"
              disabled={!canApprove}
            />
            
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{entry.employeeName}</span>
                  {entry.department && (
                    <Badge variant="outline" className="text-xs">
                      {entry.department}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {entry.totalHours}h total
                  </div>
                  {entry.submittedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Submitted {format(new Date(entry.submittedAt), 'MMM d')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Daily Hours Summary */}
            <div className="hidden md:flex gap-1">
              {weekDays.map(day => {
                const hours = entry.dailyHours[day.date] || 0;
                return (
                  <div key={day.date} className="text-center min-w-[40px]">
                    <div className="text-xs text-muted-foreground">{day.label}</div>
                    <div className={`text-sm font-medium ${hours > 8 ? 'text-warning' : ''}`}>
                      {hours || '-'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status and Issues */}
            <div className="flex items-center gap-2">
              {/* Mock Pulse alerts - in real implementation would come from props */}
              {entry.totalHours > 40 && (
                <PulseAlertBadge
                  type="overtime"
                  severity="high"
                  message={`Employee worked ${entry.totalHours} hours this week`}
                  pulseLink="https://pulse.app/alerts/123"
                />
              )}
              {hasComplianceIssues && (
                <AlertTriangle className="h-4 w-4 text-warning" />
              )}
              {getStatusBadge(entry.status)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {canApprove && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onApprove(entry.employeeId)}
                    className="h-8 px-2"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(entry.employeeId)}
                    className="h-8 px-2"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Collapse' : 'Expand'} Details
                  </DropdownMenuItem>
                  {canEdit && (
                    <DropdownMenuItem onClick={() => onEdit(entry.employeeId)}>
                      Edit Timesheet
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onViewAudit(entry.employeeId)}>
                    <History className="h-4 w-4 mr-2" />
                    View Audit Log
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t bg-muted/30 p-4">
          <div className="space-y-4">
            {/* Daily Breakdown */}
            <div>
              <h4 className="text-sm font-medium mb-2">Daily Hours Breakdown</h4>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map(day => {
                  const hours = entry.dailyHours[day.date] || 0;
                  return (
                    <Card key={day.date} className="p-2">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">{day.label}</div>
                        <div className="text-xs text-muted-foreground">{day.fullDate}</div>
                        <div className={`text-lg font-semibold mt-1 ${
                          hours > 8 ? 'text-warning' : 
                          hours === 0 ? 'text-muted-foreground' : 
                          'text-foreground'
                        }`}>
                          {hours || '0'}h
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Compliance Issues */}
            {hasComplianceIssues && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Compliance Issues
                </h4>
                <div className="space-y-1">
                  {entry.complianceIssues.map((issue, index) => (
                    <div
                      key={index}
                      className={`text-sm p-2 rounded border ${
                        issue.severity === 'error' 
                          ? 'border-destructive/50 bg-destructive/5 text-destructive'
                          : 'border-warning/50 bg-warning/5 text-warning'
                      }`}
                    >
                      {issue.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time Entries */}
            {entry.entries.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Time Entries</h4>
                <div className="space-y-1">
                  {entry.entries.map((timeEntry, index) => (
                    <div key={index} className="text-sm p-2 bg-background rounded border">
                      <div className="flex justify-between items-center">
                        <span>{timeEntry.project_id || 'No Project'}</span>
                        <span>{timeEntry.hours}h</span>
                      </div>
                      {timeEntry.notes && (
                        <div className="text-muted-foreground text-xs mt-1">
                          {timeEntry.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};