import React, { useState } from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { 
  CalendarIcon, 
  Play, 
  BarChart3, 
  FileText, 
  AlertTriangle 
} from 'lucide-react';
import { ReportTable } from './ReportTable';
import { useTimeReports } from '../hooks/useTimeReports';
import { ReportType, ReportFilters } from '../types';

export const TimeReportsPage: React.FC = () => {
  const {
    reportConfigs,
    currentReport,
    isGenerating,
    isExporting,
    generateReport,
    exportReport,
    changePage,
    changePageSize,
    error
  } = useTimeReports();

  const [selectedReportType, setSelectedReportType] = useState<ReportType>('time_by_employee');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const handleDateSelect = (date: Date | undefined, type: 'from' | 'to') => {
    if (date) {
      setDateRange(prev => ({
        ...prev,
        [type]: date
      }));
    }
  };

  const handleGenerateReport = () => {
    const filters: ReportFilters = {
      reportType: selectedReportType,
      dateRange
    };
    generateReport(filters);
  };

  const handleExportReport = (format: 'csv' | 'pdf' | 'excel') => {
    if (!currentReport) return;
    
    exportReport({
      reportData: currentReport,
      options: {
        format,
        includeSummary: true,
        includeCharts: format === 'pdf'
      }
    });
  };

  const handlePageChange = (page: number) => {
    if (!currentReport) return;
    changePage(currentReport.filters, page);
  };

  const handlePageSizeChange = (size: number) => {
    if (!currentReport) return;
    changePageSize(currentReport.filters, size);
  };

  const selectedConfig = reportConfigs.find(config => config.type === selectedReportType);

  // Quick date range presets
  const setQuickRange = (days: number) => {
    const to = new Date();
    const from = subDays(to, days);
    setDateRange({ from, to });
  };

  return (
    <UnifiedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Time Reports</h1>
            <p className="text-muted-foreground">Generate detailed time tracking reports with ReportIQ</p>
          </div>
          
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Powered by ReportIQ</span>
          </div>
        </div>

        {/* Report Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={selectedReportType} onValueChange={(value) => setSelectedReportType(value as ReportType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportConfigs.map((config) => (
                      <SelectItem key={config.type} value={config.type}>
                        <div>
                          <div className="font-medium">{config.name}</div>
                          <div className="text-sm text-muted-foreground">{config.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedConfig && (
                  <p className="text-sm text-muted-foreground">{selectedConfig.description}</p>
                )}
              </div>

              {/* Date Range Selection */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal flex-1",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "MMM d, y") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => handleDateSelect(date, 'from')}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal flex-1",
                          !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "MMM d, y") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => handleDateSelect(date, 'to')}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Quick Date Range Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => setQuickRange(7)}>
                    Last 7 days
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setQuickRange(30)}>
                    Last 30 days
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setQuickRange(90)}>
                    Last 90 days
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDateRange({
                      from: startOfMonth(new Date()),
                      to: endOfMonth(new Date())
                    })}
                  >
                    This month
                  </Button>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerateReport}
                disabled={isGenerating || !dateRange.from || !dateRange.to}
                className="min-w-32"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Failed to generate report</p>
                  <p className="text-sm">{error.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Results */}
        {currentReport && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentReport.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Generated on {format(new Date(currentReport.generatedAt), 'MMM d, yyyy h:mm a')} • 
                    {format(currentReport.filters.dateRange.from, 'MMM d')} - {format(currentReport.filters.dateRange.to, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ReportTable
                data={currentReport}
                onExport={handleExportReport}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                isExporting={isExporting}
              />
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!currentReport && !isGenerating && !error && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Report Generated</h3>
                <p className="text-muted-foreground mb-4">
                  Select a report type and date range, then click "Generate Report" to view your data.
                </p>
                <Button onClick={handleGenerateReport} disabled={!dateRange.from || !dateRange.to}>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Your First Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UnifiedLayout>
  );
};