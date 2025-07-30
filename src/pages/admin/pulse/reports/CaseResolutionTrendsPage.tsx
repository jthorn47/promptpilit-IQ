import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDateRangePicker } from "@/components/ui/calendar-date-range-picker";
import { ArrowLeft, Download, FileText, Clock, TrendingUp, AlertTriangle, Filter } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePulseCases } from '@/modules/CaseManagement/hooks/usePulseCases';
import { PulseExportService } from '@/services/PulseExportService';
import { useToast } from '@/hooks/use-toast';
import { addDays, format as formatDate, parseISO } from 'date-fns';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

interface CaseResolutionMetrics {
  totalResolved: number;
  averageResolutionTime: number;
  resolvedUnder7Days: number;
  percentUnder7Days: number;
  longestResolution: number;
  chartData: Array<{
    date: string;
    resolutionTime: number;
    count: number;
  }>;
  departmentData: Array<{
    department: string;
    count: number;
    avgTime: number;
  }>;
}

export const CaseResolutionTrendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: addDays(new Date(), -90),
    to: new Date()
  });
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const { cases, loading } = usePulseCases({
    status: 'closed',
    dateRange: dateRange.from && dateRange.to ? {
      start: dateRange.from,
      end: dateRange.to
    } : undefined
  });

  const metrics = useMemo((): CaseResolutionMetrics => {
    if (!cases.length) {
      return {
        totalResolved: 0,
        averageResolutionTime: 0,
        resolvedUnder7Days: 0,
        percentUnder7Days: 0,
        longestResolution: 0,
        chartData: [],
        departmentData: []
      };
    }

    let filteredCases = cases.filter(c => c.closed_at);

    // Apply filters
    if (clientFilter !== 'all') {
      filteredCases = filteredCases.filter(c => c.client_id === clientFilter);
    }
    if (departmentFilter !== 'all') {
      filteredCases = filteredCases.filter(c => c.assigned_team === departmentFilter);
    }
    if (priorityFilter !== 'all') {
      filteredCases = filteredCases.filter(c => c.priority === priorityFilter);
    }

    const resolutionTimes = filteredCases.map(c => {
      const created = new Date(c.created_at);
      const closed = new Date(c.closed_at!);
      return Math.ceil((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    });

    const totalResolved = filteredCases.length;
    const averageResolutionTime = resolutionTimes.length > 0 
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length 
      : 0;
    const resolvedUnder7Days = resolutionTimes.filter(t => t <= 7).length;
    const percentUnder7Days = totalResolved > 0 ? (resolvedUnder7Days / totalResolved) * 100 : 0;
    const longestResolution = resolutionTimes.length > 0 ? Math.max(...resolutionTimes) : 0;

    // Chart data - resolution time over time
    const chartDataMap = new Map<string, { resolutionTime: number; count: number; total: number }>();
    filteredCases.forEach(c => {
      const closedDate = formatDate(new Date(c.closed_at!), 'yyyy-MM-dd');
      const resolutionTime = Math.ceil((new Date(c.closed_at!).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      if (chartDataMap.has(closedDate)) {
        const existing = chartDataMap.get(closedDate)!;
        chartDataMap.set(closedDate, {
          resolutionTime: existing.resolutionTime + resolutionTime,
          count: existing.count + 1,
          total: existing.total + resolutionTime
        });
      } else {
        chartDataMap.set(closedDate, {
          resolutionTime: resolutionTime,
          count: 1,
          total: resolutionTime
        });
      }
    });

    const chartData = Array.from(chartDataMap.entries()).map(([date, data]) => ({
      date,
      resolutionTime: Math.round(data.total / data.count),
      count: data.count
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Department data
    const departmentMap = new Map<string, { count: number; totalTime: number }>();
    filteredCases.forEach(c => {
      const dept = c.assigned_team || 'Unassigned';
      const resolutionTime = Math.ceil((new Date(c.closed_at!).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
      
      if (departmentMap.has(dept)) {
        const existing = departmentMap.get(dept)!;
        departmentMap.set(dept, {
          count: existing.count + 1,
          totalTime: existing.totalTime + resolutionTime
        });
      } else {
        departmentMap.set(dept, {
          count: 1,
          totalTime: resolutionTime
        });
      }
    });

    const departmentData = Array.from(departmentMap.entries()).map(([department, data]) => ({
      department,
      count: data.count,
      avgTime: Math.round(data.totalTime / data.count)
    }));

    return {
      totalResolved,
      averageResolutionTime: Math.round(averageResolutionTime * 10) / 10,
      resolvedUnder7Days,
      percentUnder7Days: Math.round(percentUnder7Days),
      longestResolution,
      chartData,
      departmentData
    };
  }, [cases, clientFilter, departmentFilter, priorityFilter]);

  const handleExport = async (format: 'pdf' | 'csv') => {
    setIsExporting(true);
    try {
      const reportData = {
        title: 'Case Resolution Trends Report',
        dateRange: dateRange.from && dateRange.to ? 
          `${formatDate(dateRange.from, 'MMM dd, yyyy')} - ${formatDate(dateRange.to, 'MMM dd, yyyy')}` :
          'All time',
        metrics: {
          totalCases: metrics.totalResolved,
          openCases: 0,
          inProgressCases: 0, 
          closedCases: metrics.totalResolved,
          overdueCount: 0,
          criticalCount: 0,
          avgResolutionTime: metrics.averageResolutionTime,
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          averageResolutionTime: metrics.averageResolutionTime,
          taskCompletionRate: 0,
          userActiveCount: 0,
          totalBillableHours: 0,
          totalHours: 0,
          billableHours: 0,
          complianceScore: 95
        },
        charts: {
          caseResolutionTrend: metrics.chartData.map(item => ({
            name: item.date,
            value: item.resolutionTime
          })),
          departmentBreakdown: metrics.departmentData.map(item => ({
            name: item.department,
            value: item.count
          })),
          taskCompletionRate: [],
          resourceUtilization: [],
          riskAssessment: [],
          performanceMetrics: []
        },
        tables: {
          topPerformers: [],
          highRiskCases: []
        }
      };

      const exportOptions = {
        format: format as 'pdf' | 'csv',
        includeCharts: true,
        includeMetrics: true,
        includeTables: true,
        title: 'Case Resolution Trends Report'
      };

      await PulseExportService.exportReport(reportData, 'case-resolution-trends', exportOptions);

      toast({
        title: "Export successful",
        description: `Report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const uniqueClients = useMemo(() => {
    const clientIds = new Set(cases.map(c => c.client_id).filter(Boolean));
    return Array.from(clientIds);
  }, [cases]);

  const uniqueDepartments = useMemo(() => {
    const departments = new Set(cases.map(c => c.assigned_team).filter(Boolean));
    return Array.from(departments);
  }, [cases]);

  return (
    <StandardPageLayout
      title="Case Resolution Trends"
      subtitle="Track case resolution times and patterns over time"
      headerActions={
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/pulse/reports')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <Button
            onClick={() => handleExport('csv')}
            disabled={isExporting || loading}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            disabled={isExporting || loading}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      }
    >

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <CalendarDateRangePicker
                value={{ 
                  from: dateRange.from || new Date(), 
                  to: dateRange.to || new Date() 
                }}
                onValueChange={(range) => range && setDateRange(range)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Client</label>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {uniqueClients.map(clientId => (
                    <SelectItem key={clientId} value={clientId || ''}>{clientId}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map(dept => (
                    <SelectItem key={dept} value={dept || ''}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cases Resolved</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalResolved}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResolutionTime} days</div>
            <p className="text-xs text-muted-foreground">
              Average across all cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Under 7 Days</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.percentUnder7Days}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.resolvedUnder7Days} of {metrics.totalResolved} cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Resolution</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.longestResolution} days</div>
            <p className="text-xs text-muted-foreground">
              Maximum time to resolve
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resolution Time Trend</CardTitle>
            <CardDescription>Average resolution time over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatDate(parseISO(value), 'MMM dd')}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => formatDate(parseISO(value as string), 'MMM dd, yyyy')}
                    formatter={(value, name) => [`${value} days`, 'Avg Resolution Time']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="resolutionTime" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution by Department</CardTitle>
            <CardDescription>Case resolution count and average time by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="department" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    name="Cases Resolved"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resolved Cases</CardTitle>
          <CardDescription>Detailed list of all resolved cases in the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead>Resolution Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.filter(c => c.closed_at).map((case_) => {
                  const resolutionTime = Math.ceil(
                    (new Date(case_.closed_at!).getTime() - new Date(case_.created_at).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <TableRow key={case_.id}>
                      <TableCell className="font-mono text-sm">{case_.id.slice(0, 8)}</TableCell>
                      <TableCell className="font-medium">{case_.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{case_.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            case_.priority === 'high' ? 'destructive' :
                            case_.priority === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {case_.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{case_.assigned_team || 'Unassigned'}</TableCell>
                      <TableCell>{formatDate(new Date(case_.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{formatDate(new Date(case_.closed_at!), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={resolutionTime <= 7 ? 'default' : 'secondary'}>
                          {resolutionTime} days
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
};