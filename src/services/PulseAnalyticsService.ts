import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export interface PulseMetrics {
  totalCases: number;
  openCases: number;
  inProgressCases: number;
  closedCases: number;
  avgResolutionTime: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalHours: number;
  billableHours: number;
  complianceScore: number;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  department?: string;
  caseType?: string;
  assignee?: string;
  clientId?: string;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
  category?: string;
}

export interface ReportData {
  metrics: PulseMetrics;
  charts: {
    caseResolutionTrend: ChartData[];
    departmentBreakdown: ChartData[];
    taskCompletionRate: ChartData[];
    resourceUtilization: ChartData[];
    riskAssessment: ChartData[];
    performanceMetrics: ChartData[];
  };
  tables: {
    topPerformers: Array<{
      name: string;
      completedCases: number;
      avgResolutionTime: number;
      billableHours: number;
    }>;
    highRiskCases: Array<{
      id: string;
      title: string;
      priority: string;
      daysOpen: number;
      assignee: string;
    }>;
  };
}

export class PulseAnalyticsService {
  // Core metrics aggregation
  static async getPulseMetrics(filters: ReportFilters): Promise<PulseMetrics> {
    const { startDate, endDate, department, caseType, assignee, clientId } = filters;

    // Build case query with filters
    let caseQuery = supabase
      .from('cases')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (caseType) caseQuery = caseQuery.eq('type', caseType);
    if (assignee) caseQuery = caseQuery.eq('assigned_to', assignee);
    if (clientId) caseQuery = caseQuery.eq('client_id', clientId);

    // Build task query with filters
    let taskQuery = supabase
      .from('tasks')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (assignee) taskQuery = taskQuery.eq('assigned_to', assignee);

    // Build time entries query
    let timeQuery = supabase
      .from('time_entries')
      .select('*')
      .gte('entry_date', format(startDate, 'yyyy-MM-dd'))
      .lte('entry_date', format(endDate, 'yyyy-MM-dd'));

    // Execute queries in parallel
    const [caseResult, taskResult, timeResult] = await Promise.all([
      caseQuery,
      taskQuery,
      timeQuery
    ]);

    const cases = caseResult.data || [];
    const tasks = taskResult.data || [];
    const timeEntries = timeResult.data || [];

    // Calculate metrics
    const totalCases = cases.length;
    const openCases = cases.filter(c => c.status === 'open').length;
    const inProgressCases = cases.filter(c => c.status === 'in_progress').length;
    const closedCases = cases.filter(c => c.status === 'closed').length;

    const closedCasesWithDuration = cases.filter(c => c.status === 'closed' && c.closed_at && c.created_at);
    const avgResolutionTime = closedCasesWithDuration.length > 0
      ? closedCasesWithDuration.reduce((sum, c) => {
          const duration = new Date(c.closed_at!).getTime() - new Date(c.created_at).getTime();
          return sum + duration / (1000 * 60 * 60 * 24); // Convert to days
        }, 0) / closedCasesWithDuration.length
      : 0;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length;

    const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0);
    const billableHours = timeEntries
      .filter(entry => entry.is_billable)
      .reduce((sum, entry) => sum + (entry.duration_minutes / 60), 0);

    // Calculate compliance score (simplified)
    const complianceScore = Math.round(
      ((completedTasks / Math.max(totalTasks, 1)) * 40) + 
      ((closedCases / Math.max(totalCases, 1)) * 40) + 
      (Math.max(0, 100 - overdueTasks * 5) * 0.2)
    );

    return {
      totalCases,
      openCases,
      inProgressCases,
      closedCases,
      avgResolutionTime,
      totalTasks,
      completedTasks,
      overdueTasks,
      totalHours,
      billableHours,
      complianceScore: Math.min(100, complianceScore)
    };
  }

  // Case resolution trends over time
  static async getCaseResolutionTrends(filters: ReportFilters): Promise<ChartData[]> {
    const { startDate, endDate } = filters;
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const trends: ChartData[] = [];
    
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const { data: cases } = await supabase
        .from('cases')
        .select('*')
        .eq('status', 'closed')
        .gte('closed_at', startOfDay(currentDate).toISOString())
        .lte('closed_at', endOfDay(currentDate).toISOString());

      trends.push({
        name: format(currentDate, 'MMM dd'),
        value: cases?.length || 0,
        date: format(currentDate, 'yyyy-MM-dd')
      });
    }

    return trends;
  }

  // Department breakdown
  static async getDepartmentBreakdown(filters: ReportFilters): Promise<ChartData[]> {
    const { startDate, endDate } = filters;

    const { data: employees } = await supabase
      .from('employees')
      .select('id, department');

    const { data: cases } = await supabase
      .from('cases')
      .select('assigned_to')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    const employeeMap = new Map((employees || []).map(emp => [emp.id, emp.department]));
    const departmentCounts = new Map<string, number>();

    (cases || []).forEach(case_ => {
      const department = employeeMap.get(case_.assigned_to) || 'Unassigned';
      departmentCounts.set(department, (departmentCounts.get(department) || 0) + 1);
    });

    return Array.from(departmentCounts.entries()).map(([name, value]) => ({
      name,
      value,
      category: 'department'
    }));
  }

  // Resource utilization analysis
  static async getResourceUtilization(filters: ReportFilters): Promise<ChartData[]> {
    const { startDate, endDate } = filters;

    const { data: timeEntries } = await supabase
      .from('time_entries')
      .select('user_id, duration_minutes, is_billable')
      .gte('entry_date', format(startDate, 'yyyy-MM-dd'))
      .lte('entry_date', format(endDate, 'yyyy-MM-dd'));

    const { data: employees } = await supabase
      .from('employees')
      .select('id, first_name, last_name');

    const employeeMap = new Map((employees || []).map(emp => 
      [emp.id, `${emp.first_name} ${emp.last_name}`]
    ));

    const userUtilization = new Map<string, { billable: number; total: number }>();

    (timeEntries || []).forEach(entry => {
      const userId = entry.user_id;
      const hours = entry.duration_minutes / 60;
      
      if (!userUtilization.has(userId)) {
        userUtilization.set(userId, { billable: 0, total: 0 });
      }
      
      const util = userUtilization.get(userId)!;
      util.total += hours;
      if (entry.is_billable) {
        util.billable += hours;
      }
    });

    return Array.from(userUtilization.entries()).map(([userId, util]) => ({
      name: employeeMap.get(userId) || 'Unknown',
      value: util.total > 0 ? Math.round((util.billable / util.total) * 100) : 0,
      category: 'utilization'
    }));
  }

  // Generate comprehensive report data
  static async generateReportData(reportType: string, filters: ReportFilters): Promise<ReportData> {
    const [metrics, resolutionTrends, departmentBreakdown, resourceUtilization] = await Promise.all([
      this.getPulseMetrics(filters),
      this.getCaseResolutionTrends(filters),
      this.getDepartmentBreakdown(filters),
      this.getResourceUtilization(filters)
    ]);

    // Generate performance metrics (simplified)
    const performanceMetrics: ChartData[] = [
      { name: 'Cases Resolved', value: metrics.closedCases },
      { name: 'Tasks Completed', value: metrics.completedTasks },
      { name: 'Avg Resolution Time', value: Math.round(metrics.avgResolutionTime) },
      { name: 'Compliance Score', value: metrics.complianceScore }
    ];

    // Generate risk assessment data
    const riskAssessment: ChartData[] = [
      { name: 'Low Risk', value: Math.max(0, metrics.totalCases - metrics.overdueTasks - 5) },
      { name: 'Medium Risk', value: Math.min(5, metrics.overdueTasks) },
      { name: 'High Risk', value: Math.max(0, metrics.overdueTasks - 5) }
    ];

    // Task completion rate over time (simplified)
    const taskCompletionRate: ChartData[] = resolutionTrends.map(trend => ({
      ...trend,
      value: Math.round((metrics.completedTasks / Math.max(metrics.totalTasks, 1)) * 100)
    }));

    return {
      metrics,
      charts: {
        caseResolutionTrend: resolutionTrends,
        departmentBreakdown,
        taskCompletionRate,
        resourceUtilization,
        riskAssessment,
        performanceMetrics
      },
      tables: {
        topPerformers: [], // Would need more complex queries
        highRiskCases: []   // Would need more complex queries
      }
    };
  }

  // Export functionality
  static async exportToCSV(reportData: ReportData, reportType: string): Promise<string> {
    const csvRows = ['Type,Name,Value,Date'];
    
    // Add metrics data
    Object.entries(reportData.metrics).forEach(([key, value]) => {
      csvRows.push(`Metric,${key},${value},${format(new Date(), 'yyyy-MM-dd')}`);
    });

    // Add chart data
    Object.entries(reportData.charts).forEach(([chartType, data]) => {
      data.forEach(item => {
        csvRows.push(`Chart,${chartType}: ${item.name},${item.value},${item.date || ''}`);
      });
    });

    return csvRows.join('\n');
  }
}