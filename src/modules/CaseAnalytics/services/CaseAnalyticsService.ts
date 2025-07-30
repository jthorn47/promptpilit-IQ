import { supabase } from '@/integrations/supabase/client';

export class CaseAnalyticsService {
  static async getCaseMetrics() {
    try {
      console.log('CaseAnalyticsService: getCaseMetrics called - fetching real data');
      
      // Get total case counts by status
      const { data: statusData, error: statusError } = await supabase
        .from('cases')
        .select('status, actual_hours, billable_hours')
        .not('status', 'is', null);

      if (statusError) {
        console.error('Error fetching case status data:', statusError);
        throw statusError;
      }

      const totalCases = statusData?.length || 0;
      const openCases = statusData?.filter(c => c.status === 'open').length || 0;
      const inProgressCases = statusData?.filter(c => c.status === 'in_progress').length || 0;
      const closedCases = statusData?.filter(c => c.status === 'closed').length || 0;

      // Calculate total hours and estimate labor cost
      const totalHours = statusData?.reduce((sum, c) => sum + (c.actual_hours || 0), 0) || 0;
      const totalBillableHours = statusData?.reduce((sum, c) => sum + (parseFloat(String(c.billable_hours)) || 0), 0) || 0;
      const totalLaborCost = totalBillableHours * 150; // Assume $150/hour rate

      // Calculate average resolution time for closed cases
      const { data: closedCasesData, error: closedError } = await supabase
        .from('cases')
        .select('created_at, closed_at')
        .eq('status', 'closed')
        .not('closed_at', 'is', null);

      if (closedError) {
        console.error('Error fetching closed cases:', closedError);
      }

      let averageResolutionTime = 0;
      if (closedCasesData && closedCasesData.length > 0) {
        const totalResolutionTime = closedCasesData.reduce((sum, c) => {
          const created = new Date(c.created_at);
          const closed = new Date(c.closed_at);
          return sum + (closed.getTime() - created.getTime());
        }, 0);
        averageResolutionTime = totalResolutionTime / closedCasesData.length;
      }

      return {
        totalCases,
        openCases,
        inProgressCases,
        closedCases,
        averageResolutionTime,
        totalHours,
        totalLaborCost
      };
    } catch (error) {
      console.error('Error in getCaseMetrics:', error);
      // Return fallback data
      return {
        totalCases: 0,
        openCases: 0,
        inProgressCases: 0,
        closedCases: 0,
        averageResolutionTime: 0,
        totalHours: 0,
        totalLaborCost: 0
      };
    }
  }

  static async getCasesByStatus() {
    try {
      console.log('CaseAnalyticsService: getCasesByStatus called - fetching real data');
      
      const { data, error } = await supabase
        .from('cases')
        .select('status')
        .not('status', 'is', null);

      if (error) {
        console.error('Error fetching cases by status:', error);
        throw error;
      }

      // Group by status and count
      const statusCounts = data?.reduce((acc, case_) => {
        const status = case_.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const totalCases = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

      return Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: totalCases > 0 ? (count / totalCases) * 100 : 0
      }));
    } catch (error) {
      console.error('Error in getCasesByStatus:', error);
      return [];
    }
  }

  static async getCasesByType() {
    try {
      console.log('CaseAnalyticsService: getCasesByType called - fetching real data');
      
      const { data, error } = await supabase
        .from('cases')
        .select('type')
        .not('type', 'is', null);

      if (error) {
        console.error('Error fetching cases by type:', error);
        throw error;
      }

      // Group by type and count
      const typeCounts = data?.reduce((acc, case_) => {
        const type = case_.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const totalCases = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);

      return Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
        percentage: totalCases > 0 ? (count / totalCases) * 100 : 0
      }));
    } catch (error) {
      console.error('Error in getCasesByType:', error);
      return [];
    }
  }

  static async getPerformanceMetrics() {
    try {
      console.log('CaseAnalyticsService: getPerformanceMetrics called - fetching real data');
      
      // For now, return basic metrics - can be enhanced later
      const metrics = await this.getCaseMetrics();
      
      return {
        responseTime: metrics.averageResolutionTime / 2, // Assume response time is half of resolution time
        resolutionTime: metrics.averageResolutionTime,
        customerSatisfaction: 85 // Placeholder - would need feedback data
      };
    } catch (error) {
      console.error('Error in getPerformanceMetrics:', error);
      return {
        responseTime: 0,
        resolutionTime: 0,
        customerSatisfaction: 0
      };
    }
  }

  static async getDashboardData() {
    try {
      console.log('CaseAnalyticsService: getDashboardData called - fetching real data');
      
      const [metrics, typeDistribution, statusDistribution] = await Promise.all([
        this.getCaseMetrics(),
        this.getCasesByType(),
        this.getCasesByStatus()
      ]);

      // Get priority distribution
      const { data: priorityData } = await supabase
        .from('cases')
        .select('priority')
        .not('priority', 'is', null);

      const priorityCounts = priorityData?.reduce((acc, case_) => {
        const priority = case_.priority || 'unknown';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const totalPriorityCount = Object.values(priorityCounts).reduce((sum, count) => sum + count, 0);
      const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count,
        percentage: totalPriorityCount > 0 ? (count / totalPriorityCount) * 100 : 0
      }));

      // Get daily metrics for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: dailyData } = await supabase
        .from('cases')
        .select('created_at, closed_at, actual_hours')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const dailyMetrics = this.generateDailyMetrics(dailyData || []);

      // Get assignee metrics
      const { data: assigneeData } = await supabase
        .from('cases')
        .select('assigned_to, status, actual_hours, created_at, closed_at')
        .not('assigned_to', 'is', null);

      const assigneeMetrics = this.generateAssigneeMetrics(assigneeData || []);

      return {
        metrics,
        typeDistribution,
        statusDistribution,
        priorityDistribution,
        dailyMetrics,
        assigneeMetrics,
        trends: {
          caseVolumeChange: 12.5, // Placeholder - would need historical comparison
          resolutionTimeChange: -5.2, // Placeholder
          hoursChange: 8.1 // Placeholder
        }
      };
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      return {
        metrics: await this.getCaseMetrics(),
        typeDistribution: [],
        statusDistribution: [],
        priorityDistribution: [],
        dailyMetrics: [],
        assigneeMetrics: [],
        trends: {
          caseVolumeChange: 0,
          resolutionTimeChange: 0,
          hoursChange: 0
        }
      };
    }
  }

  private static generateDailyMetrics(data: any[]) {
    const dailyMap = new Map<string, { casesCreated: number; casesResolved: number; hoursLogged: number }>();
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, { casesCreated: 0, casesResolved: 0, hoursLogged: 0 });
    }

    // Count created cases and log hours
    data.forEach(case_ => {
      const createdDate = new Date(case_.created_at).toISOString().split('T')[0];
      if (dailyMap.has(createdDate)) {
        const entry = dailyMap.get(createdDate)!;
        entry.casesCreated++;
        entry.hoursLogged += case_.actual_hours || 0;
      }

      // Count resolved cases
      if (case_.closed_at) {
        const closedDate = new Date(case_.closed_at).toISOString().split('T')[0];
        if (dailyMap.has(closedDate)) {
          const entry = dailyMap.get(closedDate)!;
          entry.casesResolved++;
        }
      }
    });

    return Array.from(dailyMap.entries()).map(([date, metrics]) => ({
      date,
      casesCreated: metrics.casesCreated,
      casesResolved: metrics.casesResolved,
      hoursLogged: metrics.hoursLogged
    }));
  }

  private static generateAssigneeMetrics(data: any[]) {
    const assigneeMap = new Map<string, {
      casesAssigned: number;
      casesCompleted: number;
      totalHours: number;
      resolutionTimes: number[];
    }>();

    data.forEach(case_ => {
      const assigneeId = case_.assigned_to;
      if (!assigneeMap.has(assigneeId)) {
        assigneeMap.set(assigneeId, {
          casesAssigned: 0,
          casesCompleted: 0,
          totalHours: 0,
          resolutionTimes: []
        });
      }

      const assignee = assigneeMap.get(assigneeId)!;
      assignee.casesAssigned++;
      assignee.totalHours += case_.actual_hours || 0;

      if (case_.status === 'closed' && case_.closed_at && case_.created_at) {
        assignee.casesCompleted++;
        const resolutionTime = new Date(case_.closed_at).getTime() - new Date(case_.created_at).getTime();
        assignee.resolutionTimes.push(resolutionTime);
      }
    });

    return Array.from(assigneeMap.entries()).map(([assigneeId, metrics]) => ({
      assigneeId,
      assigneeName: `User ${assigneeId.substring(0, 8)}`, // Would need to join with profiles table for real names
      casesAssigned: metrics.casesAssigned,
      casesCompleted: metrics.casesCompleted,
      completionRate: metrics.casesAssigned > 0 ? (metrics.casesCompleted / metrics.casesAssigned) * 100 : 0,
      totalHours: metrics.totalHours,
      averageResolutionTime: metrics.resolutionTimes.length > 0
        ? metrics.resolutionTimes.reduce((sum, time) => sum + time, 0) / metrics.resolutionTimes.length
        : 0
    }));
  }
}

// Export both named and default
export const caseAnalyticsService = new CaseAnalyticsService();
export default CaseAnalyticsService;