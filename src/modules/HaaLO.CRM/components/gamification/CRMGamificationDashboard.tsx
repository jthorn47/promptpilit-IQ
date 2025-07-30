import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Star, TrendingUp, Users, Target, Zap, Award } from 'lucide-react';
import { CRMLeaderboard } from './CRMLeaderboard';
import { CRMAchievementBadges } from './CRMAchievementBadges';
import { CRMSeasonHistory } from './CRMSeasonHistory';
import { useCRMLeaderboard } from '../../hooks/gamification/useCRMLeaderboard';
import { useUserCRMAchievements } from '../../hooks/gamification/useCRMAchievements';
import { useCurrentSeason, useTopPerformers } from '../../hooks/gamification/useCRMSeasonManager';
// Note: useAuth hook needs to be implemented or use supabase auth directly
// import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function CRMGamificationDashboard() {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'all_time'>('month');
  // TODO: Implement proper auth hook
  const user = { id: 'temp-user-id' }; // Temporary for build
  
  const { data: leaderboard, isLoading } = useCRMLeaderboard(timePeriod);
  const { data: userAchievements } = useUserCRMAchievements(user?.id || '');
  const { data: season } = useCurrentSeason();
  const { data: topPerformers } = useTopPerformers();

  const userRank = leaderboard?.activity_score?.find(entry => entry.user_id === user?.id)?.rank;
  const userScore = leaderboard?.activity_score?.find(entry => entry.user_id === user?.id)?.score_value || 0;

  return (
    <div className="space-y-6">
      {/* Header with current stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userRank ? `#${userRank}` : 'Unranked'}
            </div>
            <p className="text-xs text-muted-foreground">
              {timePeriod === 'week' ? 'This Week' : 
               timePeriod === 'month' ? 'This Month' : 'All Time'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userScore.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total points earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAchievements?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Badges earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Season</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{season?.current.split(' ')[0]}</div>
            <p className="text-xs text-muted-foreground">{season?.current.split(' ')[1]}</p>
          </CardContent>
        </Card>
      </div>

      {/* New Season Notification */}
      {season?.isNewSeason && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Star className="h-5 w-5" />
              New Season Started!
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Welcome to {season.current}! The leaderboards have been reset and it's time to climb back to the top.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="leaderboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="seasons">Seasons</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Leaderboards</h3>
            <div className="flex gap-2">
              {(['week', 'month', 'all_time'] as const).map((period) => (
                <Button
                  key={period}
                  variant={timePeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimePeriod(period)}
                >
                  {period === 'all_time' ? 'All Time' : 
                   period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          <CRMLeaderboard 
            data={leaderboard} 
            timePeriod={timePeriod}
            isLoading={isLoading}
            currentUserId={user?.id}
          />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Achievements</h3>
            <Badge variant="secondary">
              {userAchievements?.length || 0} earned
            </Badge>
          </div>
          
          <CRMAchievementBadges userId={user?.id || ''} />
        </TabsContent>

        <TabsContent value="seasons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Season History</h3>
            <Badge variant="outline">
              Current: {season?.current}
            </Badge>
          </div>
          
          <CRMSeasonHistory />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <h3 className="text-lg font-semibold">Performance Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Performers This Month */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Performers This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(topPerformers || {}).map(([category, performers]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium capitalize">
                      {category.replace('_', ' ')}
                    </h4>
                    <div className="space-y-1">
                      {performers.slice(0, 3).map((performer, index) => (
                        <div key={performer.user_id} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            {performer.user_email?.split('@')[0]}
                          </span>
                          <span className="font-medium">
                            {performer.score_value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userAchievements?.slice(0, 5).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: achievement.achievement_definitions.badge_color }}
                      >
                        {achievement.achievement_definitions.icon === 'trophy' ? '🏆' :
                         achievement.achievement_definitions.icon === 'target' ? '🎯' :
                         achievement.achievement_definitions.icon === 'zap' ? '⚡' :
                         achievement.achievement_definitions.icon === 'rocket' ? '🚀' :
                         achievement.achievement_definitions.icon === 'flame' ? '🔥' : '⭐'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {achievement.achievement_definitions.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        +{achievement.achievement_definitions.points}
                      </Badge>
                    </div>
                  ))}
                  
                  {(!userAchievements || userAchievements.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No achievements yet. Start completing CRM activities to earn your first badge!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}