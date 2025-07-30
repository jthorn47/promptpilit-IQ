import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: 'query' | 'feedback' | 'mode_change' | 'suggestion_used';
  query?: string;
  mode?: string;
  feedback?: 'positive' | 'negative';
  suggestion?: string;
  context?: any;
}

class PayrollCopilotAnalytics {
  private static instance: PayrollCopilotAnalytics;
  
  public static getInstance(): PayrollCopilotAnalytics {
    if (!PayrollCopilotAnalytics.instance) {
      PayrollCopilotAnalytics.instance = new PayrollCopilotAnalytics();
    }
    return PayrollCopilotAnalytics.instance;
  }

  async trackEvent(event: AnalyticsEvent) {
    try {
      // Log to analytics_metrics table
      await supabase.from('analytics_metrics').insert({
        metric_name: 'payroll_copilot_usage',
        metric_type: 'user_interaction',
        category: 'ai_assistant',
        metric_value: 1,
        time_period: 'daily',
        metadata: {
          event_type: event.event_type,
          query: event.query,
          mode: event.mode,
          feedback: event.feedback,
          suggestion: event.suggestion,
          context: event.context,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          page_url: window.location.pathname
        }
      });

      console.log('Copilot analytics event tracked:', event);
    } catch (error) {
      console.error('Failed to track copilot analytics:', error);
    }
  }

  async getUsageStats(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('analytics_metrics')
        .select('*')
        .eq('metric_name', 'payroll_copilot_usage')
        .gte('date_recorded', startDate)
        .lte('date_recorded', endDate);

      if (error) throw error;

      return this.aggregateStats(data || []);
    } catch (error) {
      console.error('Failed to fetch copilot analytics:', error);
      return null;
    }
  }

  private aggregateStats(metrics: any[]) {
    const stats = {
      totalQueries: 0,
      totalFeedback: { positive: 0, negative: 0 },
      modeUsage: { 'Q&A': 0, 'Task Guidance': 0, 'Troubleshooting': 0 },
      suggestionsUsed: 0,
      dailyUsage: {} as Record<string, number>
    };

    metrics.forEach(metric => {
      const metadata = metric.metadata || {};
      
      if (metadata.event_type === 'query') {
        stats.totalQueries++;
        if (metadata.mode) {
          stats.modeUsage[metadata.mode as keyof typeof stats.modeUsage]++;
        }
      }
      
      if (metadata.event_type === 'feedback') {
        if (metadata.feedback === 'positive') stats.totalFeedback.positive++;
        if (metadata.feedback === 'negative') stats.totalFeedback.negative++;
      }
      
      if (metadata.event_type === 'suggestion_used') {
        stats.suggestionsUsed++;
      }

      const date = metric.date_recorded;
      stats.dailyUsage[date] = (stats.dailyUsage[date] || 0) + 1;
    });

    return stats;
  }
}

// Hook for using analytics in React components
export const usePayrollCopilotAnalytics = () => {
  const analytics = PayrollCopilotAnalytics.getInstance();

  const trackQuery = (query: string, mode: string) => {
    analytics.trackEvent({
      event_type: 'query',
      query,
      mode
    });
  };

  const trackFeedback = (feedback: 'positive' | 'negative', query?: string) => {
    analytics.trackEvent({
      event_type: 'feedback',
      feedback,
      query
    });
  };

  const trackModeChange = (newMode: string, previousMode?: string) => {
    analytics.trackEvent({
      event_type: 'mode_change',
      mode: newMode,
      context: { previousMode }
    });
  };

  const trackSuggestionUsed = (suggestion: string, mode: string) => {
    analytics.trackEvent({
      event_type: 'suggestion_used',
      suggestion,
      mode
    });
  };

  return {
    trackQuery,
    trackFeedback,
    trackModeChange,
    trackSuggestionUsed,
    getUsageStats: analytics.getUsageStats.bind(analytics)
  };
};

export default PayrollCopilotAnalytics;