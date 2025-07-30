import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award, TrendingUp, Users, Target, CheckSquare, FileText, DollarSign } from 'lucide-react';
import { LeaderboardData } from '../../hooks/gamification/useCRMLeaderboard';

interface CRMLeaderboardProps {
  data?: LeaderboardData;
  timePeriod: 'week' | 'month' | 'all_time';
  isLoading: boolean;
  currentUserId?: string;
}

const LEADERBOARD_CONFIGS = {
  pipeline_value: {
    title: 'Pipeline Value',
    icon: DollarSign,
    description: 'Total deal value closed',
    color: 'text-green-600',
    formatter: (value: number) => `$${value.toLocaleString()}`
  },
  spin_completion: {
    title: 'SPIN Completion',
    icon: Target,
    description: 'SPIN assessments completed',
    color: 'text-blue-600',
    formatter: (value: number) => `${value}%`
  },
  tasks_completed: {
    title: 'Tasks Completed',
    icon: CheckSquare,
    description: 'Tasks completed',
    color: 'text-purple-600',
    formatter: (value: number) => value.toString()
  },
  proposals_sent: {
    title: 'Proposals Sent',
    icon: FileText,
    description: 'Proposals sent to clients',
    color: 'text-orange-600',
    formatter: (value: number) => value.toString()
  },
  proposals_signed: {
    title: 'Proposals Signed',
    icon: Award,
    description: 'Proposals successfully signed',
    color: 'text-yellow-600',
    formatter: (value: number) => value.toString()
  },
  opportunities_created: {
    title: 'Opportunities Created',
    icon: TrendingUp,
    description: 'New opportunities created',
    color: 'text-indigo-600',
    formatter: (value: number) => value.toString()
  },
  activity_score: {
    title: 'Activity Score',
    icon: Trophy,
    description: 'Weighted total of all activities',
    color: 'text-amber-600',
    formatter: (value: number) => value.toLocaleString()
  }
};

export function CRMLeaderboard({ data, timePeriod, isLoading, currentUserId }: CRMLeaderboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getPeriodText = () => {
    switch (timePeriod) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'all_time': return 'All Time';
    }
  };

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing results for {getPeriodText().toLowerCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(LEADERBOARD_CONFIGS).map(([key, config]) => {
          const leaderboardData = data?.[key as keyof LeaderboardData] || [];
          const Icon = config.icon;

          return (
            <Card key={key} className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  {config.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {config.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData.length > 0 ? (
                    leaderboardData.slice(0, 5).map((entry) => {
                      const isCurrentUser = entry.user_id === currentUserId;
                      const medal = getRankMedal(entry.rank);
                      
                      return (
                        <div 
                          key={entry.user_id}
                          className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                            isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-sm font-medium min-w-[2rem]">
                              {medal || `#${entry.rank}`}
                            </span>
                            <div>
                              <p className={`text-sm font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                                {entry.user_name || entry.user_email?.split('@')[0] || 'Anonymous'}
                              </p>
                              {isCurrentUser && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  You
                                </Badge>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-bold">
                            {config.formatter(entry.score_value)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No data yet for {getPeriodText().toLowerCase()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start completing CRM activities to appear on the leaderboard!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}