import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeTrackService } from '../services/TimeTrackService';
import { TimeScore, TimeEntry } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useTimeScore = (weekStart: string, timeEntries?: TimeEntry[]) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const employeeId = user?.id || '';

  // Get existing time score
  const {
    data: timeScore,
    isLoading,
    error
  } = useQuery({
    queryKey: ['time-score', employeeId, weekStart],
    queryFn: () => TimeTrackService.getTimeScore(employeeId, weekStart),
    enabled: !!employeeId && !!weekStart,
  });

  // Calculate and save time score
  const calculateMutation = useMutation({
    mutationFn: async () => {
      if (!timeEntries || timeEntries.length === 0) {
        throw new Error('No time entries available for calculation');
      }
      
      const calculatedScore = await TimeTrackService.calculateTimeScore(
        employeeId, 
        weekStart, 
        timeEntries
      );
      
      return TimeTrackService.saveTimeScore(calculatedScore);
    },
    onSuccess: (newScore) => {
      queryClient.setQueryData(['time-score', employeeId, weekStart], newScore);
      queryClient.invalidateQueries({ queryKey: ['time-score'] });
      toast.success('Time score calculated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to calculate time score: ${error.message}`);
    }
  });

  // Auto-calculate score when timesheet is submitted
  const autoCalculateScore = () => {
    if (timeEntries && timeEntries.length > 0) {
      calculateMutation.mutate();
    }
  };

  // Get score for a different week (for trends)
  const getScoreForWeek = (targetWeekStart: string) => {
    return queryClient.getQueryData(['time-score', employeeId, targetWeekStart]) as TimeScore | undefined;
  };

  // Calculate trend compared to previous week
  const getScoreTrend = () => {
    if (!timeScore) return null;
    
    const previousWeek = new Date(weekStart);
    previousWeek.setDate(previousWeek.getDate() - 7);
    const previousWeekStart = previousWeek.toISOString().split('T')[0];
    
    const previousScore = getScoreForWeek(previousWeekStart);
    if (!previousScore) return null;
    
    const difference = timeScore.total_score - previousScore.total_score;
    return {
      trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable',
      previousScore: previousScore.total_score,
      difference
    } as const;
  };

  return {
    // Data
    timeScore,
    isLoading,
    error,
    
    // Actions
    calculateScore: calculateMutation.mutate,
    autoCalculateScore,
    
    // Status
    isCalculating: calculateMutation.isPending,
    
    // Helpers
    getScoreForWeek,
    getScoreTrend,
    
    // Computed values
    hasScore: !!timeScore,
    scoreLevel: timeScore ? TimeTrackService.getScoreDisplayConfig(timeScore.total_score).level : null,
  };
};