import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Flame, 
  Award, 
  Zap, 
  Shield, 
  Clock, 
  Users, 
  BookOpen, 
  Crown,
  TrendingUp,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_color: string;
  points: number;
  achievement_type: string;
  earned_at?: string;
}

interface UserPoints {
  total_points: number;
  points_this_month: number;
  points_this_week: number;
  current_streak: number;
  longest_streak: number;
}

interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  rank: number;
  name?: string;
  email?: string;
}

export const GamificationDashboard = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchAchievements(),
        fetchUserPoints(),
        fetchLeaderboard()
      ]).finally(() => setLoading(false));
      
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      // Fetch all available achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: false });

      if (achievementsError) throw achievementsError;

      // Fetch user's earned achievements
      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('*, achievement_definitions(*)')
        .eq('user_id', user?.id);

      if (userError) throw userError;

      setAchievements((allAchievements || []) as Achievement[]);
      setEarnedAchievements(
        (userAchievements || []).map(ua => ({
          ...ua.achievement_definitions,
          earned_at: ua.earned_at
        })) as Achievement[]
      );
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      });
    }
  };

  const fetchUserPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      setUserPoints(data as UserPoints || {
        total_points: 0,
        points_this_month: 0,
        points_this_week: 0,
        current_streak: 0,
        longest_streak: 0
      });
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('user_id, total_points')
        .order('total_points', { ascending: false })
        .limit(10);

      if (error) throw error;

      const leaderboardData = (data || []).map((entry, index) => ({
        user_id: entry.user_id,
        total_points: entry.total_points,
        rank: index + 1,
        email: `User ${index + 1}`
      }));

      setLeaderboard(leaderboardData as LeaderboardEntry[]);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('gamification-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchAchievements();
        fetchUserPoints();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_points',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchUserPoints();
        fetchLeaderboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getIconComponent = (iconName: string, className = "w-6 h-6") => {
    const icons: Record<string, React.ReactNode> = {
      'award': <Award className={className} />,
      'flame': <Flame className={className} />,
      'zap': <Zap className={className} />,
      'star': <Star className={className} />,
      'trophy': <Trophy className={className} />,
      'shield': <Shield className={className} />,
      'clock': <Clock className={className} />,
      'users': <Users className={className} />,
      'book-open': <BookOpen className={className} />,
      'crown': <Crown className={className} />,
    };
    return icons[iconName] || <Award className={className} />;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">#{rank}</span>;
    }
  };

  const userRank = leaderboard.findIndex(entry => entry.user_id === user?.id) + 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading gamification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6" />
          <div>
            <h1 className="text-3xl font-bold">Achievements & Progress</h1>
            <p className="text-muted-foreground">Track your learning journey and earn rewards</p>
          </div>
        </div>
      </div>

      {/* Points Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPoints?.total_points || 0}</div>
            {userRank > 0 && (
              <p className="text-xs text-muted-foreground">Rank #{userRank}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPoints?.points_this_month || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPoints?.current_streak || 0}</div>
            <p className="text-xs text-muted-foreground">
              Best: {userPoints?.longest_streak || 0} days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnedAchievements.length}</div>
            <p className="text-xs text-muted-foreground">
              of {achievements.length} available
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => {
              const earned = earnedAchievements.find(ea => ea.id === achievement.id);
              const isEarned = !!earned;
              
              return (
                <Card key={achievement.id} className={isEarned ? 'border-green-200 bg-green-50' : 'opacity-60'}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className={`p-2 rounded-full ${isEarned ? 'bg-green-100' : 'bg-gray-100'}`}
                        style={{ color: isEarned ? achievement.badge_color : '#9ca3af' }}
                      >
                        {getIconComponent(achievement.icon, "w-5 h-5")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{achievement.name}</h4>
                          <Badge variant={isEarned ? 'default' : 'secondary'}>
                            {achievement.points} pts
                          </Badge>
                          {isEarned && <Badge variant="outline" className="text-green-600">Earned</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        {isEarned && earned.earned_at && (
                          <p className="text-xs text-green-600">
                            Earned {new Date(earned.earned_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.user_id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      entry.user_id === user?.id ? 'bg-primary/10 border-primary' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getRankIcon(entry.rank)}
                      <div>
                        <p className="font-medium">
                          {entry.email?.split('@')[0] || 'Anonymous'}
                          {entry.user_id === user?.id && ' (You)'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{entry.total_points} pts</p>
                    </div>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No leaderboard data available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Achievements Earned</span>
                      <span>{earnedAchievements.length}/{achievements.length}</span>
                    </div>
                    <Progress 
                      value={(earnedAchievements.length / achievements.length) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Points Earned</span>
                      <span>{userPoints?.total_points || 0}</span>
                    </div>
                    <Progress 
                      value={Math.min((userPoints?.total_points || 0) / 1000 * 100, 100)} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Next milestone: 1,000 points
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {earnedAchievements.slice(0, 5).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-full bg-green-100"
                        style={{ color: achievement.badge_color }}
                      >
                        {getIconComponent(achievement.icon, "w-4 h-4")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">
                          +{achievement.points} points
                        </p>
                      </div>
                    </div>
                  ))}
                  {earnedAchievements.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Complete training to start earning achievements!
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
};