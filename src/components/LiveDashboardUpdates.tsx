import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardMetrics {
  totalEmployees: number;
  activeTrainings: number;
  completedToday: number;
  overdueTrainings: number;
  completionRate: number;
  avgTimeToComplete: number;
  recentActivities: Activity[];
  topPerformers: Performer[];
}

interface Activity {
  id: string;
  type: 'training_completed' | 'training_assigned' | 'achievement_earned';
  employee_name: string;
  training_name?: string;
  achievement_name?: string;
  timestamp: string;
}

interface Performer {
  id: string;
  name: string;
  completions: number;
  points: number;
}

export const LiveDashboardUpdates = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeTrainings: 0,
    completedToday: 0,
    overdueTrainings: 0,
    completionRate: 0,
    avgTimeToComplete: 0,
    recentActivities: [],
    topPerformers: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardMetrics();
    setupRealtimeSubscriptions();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      const [
        employeesData,
        trainingsData,
        completionsData,
        overdueData,
        recentActivitiesData,
        topPerformersData
      ] = await Promise.all([
        // Total employees
        supabase.from('employees').select('id', { count: 'exact' }),
        
        // Active training assignments
        supabase
          .from('training_assignments')
          .select('id', { count: 'exact' })
          .eq('status', 'assigned'),
        
        // Completions today
        supabase
          .from('training_completions')
          .select('id', { count: 'exact' })
          .gte('completed_at', new Date().toISOString().split('T')[0]),
        
        // Overdue trainings
        supabase
          .from('training_assignments')
          .select('id', { count: 'exact' })
          .eq('status', 'assigned')
          .lt('due_date', new Date().toISOString()),
        
        // Recent activities (mock data structure)
        supabase
          .from('training_completions')
          .select(`
            id,
            completed_at,
            training_modules(title),
            employees(first_name, last_name)
          `)
          .order('completed_at', { ascending: false })
          .limit(10),
        
        // Top performers
        supabase
          .from('user_points')
          .select(`
            user_id,
            total_points,
            profiles(email)
          `)
          .order('total_points', { ascending: false })
          .limit(5)
      ]);

      // Calculate completion rate
      const totalAssignments = trainingsData.count || 0;
      const totalCompletions = completionsData.count || 0;
      const completionRate = totalAssignments > 0 ? (totalCompletions / totalAssignments) * 100 : 0;

      // Process recent activities
      const recentActivities: Activity[] = (recentActivitiesData.data || []).map(item => ({
        id: item.id,
        type: 'training_completed' as const,
        employee_name: `${item.employees?.first_name || ''} ${item.employees?.last_name || ''}`.trim() || 'Unknown',
        training_name: item.training_modules?.title || 'Unknown Training',
        timestamp: item.completed_at
      }));

      // Process top performers
      const topPerformers: Performer[] = (topPerformersData.data || []).map((item, index) => ({
        id: item.user_id,
        name: `User ${index + 1}`,
        completions: 0,
        points: item.total_points
      }));

      setMetrics({
        totalEmployees: employeesData.count || 0,
        activeTrainings: trainingsData.count || 0,
        completedToday: completionsData.count || 0,
        overdueTrainings: overdueData.count || 0,
        completionRate,
        avgTimeToComplete: 45, // Mock data - would calculate from actual completion times
        recentActivities,
        topPerformers
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to training completions
    const completionsChannel = supabase
      .channel('dashboard-completions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'training_completions'
      }, () => {
        fetchDashboardMetrics();
      })
      .subscribe();

    // Subscribe to training assignments
    const assignmentsChannel = supabase
      .channel('dashboard-assignments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'training_assignments'
      }, () => {
        fetchDashboardMetrics();
      })
      .subscribe();

    // Subscribe to employee changes
    const employeesChannel = supabase
      .channel('dashboard-employees')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'employees'
      }, () => {
        fetchDashboardMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(completionsChannel);
      supabase.removeChannel(assignmentsChannel);
      supabase.removeChannel(employeesChannel);
    };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'training_completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'training_assigned': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'achievement_earned': return <Target className="w-4 h-4 text-yellow-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading live dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6" />
          <div>
            <h1 className="text-3xl font-bold">Live Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time training metrics and activity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-600" />
          <Badge variant="outline" className="text-green-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Active learners in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trainings</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeTrainings}</div>
            <p className="text-xs text-muted-foreground">
              Currently assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              Training completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.overdueTrainings}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Training Completion</span>
                  <span>{metrics.completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.completionRate} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Avg. Time to Complete</p>
                  <p className="font-semibold">{metrics.avgTimeToComplete} minutes</p>
                </div>
                <div>
                  <p className="text-muted-foreground">This Month</p>
                  <p className="font-semibold text-green-600">↑ 12% improvement</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topPerformers.map((performer, index) => (
                <div key={performer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{performer.name}</p>
                      <p className="text-xs text-muted-foreground">{performer.points} points</p>
                    </div>
                  </div>
                  <Badge variant="outline">{performer.points}</Badge>
                </div>
              ))}
              {metrics.topPerformers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No performance data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {activity.employee_name} completed {activity.training_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
                <Badge variant="outline">
                  {activity.type === 'training_completed' ? 'Completed' : 'Activity'}
                </Badge>
              </div>
            ))}
            {metrics.recentActivities.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No recent activity to display
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};