import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react';

const PayCalendarTracker: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const { data: payCalendar, isLoading } = useQuery({
    queryKey: ['pay-calendar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_pay_calendar')
        .select('*')
        .order('pay_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processed':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'upcoming':
        return <Calendar className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'processed':
        return 'default';
      case 'approved':
        return 'secondary';
      case 'in_progress':
        return 'destructive';
      case 'upcoming':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const upcomingPaydays = payCalendar?.filter(p => 
    new Date(p.pay_date) >= new Date() && p.status !== 'paid'
  ).slice(0, 3);

  const payDates = payCalendar?.map(p => new Date(p.pay_date)) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-muted/50 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pay Calendar & Payday Tracker</h2>
          <p className="text-muted-foreground">Visual calendar of pay periods and paydays</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
            className="hover-scale"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className="hover-scale"
          >
            <Clock className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Upcoming Paydays Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {upcomingPaydays?.map((payday, index) => (
          <Card key={payday.id} className="bg-card/80 backdrop-blur-sm border-border/50 hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(payday.status)}
                  <h3 className="font-semibold">
                    {index === 0 ? 'Next Payday' : `Payday ${index + 1}`}
                  </h3>
                </div>
                <Badge variant={getStatusColor(payday.status)}>
                  {payday.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {new Date(payday.pay_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(payday.period_start).toLocaleDateString()} - {new Date(payday.period_end).toLocaleDateString()}
                </div>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <CheckCircle className={`w-3 h-3 ${payday.hours_submitted ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span className="text-xs">Hours Submitted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className={`w-3 h-3 ${payday.hours_approved ? 'text-green-500' : 'text-muted-foreground'}`} />
                    <span className="text-xs">Hours Approved</span>
                  </div>
                </div>
                
                {payday.timecard_deadline && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <AlertTriangle className="w-3 h-3" />
                    Timecard due: {new Date(payday.timecard_deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar/List View */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Pay Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={{
                  payday: payDates
                }}
                modifiersStyles={{
                  payday: { 
                    backgroundColor: 'hsl(var(--primary))', 
                    color: 'hsl(var(--primary-foreground))',
                    borderRadius: '50%'
                  }
                }}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-1 bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payCalendar?.filter(p => {
                const today = new Date();
                const payDate = new Date(p.pay_date);
                const daysUntilPay = Math.ceil((payDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return daysUntilPay <= 7 && daysUntilPay >= 0;
              }).map((item) => {
                const daysUntil = Math.ceil((new Date(item.pay_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={item.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">
                        {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Payday: {new Date(item.pay_date).toLocaleDateString()}
                    </div>
                    {!item.hours_submitted && item.timecard_deadline && (
                      <div className="text-xs text-amber-600 mt-1">
                        ⚠️ Timecard deadline approaching
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pay Schedule List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payCalendar?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover-scale">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(item.status)}
                    <div>
                      <div className="font-semibold">
                        {new Date(item.pay_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pay Period: {new Date(item.period_start).toLocaleDateString()} - {new Date(item.period_end).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                      {item.timecard_deadline && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Timecard due: {new Date(item.timecard_deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className={`w-2 h-2 rounded-full ${item.hours_submitted ? 'bg-green-500' : 'bg-muted-foreground'}`} title="Hours Submitted" />
                      <div className={`w-2 h-2 rounded-full ${item.hours_approved ? 'bg-green-500' : 'bg-muted-foreground'}`} title="Hours Approved" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PayCalendarTracker;