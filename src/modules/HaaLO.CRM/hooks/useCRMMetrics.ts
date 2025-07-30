import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CRMMetrics } from '../types';
import { useToast } from '@/hooks/use-toast';

interface ForecastMetrics {
  totalPipelineValue: number;
  weightedPipelineValue: number;
  highProbabilityValue: number;
  averageDealSize: number;
  dealsByCloseMonth: { month: string; deals: number; value: number; weightedValue: number }[];
  dealsByStage: { stage: string; deals: number; value: number }[];
  dealsByRep: { rep: string; deals: number; value: number; weightedValue: number; winRate: number }[];
}

interface EnhancedCRMMetrics extends CRMMetrics {
  forecast: ForecastMetrics;
}

export const useCRMMetrics = () => {
  const [metrics, setMetrics] = useState<EnhancedCRMMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [leadsResult, dealsResult, activitiesResult] = await Promise.all([
        supabase.from('leads').select('id, score'),
        supabase.from('deals').select('id, value, status, probability, expected_close_date, assigned_to, stage_id'),
        supabase.from('activities').select('id')
      ]);

      if (leadsResult.error) throw leadsResult.error;
      if (dealsResult.error) throw dealsResult.error;
      if (activitiesResult.error) throw activitiesResult.error;

      const leads = leadsResult.data || [];
      const deals = dealsResult.data || [];
      const activities = activitiesResult.data || [];

      // Calculate basic CRM metrics
      const totalLeads = leads.length;
      const totalDeals = deals.filter(deal => deal.status !== 'closed_lost').length;
      const totalActivities = activities.length;
      
      const closedWonDeals = deals.filter(deal => deal.status === 'closed_won');
      const conversionRate = totalLeads > 0 ? (closedWonDeals.length / totalLeads) * 100 : 0;
      
      const avgDealSize = closedWonDeals.length > 0 
        ? closedWonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0) / closedWonDeals.length 
        : 0;
      
      const pipelineValue = deals
        .filter(deal => deal.status !== 'closed_lost' && deal.status !== 'closed_won')
        .reduce((sum, deal) => sum + (deal.value || 0), 0);

      // Calculate forecasting metrics
      const activeDeals = deals.filter(deal => deal.status !== 'closed_lost' && deal.status !== 'closed_won');
      
      const totalPipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const weightedPipelineValue = activeDeals.reduce((sum, deal) => 
        sum + ((deal.value || 0) * (deal.probability || 0) / 100), 0);
      const highProbabilityValue = activeDeals
        .filter(deal => (deal.probability || 0) >= 70)
        .reduce((sum, deal) => sum + (deal.value || 0), 0);

      // Deals by close month
      const dealsByCloseMonth = activeDeals.reduce((acc, deal) => {
        if (deal.expected_close_date) {
          const month = new Date(deal.expected_close_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          if (!acc[month]) {
            acc[month] = { month, deals: 0, value: 0, weightedValue: 0 };
          }
          acc[month].deals++;
          acc[month].value += deal.value || 0;
          acc[month].weightedValue += (deal.value || 0) * (deal.probability || 0) / 100;
        }
        return acc;
      }, {} as Record<string, { month: string; deals: number; value: number; weightedValue: number }>);

      // Deals by stage
      const dealsByStage = activeDeals.reduce((acc, deal) => {
        const stage = deal.stage_id || 'Unknown';
        if (!acc[stage]) {
          acc[stage] = { stage, deals: 0, value: 0 };
        }
        acc[stage].deals++;
        acc[stage].value += deal.value || 0;
        return acc;
      }, {} as Record<string, { stage: string; deals: number; value: number }>);

      // Deals by rep with win rates
      const dealsByRep = activeDeals.reduce((acc, deal) => {
        const rep = deal.assigned_to || 'Unassigned';
        if (!acc[rep]) {
          acc[rep] = { rep, deals: 0, value: 0, weightedValue: 0, winRate: 0 };
        }
        acc[rep].deals++;
        acc[rep].value += deal.value || 0;
        acc[rep].weightedValue += (deal.value || 0) * (deal.probability || 0) / 100;
        return acc;
      }, {} as Record<string, { rep: string; deals: number; value: number; weightedValue: number; winRate: number }>);

      // Calculate win rates for each rep
      Object.values(dealsByRep).forEach(rep => {
        const repDeals = deals.filter(d => d.assigned_to === rep.rep);
        const wonDeals = repDeals.filter(d => d.status === 'closed_won');
        rep.winRate = repDeals.length > 0 ? (wonDeals.length / repDeals.length) * 100 : 0;
      });

      const forecast: ForecastMetrics = {
        totalPipelineValue,
        weightedPipelineValue,
        highProbabilityValue,
        averageDealSize: avgDealSize,
        dealsByCloseMonth: Object.values(dealsByCloseMonth).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()),
        dealsByStage: Object.values(dealsByStage).sort((a, b) => b.value - a.value),
        dealsByRep: Object.values(dealsByRep).sort((a, b) => b.weightedValue - a.weightedValue)
      };

      const calculatedMetrics: EnhancedCRMMetrics = {
        totalLeads,
        totalDeals,
        totalActivities,
        conversionRate,
        avgDealSize,
        pipelineValue,
        forecast
      };

      setMetrics(calculatedMetrics);

      // Store forecast metrics in analytics_metrics table for caching
      await storeForecastMetrics(forecast);
    } catch (error) {
      console.error('Error fetching CRM metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch CRM metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const storeForecastMetrics = async (forecast: ForecastMetrics) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Store key forecast metrics in analytics_metrics table
      const metricsToStore = [
        {
          metric_name: 'total_pipeline_value',
          metric_value: forecast.totalPipelineValue,
          category: 'forecast',
          metric_type: 'currency',
          time_period: 'current',
          date_recorded: today,
          metadata: { calculated_at: new Date().toISOString() }
        },
        {
          metric_name: 'weighted_pipeline_value',
          metric_value: forecast.weightedPipelineValue,
          category: 'forecast',
          metric_type: 'currency',
          time_period: 'current',
          date_recorded: today,
          metadata: { calculated_at: new Date().toISOString() }
        },
        {
          metric_name: 'high_probability_value',
          metric_value: forecast.highProbabilityValue,
          category: 'forecast',
          metric_type: 'currency',
          time_period: 'current',
          date_recorded: today,
          metadata: { calculated_at: new Date().toISOString() }
        }
      ];

      // Insert or update metrics
      for (const metric of metricsToStore) {
        await supabase
          .from('analytics_metrics')
          .upsert(metric, { onConflict: 'metric_name,category,date_recorded' });
      }
    } catch (error) {
      console.warn('Failed to store forecast metrics:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    fetchMetrics,
  };
};