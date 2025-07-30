import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SeasonWinner {
  id: string;
  season_name: string;
  season_period: string;
  user_id: string;
  category: string;
  score_value: number;
  rank: number;
  medal: 'gold' | 'silver' | 'bronze' | null;
  created_at: string;
  user_email?: string;
}

export function useCRMSeasonHistory(companyId?: string) {
  return useQuery({
    queryKey: ['crm-season-history', companyId],
    queryFn: async () => {
      let query = supabase
        .from('crm_season_winners')
        .select(`
          *,
          user_profiles!user_id (
            user_id,
            email
          )
        `)
        .order('season_period', { ascending: false })
        .order('category')
        .order('rank');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by season period
      const grouped = data?.reduce((acc, winner) => {
        if (!acc[winner.season_period]) {
          acc[winner.season_period] = [];
        }
        acc[winner.season_period].push({
          ...winner,
          medal: (winner.medal as 'gold' | 'silver' | 'bronze') || null,
          user_email: 'user@example.com' // Temporary fallback
        });
        return acc;
      }, {} as Record<string, SeasonWinner[]>);

      return grouped || {};
    },
  });
}

export function useCurrentSeason() {
  return useQuery({
    queryKey: ['current-season'],
    queryFn: async () => {
      const now = new Date();
      const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toLocaleString('default', { month: 'long', year: 'numeric' });

      return {
        current: currentMonth,
        previous: previousMonth,
        isNewSeason: now.getDate() <= 7 // First week of month
      };
    },
  });
}

export function useSeasonReset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId?: string) => {
      // Call the season manager edge function
      const { data, error } = await supabase.functions.invoke('crm-season-manager', {
        body: { 
          action: 'process_season_end',
          companyId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-season-history'] });
      queryClient.invalidateQueries({ queryKey: ['crm-leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['current-season'] });
    }
  });
}

export function useSeasonWinners(seasonPeriod: string, companyId?: string) {
  return useQuery({
    queryKey: ['season-winners', seasonPeriod, companyId],
    queryFn: async () => {
      let query = supabase
        .from('crm_season_winners')
        .select(`
          *,
          user_profiles!user_id (
            user_id,
            email
          )
        `)
        .eq('season_period', seasonPeriod)
        .order('category')
        .order('rank');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by category
      const grouped = data?.reduce((acc, winner) => {
        if (!acc[winner.category]) {
          acc[winner.category] = [];
        }
        acc[winner.category].push({
          ...winner,
          medal: (winner.medal as 'gold' | 'silver' | 'bronze') || null,
          user_email: 'user@example.com' // Temporary fallback
        });
        return acc;
      }, {} as Record<string, SeasonWinner[]>);

      return grouped || {};
    },
    enabled: !!seasonPeriod,
  });
}

export function useTopPerformers(companyId?: string) {
  return useQuery({
    queryKey: ['top-performers', companyId],
    queryFn: async () => {
      // Get current month's top performers
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      let query = supabase
        .from('crm_leaderboard_scores')
        .select(`
          *,
          user_profiles!user_id (
            user_id,
            email
          )
        `)
        .eq('time_period', 'month')
        .gte('period_start', monthStart.toISOString().split('T')[0])
        .order('score_value', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by score type and take top 3
      const grouped = data?.reduce((acc, score) => {
        if (!acc[score.score_type]) {
          acc[score.score_type] = [];
        }
        if (acc[score.score_type].length < 3) {
          acc[score.score_type].push({
            ...score,
            user_email: 'user@example.com', // Temporary fallback
            rank: acc[score.score_type].length + 1
          });
        }
        return acc;
      }, {} as Record<string, any[]>);

      return grouped || {};
    },
  });
}