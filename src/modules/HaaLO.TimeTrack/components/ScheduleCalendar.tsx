import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Users, Clock, AlertTriangle } from "lucide-react";
import { SchedulingService } from "../services/SchedulingService";
import { ScheduleWeekView, AttendanceVariance } from "../types/scheduling";

interface ScheduleCalendarProps {
  companyId: string;
  onCreateShift?: () => void;
  onEditShift?: (shiftId: string) => void;
}

export function ScheduleCalendar({ companyId, onCreateShift, onEditShift }: ScheduleCalendarProps) {
  const [weekSchedule, setWeekSchedule] = useState<ScheduleWeekView[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Get week start (Monday)
  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const weekStart = getWeekStart(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  useEffect(() => {
    loadWeekSchedule();
  }, [companyId, currentWeek]);

  const loadWeekSchedule = async () => {
    try {
      setLoading(true);
      const schedule = await SchedulingService.getWeekSchedule(
        companyId,
        weekStart.toISOString()
      );
      setWeekSchedule(schedule);
    } catch (error) {
      console.error('Failed to load week schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getShiftDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(1)}h`;
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Schedule Calendar
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigateWeek('prev')}>
              Previous
            </Button>
            <span className="font-medium min-w-[200px] text-center">
              {weekStart.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })} - {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <Button variant="outline" onClick={() => navigateWeek('next')}>
              Next
            </Button>
          </div>
        </div>
        <Button onClick={onCreateShift} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Shift
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left min-w-[200px]">Employee</th>
                  {weekDays.map((day, index) => (
                    <th key={index} className="p-4 text-center min-w-[120px]">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {day.getDate()}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="p-4 text-center min-w-[100px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {weekSchedule.map((employee) => (
                  <tr key={employee.employee_id} className="border-b hover:bg-muted/25">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{employee.employee_name}</span>
                      </div>
                    </td>
                    {weekDays.map((day, index) => {
                      const dateStr = day.toISOString().split('T')[0];
                      const dayShifts = employee.shifts[dateStr] || [];
                      
                      return (
                        <td key={index} className="p-2">
                          <div className="space-y-1">
                            {dayShifts.map((shift) => (
                              <div
                                key={shift.id}
                                className="bg-primary/10 border border-primary/20 rounded-lg p-2 cursor-pointer hover:bg-primary/20 transition-colors"
                                onClick={() => onEditShift?.(shift.id)}
                              >
                                <div className="text-xs font-medium">
                                  {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {getShiftDuration(shift.start_time, shift.end_time)}
                                </div>
                                {shift.job_code && (
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {shift.job_code}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {employee.total_scheduled_hours.toFixed(1)}h
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {weekSchedule.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No schedules found</h3>
            <p className="text-muted-foreground mb-4">
              Create shifts to get started with employee scheduling
            </p>
            <Button onClick={onCreateShift}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Shift
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}