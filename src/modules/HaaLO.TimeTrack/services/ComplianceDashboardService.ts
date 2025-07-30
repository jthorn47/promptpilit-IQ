/**
 * ComplianceDashboardService - Service for client compliance metrics and analytics
 */

import { supabase } from '@/integrations/supabase/client';

export interface ComplianceDashboardData {
  riskScore: number;
  summary: {
    overtimeCount: number;
    doubletimeCount: number;
    alertsCount: number;
    totalEntries: number;
    flaggedEntries: number;
    submissionRate: number;
    sevenDayViolations: number;
  };
  trends: {
    overtimeHours: Array<{ week: string; hours: number }>;
    complianceScore: Array<{ week: string; score: number }>;
    alertsByType: Array<{ type: string; count: number }>;
  };
  insights: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  lastUpdated: string;
}

export interface WeeklyMetrics {
  weekStart: string;
  weekEnd: string;
  totalEmployees: number;
  overtimeEmployees: number;
  doubletimeEmployees: number;
  totalOvertimeHours: number;
  totalDoubletimeHours: number;
  complianceViolations: number;
  onTimeSubmissions: number;
  totalSubmissions: number;
  averageTimeScore: number;
}

export class ComplianceDashboardService {
  /**
   * Get complete compliance dashboard data for a client
   */
  static async getClientComplianceDashboard(clientId: string): Promise<ComplianceDashboardData> {
    try {
      // Get current week metrics
      const currentWeek = this.getCurrentWeekRange();
      const weeklyMetrics = await this.getWeeklyMetrics(clientId, currentWeek);
      
      // Get historical data for trends (last 6 weeks)
      const trendsData = await this.getTrendsData(clientId, 6);
      
      // Calculate risk score
      const riskScore = this.calculateRiskScore(weeklyMetrics, trendsData);
      
      // Generate insights
      const insights = await this.generateInsights(clientId, weeklyMetrics, trendsData);
      
      return {
        riskScore,
        summary: {
          overtimeCount: weeklyMetrics.overtimeEmployees,
          doubletimeCount: weeklyMetrics.doubletimeEmployees,
          alertsCount: weeklyMetrics.complianceViolations,
          totalEntries: weeklyMetrics.totalSubmissions,
          flaggedEntries: weeklyMetrics.complianceViolations,
          submissionRate: weeklyMetrics.totalSubmissions > 0 
            ? (weeklyMetrics.onTimeSubmissions / weeklyMetrics.totalSubmissions) * 100 
            : 100,
          sevenDayViolations: 0 // Placeholder - would come from actual violation tracking
        },
        trends: {
          overtimeHours: trendsData.map(week => ({
            week: week.weekStart,
            hours: week.totalOvertimeHours
          })),
          complianceScore: trendsData.map(week => ({
            week: week.weekStart,
            score: week.averageTimeScore
          })),
          alertsByType: await this.getAlertsByType(clientId, currentWeek)
        },
        insights,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching compliance dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get weekly metrics for a specific time period
   */
  private static async getWeeklyMetrics(clientId: string, weekRange: { start: Date; end: Date }): Promise<WeeklyMetrics> {
    // Mock implementation - would integrate with actual time tracking data
    return {
      weekStart: weekRange.start.toISOString().split('T')[0],
      weekEnd: weekRange.end.toISOString().split('T')[0],
      totalEmployees: 25,
      overtimeEmployees: 8,
      doubletimeEmployees: 2,
      totalOvertimeHours: 45,
      totalDoubletimeHours: 12,
      complianceViolations: 5,
      onTimeSubmissions: 22,
      totalSubmissions: 25,
      averageTimeScore: 85
    };
  }

  /**
   * Get trends data for the specified number of weeks
   */
  private static async getTrendsData(clientId: string, weeks: number): Promise<WeeklyMetrics[]> {
    const trendsData: WeeklyMetrics[] = [];
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      // Mock data with some variation
      const baseOvertime = 40 + Math.random() * 20;
      const violations = Math.floor(Math.random() * 8);
      
      trendsData.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        totalEmployees: 25,
        overtimeEmployees: Math.floor(5 + Math.random() * 10),
        doubletimeEmployees: Math.floor(Math.random() * 4),
        totalOvertimeHours: baseOvertime,
        totalDoubletimeHours: Math.floor(Math.random() * 15),
        complianceViolations: violations,
        onTimeSubmissions: 23 + Math.floor(Math.random() * 3),
        totalSubmissions: 25,
        averageTimeScore: Math.floor(75 + Math.random() * 20)
      });
    }
    
    return trendsData;
  }

  /**
   * Calculate overall risk score (0-100, higher is better)
   */
  private static calculateRiskScore(currentWeek: WeeklyMetrics, trends: WeeklyMetrics[]): number {
    // Compliance rate (40% weight)
    const complianceRate = currentWeek.totalSubmissions > 0
      ? ((currentWeek.totalSubmissions - currentWeek.complianceViolations) / currentWeek.totalSubmissions) * 100
      : 100;
    
    // Submission rate (30% weight)
    const submissionRate = currentWeek.totalSubmissions > 0
      ? (currentWeek.onTimeSubmissions / currentWeek.totalSubmissions) * 100
      : 100;
    
    // Overtime management (20% weight)
    const overtimeRate = currentWeek.totalEmployees > 0
      ? ((currentWeek.totalEmployees - currentWeek.overtimeEmployees) / currentWeek.totalEmployees) * 100
      : 100;
    
    // Time score average (10% weight)
    const timeScoreWeight = currentWeek.averageTimeScore;
    
    const riskScore = Math.round(
      (complianceRate * 0.4) +
      (submissionRate * 0.3) +
      (overtimeRate * 0.2) +
      (timeScoreWeight * 0.1)
    );
    
    return Math.max(0, Math.min(100, riskScore));
  }

  /**
   * Generate actionable insights based on data patterns
   */
  private static async generateInsights(
    clientId: string, 
    currentWeek: WeeklyMetrics, 
    trends: WeeklyMetrics[]
  ): Promise<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>> {
    const insights = [];
    
    // High overtime analysis
    if (currentWeek.overtimeEmployees > currentWeek.totalEmployees * 0.4) {
      insights.push({
        id: 'high-overtime',
        type: 'warning' as const,
        title: 'High Overtime Usage',
        description: `${currentWeek.overtimeEmployees} of ${currentWeek.totalEmployees} employees worked overtime this week (${Math.round((currentWeek.overtimeEmployees / currentWeek.totalEmployees) * 100)}%)`,
        action: 'Review scheduling and workload distribution to reduce overtime dependency',
        priority: 'high' as const
      });
    }
    
    // Doubletime violations
    if (currentWeek.doubletimeEmployees > 0) {
      insights.push({
        id: 'doubletime-violations',
        type: 'error' as const,
        title: 'Doubletime Violations Detected',
        description: `${currentWeek.doubletimeEmployees} employees exceeded daily doubletime thresholds`,
        action: 'Enforce shift caps and review time approval processes',
        priority: 'high' as const
      });
    }
    
    // Late submissions
    const submissionRate = (currentWeek.onTimeSubmissions / currentWeek.totalSubmissions) * 100;
    if (submissionRate < 90) {
      insights.push({
        id: 'late-submissions',
        type: 'warning' as const,
        title: 'Late Time Submissions',
        description: `${currentWeek.totalSubmissions - currentWeek.onTimeSubmissions} employees submitted timesheets late (${Math.round(100 - submissionRate)}% late rate)`,
        action: 'Set up automated reminders and review submission deadlines',
        priority: 'medium' as const
      });
    }
    
    // Trend analysis - increasing violations
    if (trends.length >= 2) {
      const recentViolations = trends.slice(-2).reduce((sum, week) => sum + week.complianceViolations, 0);
      const previousViolations = trends.slice(-4, -2).reduce((sum, week) => sum + week.complianceViolations, 0);
      
      if (recentViolations > previousViolations * 1.5) {
        insights.push({
          id: 'increasing-violations',
          type: 'warning' as const,
          title: 'Increasing Compliance Violations',
          description: 'Compliance violations have increased by 50% over the past 2 weeks',
          action: 'Review recent policy changes and provide additional training',
          priority: 'high' as const
        });
      }
    }
    
    // Positive insights
    if (currentWeek.complianceViolations === 0) {
      insights.push({
        id: 'perfect-compliance',
        type: 'info' as const,
        title: 'Perfect Compliance Week',
        description: 'No compliance violations detected this week',
        action: 'Continue current practices and consider sharing best practices',
        priority: 'low' as const
      });
    }
    
    return insights;
  }

  /**
   * Get alerts breakdown by type
   */
  private static async getAlertsByType(clientId: string, weekRange: { start: Date; end: Date }) {
    // Mock data - would come from actual pulse_alerts table
    return [
      { type: 'Overtime', count: 8 },
      { type: 'Late Submission', count: 5 },
      { type: 'Missing Break', count: 3 },
      { type: 'Schedule Mismatch', count: 2 }
    ];
  }

  /**
   * Get current week date range
   */
  private static getCurrentWeekRange(): { start: Date; end: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }

  /**
   * Get risk level based on score
   */
  static getRiskLevel(score: number): { level: string; color: string; description: string } {
    if (score >= 90) {
      return {
        level: 'Excellent',
        color: 'text-green-600',
        description: 'Outstanding compliance performance'
      };
    } else if (score >= 80) {
      return {
        level: 'Good',
        color: 'text-blue-600',
        description: 'Strong compliance with minor areas for improvement'
      };
    } else if (score >= 70) {
      return {
        level: 'Fair',
        color: 'text-yellow-600',
        description: 'Moderate compliance issues that need attention'
      };
    } else {
      return {
        level: 'Poor',
        color: 'text-red-600',
        description: 'Significant compliance issues requiring immediate action'
      };
    }
  }
}