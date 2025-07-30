import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Target, Zap, Rocket, FileText, Brain, MessageCircle, TrendingUp, Flame, Crown, Star } from 'lucide-react';
import { useCRMAchievements, useUserCRMAchievements } from '../../hooks/gamification/useCRMAchievements';

interface CRMAchievementBadgesProps {
  userId: string;
}

const ACHIEVEMENT_ICONS = {
  trophy: Trophy,
  target: Target,
  zap: Zap,
  rocket: Rocket,
  'file-text': FileText,
  brain: Brain,
  'message-circle': MessageCircle,
  'trending-up': TrendingUp,
  flame: Flame,
  crown: Crown,
  award: Star
};

export function CRMAchievementBadges({ userId }: CRMAchievementBadgesProps) {
  const { data: allAchievements, isLoading: achievementsLoading } = useCRMAchievements();
  const { data: userAchievements, isLoading: userLoading } = useUserCRMAchievements(userId);

  if (achievementsLoading || userLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const earnedAchievementIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

  const getIconComponent = (iconName: string) => {
    return ACHIEVEMENT_ICONS[iconName as keyof typeof ACHIEVEMENT_ICONS] || Star;
  };

  const formatCriteria = (criteria: any) => {
    switch (criteria.type) {
      case 'spin_completions':
        return `Complete ${criteria.target} SPIN assessments`;
      case 'closed_value':
        return `Close $${criteria.target.toLocaleString()}+ in proposals`;
      case 'weekly_tasks':
        return `Complete ${criteria.target}+ tasks in a week`;
      case 'daily_opportunities':
        return `Create ${criteria.target} opportunities in one day`;
      case 'weekly_proposals':
        return `Sign ${criteria.target} proposals in one week`;
      case 'weekly_ai_usage':
        return `Use Sarah AI ${criteria.target} times in a week`;
      case 'opportunity_followups':
        return `Follow up ${criteria.target}+ times on one opportunity`;
      case 'pipeline_value':
        return `Build $${criteria.target.toLocaleString()}+ in pipeline value`;
      case 'activity_streak':
        return `${criteria.target} consecutive days of CRM activity`;
      case 'monthly_rank':
        return `Rank #${criteria.target} on monthly leaderboard`;
      default:
        return 'Complete the required criteria';
    }
  };

  const getProgressTowards = (achievement: any): number => {
    // This would ideally come from real-time calculation
    // For now, return 0 for unearned achievements
    if (earnedAchievementIds.has(achievement.id)) return 100;
    
    // Simulate some progress for demo
    const criteria = achievement.criteria;
    switch (criteria.type) {
      case 'spin_completions':
      case 'weekly_tasks':
      case 'daily_opportunities':
        return Math.random() * 80; // 0-80% progress
      default:
        return Math.random() * 60; // 0-60% progress
    }
  };

  if (!allAchievements || allAchievements.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Achievements Available</h3>
          <p className="text-muted-foreground">
            Achievement system is being set up. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earned Achievements */}
      {userAchievements && userAchievements.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-primary">🏆 Earned Achievements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userAchievements.map((userAchievement) => {
              const achievement = userAchievement.achievement_definitions;
              const Icon = getIconComponent(achievement.icon);
              
              return (
                <Card key={userAchievement.id} className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary text-primary-foreground">
                      +{achievement.points}
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: achievement.badge_color }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{achievement.name}</CardTitle>
                        <CardDescription className="text-sm">
                          Earned {new Date(userAchievement.earned_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <div className="mt-3">
                      <Progress value={100} className="h-2" />
                      <p className="text-xs text-primary font-medium mt-1">
                        ✓ Completed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Achievements */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">🎯 Available Achievements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAchievements
            .filter(achievement => !earnedAchievementIds.has(achievement.id))
            .map((achievement) => {
              const Icon = getIconComponent(achievement.icon);
              const progress = getProgressTowards(achievement);
              
              return (
                <Card key={achievement.id} className="relative overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline">
                      +{achievement.points}
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white opacity-70"
                        style={{ backgroundColor: achievement.badge_color }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base text-muted-foreground">
                          {achievement.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {formatCriteria(achievement.criteria)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {achievement.description}
                    </p>
                    <div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(progress)}% Complete
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Getting Started */}
      {(!userAchievements || userAchievements.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start Your CRM Journey!</h3>
            <p className="text-muted-foreground mb-4">
              Complete CRM activities to earn your first achievement badge.
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>💡 Complete a SPIN assessment</p>
              <p>📋 Finish some tasks</p>
              <p>🚀 Create new opportunities</p>
              <p>📄 Send proposals to clients</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}