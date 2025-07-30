import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  user_id: string;
  score_value: number;
  rank: number;
  user_email?: string;
  user_name?: string;
}

export interface LeaderboardData {
  pipeline_value: LeaderboardEntry[];
  spin_completion: LeaderboardEntry[];
  tasks_completed: LeaderboardEntry[];
  proposals_sent: LeaderboardEntry[];
  proposals_signed: LeaderboardEntry[];
  opportunities_created: LeaderboardEntry[];
  activity_score: LeaderboardEntry[];
}

export function useCRMLeaderboard(
  timePeriod: 'week' | 'month' | 'all_time' = 'month',
  companyId?: string
) {
  return useQuery({
    queryKey: ['crm-leaderboard', timePeriod, companyId],
    queryFn: async (): Promise<LeaderboardData> => {
      const now = new Date();
      let periodStart: Date;
      
      switch (timePeriod) {
        case 'week':
          periodStart = new Date(now);
          periodStart.setDate(now.getDate() - 7);
          break;
        case 'month':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          periodStart = new Date('2020-01-01');
      }

      // Query leaderboard scores
      let query = supabase
        .from('crm_leaderboard_scores')
        .select(`
          user_id,
          score_type,
          score_value,
          user_profiles!user_id (
            user_id,
            email
          )
        `)
        .eq('time_period', timePeriod)
        .gte('period_start', periodStart.toISOString().split('T')[0]);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data: scores, error } = await query;

      if (error) throw error;

      // Group by score type and rank
      const groupedData: LeaderboardData = {
        pipeline_value: [],
        spin_completion: [],
        tasks_completed: [],
        proposals_sent: [],
        proposals_signed: [],
        opportunities_created: [],
        activity_score: []
      };

      // Group scores by type
      const scoresByType = scores?.reduce((acc, score) => {
        if (!acc[score.score_type]) acc[score.score_type] = [];
        acc[score.score_type].push({
          user_id: score.user_id,
          score_value: score.score_value,
          rank: 0, // Will be calculated
          user_email: 'user@example.com', // Temporary fallback
          user_name: 'User' // Temporary fallback
        });
        return acc;
      }, {} as Record<string, LeaderboardEntry[]>);

      // Rank each category
      Object.entries(scoresByType || {}).forEach(([type, entries]) => {
        const sorted = entries.sort((a, b) => b.score_value - a.score_value);
        sorted.forEach((entry, index) => {
          entry.rank = index + 1;
        });
        groupedData[type as keyof LeaderboardData] = sorted.slice(0, 10); // Top 10
      });

      return groupedData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCRMUserRank(userId: string, timePeriod: 'week' | 'month' | 'all_time' = 'month') {
  return useQuery({
    queryKey: ['crm-user-rank', userId, timePeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_leaderboard_scores')
        .select('*')
        .eq('user_id', userId)
        .eq('time_period', timePeriod);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}