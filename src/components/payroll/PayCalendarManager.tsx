import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PayCalendarView } from './PayCalendarView';
import { PayrollPeriodManager } from './PayrollPeriodManager';
import { HolidayManager } from './HolidayManager';
import { 
  Calendar, 
  Settings, 
  Clock, 
  Download,
  Lock,
  Play,
  Pause,
  AlertTriangle
} from 'lucide-react';

export const PayCalendarManager: React.FC = () => {
  const [autoProcessing, setAutoProcessing] = useState(false);
  const [calendarLocked, setCalendarLocked] = useState(false);

  const handleExportCalendar = async (format: 'pdf' | 'csv') => {
    try {
      const response = await fetch('/api/generate-pay-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          format, 
          year: new Date().getFullYear() 
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pay-calendar-${new Date().getFullYear()}.${format}`;
        a.click();
      }
    } catch (error) {
      console.error('Failed to export calendar:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Calendar Controls
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={autoProcessing ? "destructive" : "default"}
                size="sm"
                onClick={() => setAutoProcessing(!autoProcessing)}
              >
                {autoProcessing ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {autoProcessing ? 'Disable' : 'Enable'} Auto-Processing
              </Button>
              <Button
                variant={calendarLocked ? "destructive" : "outline"}
                size="sm"
                onClick={() => setCalendarLocked(!calendarLocked)}
              >
                <Lock className="h-4 w-4 mr-1" />
                {calendarLocked ? 'Unlock' : 'Lock'} Calendar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Pay Days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Cutoff Dates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Holidays</span>
            </div>
          </div>
          
          {autoProcessing && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Auto-processing enabled - Payroll will run automatically on scheduled dates
                </span>
              </div>
            </div>
          )}
          
          {calendarLocked && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Calendar is locked - No changes can be made to pay periods
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Calendar Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pay Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportCalendar('pdf')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportCalendar('csv')}
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calendar">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="periods">Pay Periods</TabsTrigger>
              <TabsTrigger value="holidays">Holidays</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="mt-6">
              <PayCalendarView 
                autoProcessing={autoProcessing}
                locked={calendarLocked}
              />
            </TabsContent>
            
            <TabsContent value="periods" className="mt-6">
              <PayrollPeriodManager locked={calendarLocked} />
            </TabsContent>
            
            <TabsContent value="holidays" className="mt-6">
              <HolidayManager locked={calendarLocked} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};