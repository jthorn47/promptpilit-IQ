import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { ArrowLeft, Download, RefreshCw, Calendar, Filter } from "lucide-react";
import { format, subDays } from 'date-fns';
import { PulseAnalyticsService, ReportData, ReportFilters } from '@/services/PulseAnalyticsService';
import { PulseExportService } from '@/services/PulseExportService';
import { PulseReportPermissionService } from '@/services/PulseReportPermissionService';
import { useAuth } from '@/contexts/AuthContext';
import { PulseReportCharts } from './PulseReportCharts';
import { PulseReportMetrics } from './PulseReportMetrics';
import { toast } from 'sonner';

const reportConfigs = {
  'case-resolution-trends': {
    title: 'Case Resolution Trends',
    description: 'Track case resolution times and patterns over time',
    primaryChart: 'caseResolutionTrend',
    secondaryCharts: ['departmentBreakdown', 'performanceMetrics']
  },
  'department-breakdown': {
    title: 'Department Breakdown',
    description: 'Case distribution across different departments',
    primaryChart: 'departmentBreakdown',
    secondaryCharts: ['resourceUtilization', 'taskCompletionRate']
  },
  'compliance-dashboard': {
    title: 'Compliance Dashboard',
    description: 'Monitor compliance metrics and regulatory requirements',
    primaryChart: 'performanceMetrics',
    secondaryCharts: ['riskAssessment', 'taskCompletionRate']
  },
  'resource-utilization': {
    title: 'Resource Utilization',
    description: 'Track time and resource allocation across cases',
    primaryChart: 'resourceUtilization',
    secondaryCharts: ['departmentBreakdown', 'caseResolutionTrend']
  },
  'risk-assessment': {
    title: 'Risk Assessment Report',
    description: 'Identify high-risk areas and potential issues',
    primaryChart: 'riskAssessment',
    secondaryCharts: ['performanceMetrics', 'taskCompletionRate']
  },
  'performance-analytics': {
    title: 'Performance Analytics',
    description: 'Team and individual performance metrics',
    primaryChart: 'performanceMetrics',
    secondaryCharts: ['resourceUtilization', 'departmentBreakdown']
  }
};

export const PulseDynamicReportView: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  const config = reportId ? reportConfigs[reportId as keyof typeof reportConfigs] : null;

  useEffect(() => {
    if (!reportId || !config) {
      navigate('/admin/pulse/reports');
      return;
    }
    
    loadReportData();
  }, [reportId, filters]);

  const loadReportData = async () => {
    if (!user || !reportId || !config) return;

    try {
      setLoading(true);

      // Check permissions
      const hasAccess = await PulseReportPermissionService.validateReportAccess(
        user.id, 
        reportId, 
        filters
      );

      if (!hasAccess) {
        toast.error('You do not have permission to view this report');
        navigate('/admin/pulse/reports');
        return;
      }

      // Generate report data
      const data = await PulseAnalyticsService.generateReportData(reportId, filters);
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (exportFormat: 'pdf' | 'csv') => {
    if (!reportData || !config) return;

    try {
      setExporting(true);
      
      const blob = await PulseExportService.exportReport(reportData, reportId!, {
        format: exportFormat,
        includeCharts: true,
        includeMetrics: true,
        includeTables: true,
        title: config.title,
        subtitle: `${format(filters.startDate, 'MMM dd, yyyy')} - ${format(filters.endDate, 'MMM dd, yyyy')}`
      });

      const filename = `${config.title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      await PulseExportService.downloadFile(blob, filename);
      
      toast.success(`Report exported as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (!config) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Report Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested report could not be found.</p>
          <Button onClick={() => navigate('/admin/pulse/reports')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/pulse/reports')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{config.title}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadReportData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <DatePickerWithRange
                date={{
                  from: filters.startDate,
                  to: filters.endDate
                }}
                onDateChange={(range) => {
                  if (range?.from && range?.to) {
                    updateFilters({
                      startDate: range.from,
                      endDate: range.to
                    });
                  }
                }}
              />
            </div>

            <Select 
              value={filters.caseType || 'all'} 
              onValueChange={(value) => updateFilters({ caseType: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Case Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="incident">Incident</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="investigation">Investigation</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.department || 'all'} 
              onValueChange={(value) => updateFilters({ department: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <PulseReportMetrics metrics={reportData.metrics} />

          {/* Charts */}
          <PulseReportCharts 
            reportData={reportData}
            config={config}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No data available for the selected criteria.</p>
          <Button 
            variant="outline" 
            onClick={loadReportData}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};