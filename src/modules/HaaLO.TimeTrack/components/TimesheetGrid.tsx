import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';
import { TimesheetRow, TimeProject, TimeCode, ComplianceIssue } from '../types';
import { format, addDays } from 'date-fns';

interface TimesheetGridProps {
  weekStart: string;
  rows: TimesheetRow[];
  projects: TimeProject[];
  timeCodes: TimeCode[];
  complianceIssues: ComplianceIssue[];
  onRowUpdate: (rowId: string, data: Partial<TimesheetRow>) => void;
  onRowAdd: () => void;
  onRowDelete: (rowId: string) => void;
  isUpdating?: boolean;
}

export const TimesheetGrid: React.FC<TimesheetGridProps> = ({
  weekStart,
  rows,
  projects,
  timeCodes,
  complianceIssues,
  onRowUpdate,
  onRowAdd,
  onRowDelete,
  isUpdating = false
}) => {
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(weekStart), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE'),
      fullDate: format(date, 'MMM d')
    };
  });

  const updateHours = (rowId: string, date: string, hours: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    const numericHours = parseFloat(hours) || 0;
    const newDailyHours = { ...row.dailyHours, [date]: numericHours };
    const totalHours = Object.values(newDailyHours).reduce((sum, h) => sum + h, 0);

    onRowUpdate(rowId, {
      dailyHours: newDailyHours,
      totalHours
    });
  };

  const getRowIssues = (rowId: string) => {
    return complianceIssues.filter(issue => issue.rowId === rowId);
  };

  const getDayIssues = (rowId: string, date: string) => {
    return complianceIssues.filter(issue => issue.rowId === rowId && issue.date === date);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-[200px_150px_200px_repeat(7,80px)_100px_40px] gap-2 items-center text-sm font-medium text-muted-foreground">
        <div>Project</div>
        <div>Time Code</div>
        <div>Tags</div>
        {weekDays.map(day => (
          <div key={day.date} className="text-center">
            <div>{day.label}</div>
            <div className="text-xs">{day.fullDate}</div>
          </div>
        ))}
        <div className="text-center">Total</div>
        <div></div>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {rows.map(row => {
          const rowIssues = getRowIssues(row.id);
          const hasErrors = rowIssues.some(issue => issue.severity === 'error');
          const hasWarnings = rowIssues.some(issue => issue.severity === 'warning');

          return (
            <div
              key={row.id}
              className={`grid grid-cols-[200px_150px_200px_repeat(7,80px)_100px_40px] gap-2 items-center p-2 rounded-lg border ${
                hasErrors ? 'border-destructive/50 bg-destructive/5' :
                hasWarnings ? 'border-warning/50 bg-warning/5' :
                'border-border bg-background'
              }`}
            >
              {/* Project Select */}
              <Select
                value={row.projectId || ''}
                onValueChange={(value) => onRowUpdate(row.id, { projectId: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Time Code Select */}
              <Select
                value={row.timeCodeId || ''}
                onValueChange={(value) => onRowUpdate(row.id, { timeCodeId: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {timeCodes.map(code => (
                    <SelectItem key={code.id} value={code.id}>
                      {code.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tags */}
              <div className="flex gap-1 flex-wrap">
                {row.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Daily Hours */}
              {weekDays.map(day => {
                const hours = row.dailyHours[day.date] || 0;
                const dayIssues = getDayIssues(row.id, day.date);
                const hasDayError = dayIssues.some(issue => issue.severity === 'error');
                const hasDayWarning = dayIssues.some(issue => issue.severity === 'warning');

                return (
                  <div key={day.date} className="relative">
                    <Input
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      value={hours || ''}
                      onChange={(e) => updateHours(row.id, day.date, e.target.value)}
                      className={`h-8 text-center ${
                        hasDayError ? 'border-destructive' :
                        hasDayWarning ? 'border-warning' :
                        ''
                      }`}
                      placeholder="0"
                      disabled={isUpdating}
                    />
                    {(hasDayError || hasDayWarning) && (
                      <AlertTriangle className={`absolute -top-1 -right-1 h-3 w-3 ${
                        hasDayError ? 'text-destructive' : 'text-warning'
                      }`} />
                    )}
                  </div>
                );
              })}

              {/* Total Hours */}
              <div className="text-center font-medium">
                {row.totalHours.toFixed(2)}
              </div>

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRowDelete(row.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                disabled={isUpdating}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Add Row Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRowAdd}
        className="w-full"
        disabled={isUpdating}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Row
      </Button>

      {/* Compliance Issues */}
      {complianceIssues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Compliance Issues
          </h4>
          <div className="space-y-1">
            {complianceIssues.map((issue, index) => (
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
    </div>
  );
};