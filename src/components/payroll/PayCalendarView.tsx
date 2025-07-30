import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  DollarSign,
  Clock,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';

interface PayPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  payDate: Date;
  cutoffDate: Date;
  status: 'upcoming' | 'active' | 'processing' | 'completed';
}

interface Holiday {
  date: Date;
  name: string;
  type: 'federal' | 'state' | 'company';
}

// Mock data
const mockPayPeriods: PayPeriod[] = [
  {
    id: '1',
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 0, 15),
    payDate: new Date(2024, 0, 31),
    cutoffDate: new Date(2024, 0, 28),
    status: 'completed'
  },
  {
    id: '2',
    startDate: new Date(2024, 0, 16),
    endDate: new Date(2024, 0, 31),
    payDate: new Date(2024, 1, 15),
    cutoffDate: new Date(2024, 1, 12),
    status: 'processing'
  },
  {
    id: '3',
    startDate: new Date(2024, 1, 1),
    endDate: new Date(2024, 1, 15),
    payDate: new Date(2024, 1, 28),
    cutoffDate: new Date(2024, 1, 25),
    status: 'active'
  }
];

const mockHolidays: Holiday[] = [
  {
    date: new Date(2024, 0, 1),
    name: "New Year's Day",
    type: 'federal'
  },
  {
    date: new Date(2024, 1, 19),
    name: "Presidents' Day",
    type: 'federal'
  },
  {
    date: new Date(2024, 4, 27),
    name: "Memorial Day",
    type: 'federal'
  }
];

interface PayCalendarViewProps {
  autoProcessing?: boolean;
  locked?: boolean;
}

export const PayCalendarView: React.FC<PayCalendarViewProps> = ({ 
  autoProcessing = false, 
  locked = false 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'quarter' | 'year'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDateEvents = (date: Date) => {
    const events = [];
    
    // Check for pay periods
    const payPeriod = mockPayPeriods.find(period => 
      (date >= period.startDate && date <= period.endDate) ||
      isSameDay(date, period.payDate) ||
      isSameDay(date, period.cutoffDate)
    );
    
    if (payPeriod) {
      if (isSameDay(date, payPeriod.payDate)) {
        events.push({ type: 'pay-date', period: payPeriod });
      }
      if (isSameDay(date, payPeriod.cutoffDate)) {
        events.push({ type: 'cutoff-date', period: payPeriod });
      }
      if (date >= payPeriod.startDate && date <= payPeriod.endDate) {
        events.push({ type: 'pay-period', period: payPeriod });
      }
    }
    
    // Check for holidays
    const holiday = mockHolidays.find(h => isSameDay(h.date, date));
    if (holiday) {
      events.push({ type: 'holiday', holiday });
    }
    
    return events;
  };

  const getDayClassName = (date: Date, events: any[]) => {
    let className = 'min-h-[80px] p-1 border border-border text-sm relative ';
    
    if (!isSameMonth(date, currentDate)) {
      className += 'text-muted-foreground bg-muted/20 ';
    } else {
      className += 'bg-background hover:bg-muted/50 ';
    }
    
    if (events.some(e => e.type === 'pay-date')) {
      className += 'bg-green-50 border-green-200 ';
    } else if (events.some(e => e.type === 'cutoff-date')) {
      className += 'bg-orange-50 border-orange-200 ';
    } else if (events.some(e => e.type === 'pay-period')) {
      className += 'bg-blue-50 border-blue-200 ';
    }
    
    if (events.some(e => e.type === 'holiday')) {
      className += 'bg-red-50 border-red-200 ';
    }
    
    return className;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={view} onValueChange={(value: any) => setView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setCurrentDate(new Date())}>Today</Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Legend */}
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-200 border border-blue-300 rounded"></div>
              <span>Pay Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
              <span>Pay Date</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-200 border border-orange-300 rounded"></div>
              <span>Cutoff Date</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
              <span>Holiday</span>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 border border-border rounded-lg overflow-hidden">
            {/* Week Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 bg-muted font-medium text-center text-sm">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map((date) => {
              const events = getDateEvents(date);
              return (
                <div key={date.toISOString()} className={getDayClassName(date, events)}>
                  <div className="font-medium">{format(date, 'd')}</div>
                  
                  {/* Event indicators */}
                  <div className="mt-1 space-y-1">
                    {events.map((event, index) => (
                      <div key={index} className="text-xs">
                        {event.type === 'pay-date' && (
                          <div className="flex items-center gap-1 text-green-700">
                            <DollarSign className="h-3 w-3" />
                            <span>Pay</span>
                          </div>
                        )}
                        {event.type === 'cutoff-date' && (
                          <div className="flex items-center gap-1 text-orange-700">
                            <Clock className="h-3 w-3" />
                            <span>Cutoff</span>
                          </div>
                        )}
                        {event.type === 'holiday' && (
                          <div className="flex items-center gap-1 text-red-700">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.holiday.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Pay Date</p>
                <p className="font-semibold">February 28, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Next Cutoff</p>
                <p className="font-semibold">February 25, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Holiday Conflicts</p>
                <p className="font-semibold">1 detected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};