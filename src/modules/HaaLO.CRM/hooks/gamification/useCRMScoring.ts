import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActivityScoreData {
  userId: string;
  activityType: string;
  points: number;
  metadata?: any;
  companyId?: string;
}

interface ActivityWeights {
  spin_completion: number;
  proposal_sent: number;
  proposal_signed: number;
  opportunity_created: number;
  task_completed: number;
  deal_closed: number;
  ai_usage: number;
}

const DEFAULT_WEIGHTS: ActivityWeights = {
  spin_completion: 100,
  proposal_sent: 150,
  proposal_signed: 500,
  opportunity_created: 50,
  task_completed: 25,
  deal_closed: 1000,
  ai_usage: 10
};

export function useCRMScoring() {
  const queryClient = useQueryClient();

  const updateScore = useMutation({
    mutationFn: async (data: ActivityScoreData) => {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate different time periods
      const periods = [
        { period: 'week', start: weekStart },
        { period: 'month', start: monthStart },
        { period: 'all_time', start: new Date('2020-01-01') }
      ];

      const scoreType = getScoreTypeFromActivity(data.activityType);
      if (!scoreType) return;

      // Update scores for each time period
      for (const { period, start } of periods) {
        await supabase
          .from('crm_leaderboard_scores')
          .upsert({
            user_id: data.userId,
            company_id: data.companyId,
            score_type: scoreType,
            time_period: period,
            period_start: start.toISOString().split('T')[0],
            period_end: period === 'all_time' ? null : now.toISOString().split('T')[0],
            score_value: data.points, // Simplified for build - TODO: implement proper increment
            metadata: data.metadata || {}
          });
      }

      // Update activity score (weighted total)
      const weight = DEFAULT_WEIGHTS[data.activityType as keyof ActivityWeights] || 1;
      const activityPoints = data.points * weight;

      for (const { period, start } of periods) {
        await supabase
          .from('crm_leaderboard_scores')
          .upsert({
            user_id: data.userId,
            company_id: data.companyId,
            score_type: 'activity_score',
            time_period: period,
            period_start: start.toISOString().split('T')[0],
            period_end: period === 'all_time' ? null : now.toISOString().split('T')[0],
            score_value: activityPoints, // Simplified for build - TODO: implement proper increment
            metadata: { activity_type: data.activityType, weight }
          });
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['crm-user-rank'] });
    }
  });

  const calculateActivityScore = (activityType: string, value: number = 1): number => {
    const weight = DEFAULT_WEIGHTS[activityType as keyof ActivityWeights] || 10;
    return value * weight;
  };

  const processActivity = async (
    userId: string, 
    activityType: string, 
    value: number = 1,
    metadata?: any,
    companyId?: string
  ) => {
    const points = calculateActivityScore(activityType, value);
    
    return updateScore.mutate({
      userId,
      activityType,
      points,
      metadata,
      companyId
    });
  };

  return {
    updateScore,
    calculateActivityScore,
    processActivity
  };
}

function getScoreTypeFromActivity(activityType: string): string | null {
  const mapping: Record<string, string> = {
    'spin_completion': 'spin_completion',
    'proposal_sent': 'proposals_sent',
    'proposal_signed': 'proposals_signed',
    'opportunity_created': 'opportunities_created',
    'task_completed': 'tasks_completed',
    'deal_closed': 'pipeline_value',
    'ai_usage': 'activity_score' // AI usage only affects activity score
  };

  return mapping[activityType] || null;
}

export function useCRMLeaderboardCalculator() {
  const queryClient = useQueryClient();

  const recalculateLeaderboards = useMutation({
    mutationFn: async (companyId?: string) => {
      // This would typically be handled by a background job
      // For now, we'll trigger a recalculation by invalidating queries
      
      // Call edge function to recalculate if needed
      const { data, error } = await supabase.functions.invoke('crm-gamification-processor', {
        body: { action: 'recalculate_leaderboards', companyId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['crm-user-rank'] });
    }
  });

  return { recalculateLeaderboards };
}