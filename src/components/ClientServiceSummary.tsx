import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Download, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { useClientServiceTimeline } from '@/hooks/useClientServiceTimeline';
import { useMonthlyServiceReports } from '@/hooks/useMonthlyServiceReports';
import { format } from 'date-fns';

interface ClientServiceSummaryProps {
  companyId: string;
  currentMonth?: string;
}

export const ClientServiceSummary: React.FC<ClientServiceSummaryProps> = ({
  companyId,
  currentMonth = new Date().toISOString().slice(0, 7) + '-01'
}) => {
  const [selectedDateRange] = useState({
    start: currentMonth,
    end: new Date(new Date(currentMonth).getFullYear(), new Date(currentMonth).getMonth() + 1, 0).toISOString().slice(0, 10)
  });

  const { events, getTotalHours, getBillableHours } = useClientServiceTimeline(companyId, selectedDateRange);
  const { reports, generateReport } = useMonthlyServiceReports(companyId);

  const currentReport = reports?.find(r => r.report_month === currentMonth);
  const totalHours = getTotalHours();
  const billableHours = getBillableHours();

  const getCaseEvents = () => events.filter(e => e.type === 'case');
  const getServiceEvents = () => events.filter(e => e.type === 'service_log');

  const formatEventDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Service Summary - {format(new Date(currentMonth), 'MMMM yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{getCaseEvents().length}</div>
              <div className="text-sm text-muted-foreground">Cases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{getServiceEvents().length}</div>
              <div className="text-sm text-muted-foreground">Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{billableHours.toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Billable Hours</div>
            </div>
          </div>

          {currentReport && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">Monthly report available</span>
                <Badge variant="outline">{currentReport.status}</Badge>
              </div>
              {currentReport.pdf_url && (
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Service Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="cases">Cases</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-3">
                {events.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="mt-1">
                      {event.type === 'case' ? (
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                      ) : event.type === 'service_log' ? (
                        <FileText className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="flex items-center gap-2">
                          {event.hours && (
                            <Badge variant="outline">{event.hours}h</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatEventDate(event.date)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.description}
                      </p>
                      {event.status && (
                        <div className="mt-2">
                          <Badge 
                            variant={event.status === 'closed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {event.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {events.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No activity recorded for this period
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="cases" className="space-y-4">
              <div className="space-y-3">
                {getCaseEvents().map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{event.category}</Badge>
                        {event.status && (
                          <Badge variant={event.status === 'closed' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{event.hours?.toFixed(1)}h</div>
                      <div className="text-xs text-muted-foreground">
                        {formatEventDate(event.date)}
                      </div>
                    </div>
                  </div>
                ))}

                {getCaseEvents().length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No cases recorded for this period
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <div className="space-y-3">
                {getServiceEvents().map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{event.category}</Badge>
                        {event.consultant_name && (
                          <Badge variant="secondary">{event.consultant_name}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{event.hours?.toFixed(1)}h</div>
                      <div className="text-xs text-muted-foreground">
                        {formatEventDate(event.date)}
                      </div>
                      {event.billable && (
                        <div className="text-xs text-green-600">Billable</div>
                      )}
                    </div>
                  </div>
                ))}

                {getServiceEvents().length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No services recorded for this period
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generate Report */}
      {!currentReport && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div>
                <h3 className="font-medium">Monthly Report Not Generated</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a comprehensive monthly service report for {format(new Date(currentMonth), 'MMMM yyyy')}
                </p>
              </div>
              <Button 
                onClick={() => generateReport({ companyId, reportMonth: currentMonth })}
                className="w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Monthly Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};