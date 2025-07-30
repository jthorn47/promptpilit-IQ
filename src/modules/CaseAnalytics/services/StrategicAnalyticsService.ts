import { supabase } from '@/integrations/supabase/client';
import { caseAnalyticsService } from './CaseAnalyticsService';
import { CaseAnalyticsFilters } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface TeamPerformanceMetrics {
  userId: string;
  userName?: string;
  averageFirstResponseTime: number; // milliseconds
  averageResolutionTime: number;
  totalCasesHandled: number;
  slaComplianceRate: number;
  feedbackScore: number;
  caseTypes: Record<string, number>;
  monthlyTrend: Array<{
    month: string;
    casesHandled: number;
    avgResolutionTime: number;
  }>;
}

export interface ClientAnalytics {
  companyId: string;
  companyName: string;
  activeCases: number;
  avgResolutionTime: number;
  caseVolumeGrowth: number;
  slaBreaches: number;
  escalations: number;
  idleCases: number;
  feedbackScore: number;
  costToServe: number;
  casesByCategory: Record<string, number>;
  monthlyTrend: Array<{
    month: string;
    caseVolume: number;
    avgCost: number;
  }>;
}

export interface CostAnalysis {
  totalLaborCost: number;
  costPerCase: number;
  costByType: Record<string, number>;
  costByClient: Record<string, number>;
  costByTeam: Record<string, number>;
  highTouchClients: Array<{
    companyId: string;
    companyName: string;
    totalCost: number;
    caseCount: number;
    costPerCase: number;
    marginImpact: 'high' | 'medium' | 'low';
  }>;
}

export interface StrategicInsights {
  risingVolumeClients: ClientAnalytics[];
  unbalancedWorkloads: TeamPerformanceMetrics[];
  repeatedIssues: Array<{
    category: string;
    frequency: number;
    clients: string[];
    avgResolutionTime: number;
  }>;
  sentimentTrends: Array<{
    month: string;
    avgSentiment: number;
    feedbackCount: number;
  }>;
  performanceOutliers: {
    topPerformers: TeamPerformanceMetrics[];
    needsAttention: TeamPerformanceMetrics[];
  };
}

export class StrategicAnalyticsService {
  private defaultLaborRate = 75; // $75/hour default

  async getTeamPerformanceMetrics(filters?: CaseAnalyticsFilters): Promise<TeamPerformanceMetrics[]> {
    try {
      // Mock team performance data since cases table doesn't exist yet
      console.log('StrategicAnalyticsService: getTeamPerformanceMetrics - returning mock data');
      return [
        {
          userId: 'user1',
          userName: 'John Doe',
          averageFirstResponseTime: 3600000, // 1 hour
          averageResolutionTime: 86400000, // 24 hours
          totalCasesHandled: 15,
          slaComplianceRate: 85,
          feedbackScore: 4.2,
          caseTypes: { 'hr': 8, 'payroll': 5, 'compliance': 2 },
          monthlyTrend: []
        }
      ];
    } catch (error) {
      console.error('Error getting team performance metrics:', error);
      throw new Error('Failed to get team performance metrics');
    }
  }

  async getClientAnalytics(filters?: CaseAnalyticsFilters): Promise<ClientAnalytics[]> {
    try {
      // Mock client analytics data since cases table doesn't exist yet
      console.log('StrategicAnalyticsService: getClientAnalytics - returning mock data');
      const mockClients = [
        {
          companyId: '1',
          companyName: 'Acme Corp',
          activeCases: 15,
          avgResolutionTime: 2.5 * 60 * 60 * 1000,
          caseVolumeGrowth: 25,
          slaBreaches: 2,
          escalations: 1,
          idleCases: 3,
          feedbackScore: 4.2,
          costToServe: 12500,
          casesByCategory: { hr: 5, payroll: 7, compliance: 3 },
          monthlyTrend: []
        },
        {
          companyId: '2',
          companyName: 'TechStart Inc',
          activeCases: 8,
          avgResolutionTime: 1.8 * 60 * 60 * 1000,
          caseVolumeGrowth: 12,
          slaBreaches: 0,
          escalations: 0,
          idleCases: 1,
          feedbackScore: 4.6,
          costToServe: 7200,
          casesByCategory: { hr: 2, technical: 4, billing: 2 },
          monthlyTrend: []
        }
      ];

      return mockClients;
    } catch (error) {
      console.error('Error getting client analytics:', error);
      throw new Error('Failed to get client analytics');
    }
  }

  async getCostAnalysis(filters?: CaseAnalyticsFilters): Promise<CostAnalysis> {
    try {
      // Mock cost analysis data since time_entries and cases tables don't exist yet
      console.log('StrategicAnalyticsService: getCostAnalysis - returning mock data');
      return {
        totalLaborCost: 25000,
        costPerCase: 850,
        costByType: { 'hr': 8500, 'payroll': 12000, 'compliance': 4500 },
        costByClient: { '1': 15000, '2': 10000 },
        costByTeam: { 'user1': 12000, 'user2': 8000, 'user3': 5000 },
        highTouchClients: [
          {
            companyId: '1',
            companyName: 'Acme Corp',
            totalCost: 15000,
            caseCount: 18,
            costPerCase: 833,
            marginImpact: 'high' as const
          }
        ]
      };
    } catch (error) {
      console.error('Error getting cost analysis:', error);
      throw new Error('Failed to get cost analysis');
    }
  }

  async getStrategicInsights(filters?: CaseAnalyticsFilters): Promise<StrategicInsights> {
    try {
      const [clientAnalytics, teamMetrics] = await Promise.all([
        this.getClientAnalytics(filters),
        this.getTeamPerformanceMetrics(filters)
      ]);

      // Rising volume clients (growth > 20%)
      const risingVolumeClients = clientAnalytics.filter(client => client.caseVolumeGrowth > 20);

      // Unbalanced workloads (team members with significantly higher case loads)
      const avgCaseLoad = teamMetrics.reduce((sum, tm) => sum + tm.totalCasesHandled, 0) / teamMetrics.length;
      const unbalancedWorkloads = teamMetrics.filter(tm => tm.totalCasesHandled > avgCaseLoad * 1.5);

      // Performance outliers
      const sortedByPerformance = [...teamMetrics].sort((a, b) => b.feedbackScore - a.feedbackScore);
      const topPerformers = sortedByPerformance.slice(0, 3);
      const needsAttention = sortedByPerformance.slice(-3).filter(tm => tm.feedbackScore < 3);

      // Repeated issues analysis
      const repeatedIssues = await this.getRepeatedIssuesAnalysis(filters);

      // Sentiment trends
      const sentimentTrends = await this.getSentimentTrends(filters);

      return {
        risingVolumeClients,
        unbalancedWorkloads,
        repeatedIssues,
        sentimentTrends,
        performanceOutliers: {
          topPerformers,
          needsAttention
        }
      };
    } catch (error) {
      console.error('Error getting strategic insights:', error);
      throw new Error('Failed to get strategic insights');
    }
  }

  async generateClientSummaryPDF(companyId: string, filters?: CaseAnalyticsFilters): Promise<Blob> {
    try {
      const [clientAnalytics, costAnalysis] = await Promise.all([
        this.getClientAnalytics({ ...filters, companyId }),
        this.getCostAnalysis({ ...filters, companyId })
      ]);

      const client = clientAnalytics[0];
      if (!client) throw new Error('Client not found');

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;

      // Header
      pdf.setFontSize(20);
      pdf.text('Client Service Summary', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.text(client.companyName, pageWidth / 2, 30, { align: 'center' });
      
      pdf.setFontSize(10);
      const dateRange = filters?.dateRange ? 
        `${filters.dateRange.start} to ${filters.dateRange.end}` : 
        'All Time';
      pdf.text(`Report Period: ${dateRange}`, pageWidth / 2, 40, { align: 'center' });

      // Executive Summary
      pdf.setFontSize(14);
      pdf.text('Executive Summary', 20, 60);
      
      const summaryData = [
        ['Active Cases', client.activeCases.toString()],
        ['Average Resolution Time', `${(client.avgResolutionTime / (1000 * 60 * 60)).toFixed(1)} hours`],
        ['SLA Breaches', client.slaBreaches.toString()],
        ['Escalations', client.escalations.toString()],
        ['Client Satisfaction', `${client.feedbackScore.toFixed(1)}/5.0`],
        ['Total Service Cost', `$${client.costToServe.toLocaleString()}`]
      ];

      (pdf as any).autoTable({
        startY: 70,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 10 }
      });

      // Case Categories
      let yPosition = (pdf as any).lastAutoTable.finalY + 20;
      pdf.setFontSize(14);
      pdf.text('Cases by Category', 20, yPosition);

      const categoryData = Object.entries(client.casesByCategory).map(([category, count]) => [
        category.replace('_', ' ').toUpperCase(),
        count.toString()
      ]);

      (pdf as any).autoTable({
        startY: yPosition + 10,
        head: [['Category', 'Count']],
        body: categoryData,
        theme: 'grid',
        styles: { fontSize: 10 }
      });

      // Service Highlights
      yPosition = (pdf as any).lastAutoTable.finalY + 20;
      pdf.setFontSize(14);
      pdf.text('Service Highlights', 20, yPosition);

      const highlights = [
        `• ${client.activeCases} cases currently being handled by our team`,
        `• Average resolution time of ${(client.avgResolutionTime / (1000 * 60 * 60)).toFixed(1)} hours`,
        `• ${client.escalations} escalations handled promptly`,
        `• Client satisfaction score of ${client.feedbackScore.toFixed(1)}/5.0`
      ];

      yPosition += 15;
      highlights.forEach(highlight => {
        pdf.setFontSize(10);
        pdf.text(highlight, 25, yPosition);
        yPosition += 8;
      });

      return new Blob([pdf.output('blob')], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error generating client summary PDF:', error);
      throw new Error('Failed to generate client summary PDF');
    }
  }

  // Private helper methods
  private async calculateSLACompliance(userId: string, filters?: CaseAnalyticsFilters): Promise<number> {
    // This would integrate with SLA configuration - for now return mock data
    return Promise.resolve(Math.random() * 100);
  }

  private async getMonthlyTrendForUser(userId: string, filters?: CaseAnalyticsFilters) {
    // Implementation would fetch monthly data for user
    return [];
  }

  private async getMonthlyTrendForClient(companyId: string, filters?: CaseAnalyticsFilters) {
    // Implementation would fetch monthly data for client
    return [];
  }

  private calculateVolumeGrowth(monthlyTrend: any[]): number {
    if (monthlyTrend.length < 2) return 0;
    const latest = monthlyTrend[monthlyTrend.length - 1];
    const previous = monthlyTrend[monthlyTrend.length - 2];
    return previous.caseVolume > 0 ? 
      ((latest.caseVolume - previous.caseVolume) / previous.caseVolume) * 100 : 0;
  }

  private async getRepeatedIssuesAnalysis(filters?: CaseAnalyticsFilters) {
    // Implementation would analyze repeated case categories
    return [];
  }

  private async getSentimentTrends(filters?: CaseAnalyticsFilters) {
    // Implementation would fetch sentiment trends over time
    return [];
  }
}

export const strategicAnalyticsService = new StrategicAnalyticsService();