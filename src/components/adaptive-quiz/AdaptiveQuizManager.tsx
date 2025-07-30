import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Settings, BarChart3, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdaptiveQuizManagerProps {
  companyId: string;
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  averagePerformance: number;
  difficultyDistribution: Record<string, number>;
}

export const AdaptiveQuizManager = ({ companyId }: AdaptiveQuizManagerProps) => {
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadManagerData();
  }, [companyId]);

  const loadManagerData = async () => {
    setLoading(true);
    try {
      console.log('Loading adaptive quiz data for company:', companyId);
      
      if (!companyId || companyId === '') {
        throw new Error('No company ID provided');
      }

      let query = supabase
        .from('adaptive_quiz_sessions')
        .select(`
          *,
          employees!inner(first_name, last_name, company_id),
          training_modules(title)
        `);

      // If companyId is 'all', don't filter by company (for super admin)
      if (companyId !== 'all') {
        query = query.eq('employees.company_id', companyId);
      }

      const { data: sessions, error: sessionsError } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (sessionsError) throw sessionsError;

      if (sessions) {
        // Calculate statistics
        const totalSessions = sessions.length;
        const activeSessions = sessions.filter(s => s.status === 'active').length;
        const completedSessions = sessions.filter(s => s.status === 'completed').length;
        
        const completedSessionsData = sessions.filter(s => s.status === 'completed');
        const averagePerformance = completedSessionsData.length > 0
          ? completedSessionsData.reduce((sum, s) => sum + (s.performance_score || 0), 0) / completedSessionsData.length
          : 0;

        const difficultyDistribution = sessions.reduce((acc, s) => {
          acc[s.current_difficulty] = (acc[s.current_difficulty] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setStats({
          totalSessions,
          activeSessions,
          completedSessions,
          averagePerformance,
          difficultyDistribution
        });

        setRecentSessions(sessions.slice(0, 10));
      }

    } catch (error) {
      console.error('Failed to load adaptive quiz manager data:', error);
      toast({
        title: "Error",
        description: "Failed to load adaptive quiz data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatPerformanceScore = (score: number) => {
    return Math.round(score * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading adaptive quiz data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Adaptive Quiz Manager</h2>
          <p className="text-muted-foreground">
            Monitor and manage dynamic difficulty adjustment for learner assessments
          </p>
        </div>
        <Button onClick={loadManagerData}>
          <Settings className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                </div>
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeSessions}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedSessions}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPerformanceScore(stats.averagePerformance)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Adaptive Quiz Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No adaptive quiz sessions found. Sessions will appear here as learners take adaptive quizzes.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getDifficultyColor(session.current_difficulty)}`} />
                        <div>
                          <h4 className="font-medium">
                            {session.employees?.first_name} {session.employees?.last_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {session.training_modules?.title || 'Training Module'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="capitalize">
                          {session.current_difficulty}
                        </Badge>
                        
                        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>

                        {session.performance_score && (
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {formatPerformanceScore(session.performance_score)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {session.total_questions_answered} questions
                            </div>
                          </div>
                        )}

                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {session.correct_streak} streak
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(session.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Difficulty Distribution */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Difficulty Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.difficultyDistribution).map(([difficulty, count]) => (
                      <div key={difficulty} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getDifficultyColor(difficulty)}`} />
                          <span className="capitalize font-medium">{difficulty}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{count}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({Math.round((count / stats.totalSessions) * 100)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Adaptive Algorithm Impact:</strong>
                      <br />
                      • Questions adapt in real-time based on performance
                      <br />
                      • High performers advance to challenging content
                      <br />
                      • Struggling learners receive support and easier questions
                      <br />
                      • Topics are tracked for personalized learning paths
                    </AlertDescription>
                  </Alert>

                  {stats && stats.averagePerformance > 0.8 && (
                    <Alert>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Excellent Performance Detected!</strong>
                        <br />
                        Average performance is {formatPerformanceScore(stats.averagePerformance)}%.
                        Consider adding more advanced questions to challenge high performers.
                      </AlertDescription>
                    </Alert>
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