import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Settings, Download, Plus } from 'lucide-react';
import { PayCalendarView } from '@/components/payroll/PayCalendarView';
import { PayCalendarRules } from '@/components/payroll/PayCalendarRules';
import { HolidayManager } from '@/components/payroll/HolidayManager';

const PayCalendarPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('calendar');

  const handleExportCalendar = () => {
    // Export calendar logic
    console.log('Exporting calendar...');
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Pay Calendar Management</h1>
              <p className="text-lg text-muted-foreground">
                Configure pay schedules, holiday rules, and cutoff settings
              </p>
            </div>
          </div>
          <Button 
            onClick={handleExportCalendar}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Calendar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Pay Rules
          </TabsTrigger>
          <TabsTrigger value="holidays" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Holidays
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <PayCalendarView />
        </TabsContent>

        <TabsContent value="rules">
          <PayCalendarRules />
        </TabsContent>

        <TabsContent value="holidays">
          <HolidayManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayCalendarPage;