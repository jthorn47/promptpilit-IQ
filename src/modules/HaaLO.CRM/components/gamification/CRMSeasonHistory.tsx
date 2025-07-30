import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Crown, Calendar, Users } from 'lucide-react';
import { useCRMSeasonHistory } from '../../hooks/gamification/useCRMSeasonManager';

export function CRMSeasonHistory() {
  const { data: seasonHistory, isLoading } = useCRMSeasonHistory();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getMedalEmoji = (medal: string | null) => {
    switch (medal) {
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '🏅';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pipeline_value': return '💰';
      case 'activity_score': return '⚡';
      case 'spin_completion': return '🎯';
      case 'tasks_completed': return '✅';
      case 'proposals_sent': return '📄';
      case 'proposals_signed': return '🏆';
      case 'opportunities_created': return '🚀';
      default: return '📊';
    }
  };

  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatValue = (category: string, value: number) => {
    switch (category) {
      case 'pipeline_value':
        return `$${value.toLocaleString()}`;
      case 'spin_completion':
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  if (!seasonHistory || Object.keys(seasonHistory).length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Season History Yet</h3>
          <p className="text-muted-foreground">
            Season winners will appear here after the first monthly reset.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Keep competing to be featured in the next season's hall of fame!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(seasonHistory)
        .sort(([a], [b]) => b.localeCompare(a)) // Sort by season period descending
        .map(([seasonPeriod, winners]) => {
          // Group winners by category
          const categorized = winners.reduce((acc, winner) => {
            if (!acc[winner.category]) acc[winner.category] = [];
            acc[winner.category].push(winner);
            return acc;
          }, {} as Record<string, typeof winners>);

          return (
            <Card key={seasonPeriod}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  {seasonPeriod} Champions
                </CardTitle>
                <CardDescription>
                  Hall of fame for {seasonPeriod.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(categorized).map(([category, categoryWinners]) => (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{getCategoryIcon(category)}</span>
                        <h4 className="font-semibold text-sm">
                          {formatCategoryName(category)}
                        </h4>
                      </div>
                      
                      <div className="space-y-2">
                        {categoryWinners
                          .sort((a, b) => a.rank - b.rank)
                          .slice(0, 3)
                          .map((winner) => (
                            <div 
                              key={winner.id}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                winner.rank === 1 ? 'bg-yellow-50 border border-yellow-200' :
                                winner.rank === 2 ? 'bg-gray-50 border border-gray-200' :
                                winner.rank === 3 ? 'bg-orange-50 border border-orange-200' :
                                'bg-muted'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {getMedalEmoji(winner.medal)}
                                </span>
                                <div>
                                  <p className="font-medium text-sm">
                                    {winner.user_email?.split('@')[0] || 'Anonymous'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Rank #{winner.rank}
                                  </p>
                                </div>
                              </div>
                              <Badge 
                                variant={winner.rank === 1 ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {formatValue(category, winner.score_value)}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}