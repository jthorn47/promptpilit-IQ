import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Clock, RotateCcw, Play, Pause } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BehaviorStats {
  total_events: number;
  pause_frequency: number;
  rewind_rate: number;
  avg_engagement_score: number;
  completion_rate: number;
  avg_session_time: number;
  struggle_points: number[];
}

interface TrainingPlaybackTrackerProps {
  employeeId?: string;
  sceneId?: string;
  className?: string;
}

export const TrainingPlaybackTracker = ({ 
  employeeId, 
  sceneId, 
  className 
}: TrainingPlaybackTrackerProps) => {
  const [stats, setStats] = useState<BehaviorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeId && sceneId) {
      loadBehaviorStats();
    } else {
      loadOverallStats();
    }
  }, [employeeId, sceneId]);

  const loadBehaviorStats = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('user_behavior_analytics')
        .select('*');

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      if (sceneId) {
        query = query.eq('scene_id', sceneId);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Calculate stats from raw data
      const calculatedStats = calculateStats(data || []);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error loading behavior stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOverallStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_behavior_analytics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);
      
      if (error) throw error;

      const calculatedStats = calculateStats(data || []);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error loading overall stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (events: any[]): BehaviorStats => {
    if (events.length === 0) {
      return {
        total_events: 0,
        pause_frequency: 0,
        rewind_rate: 0,
        avg_engagement_score: 0,
        completion_rate: 0,
        avg_session_time: 0,
        struggle_points: []
      };
    }

    const totalEvents = events.length;
    const pauseEvents = events.filter(e => e.event_type === 'pause').length;
    const rewindEvents = events.filter(e => e.event_type === 'rewind').length;
    const completeEvents = events.filter(e => e.event_type === 'complete').length;
    
    const totalEngagement = events.reduce((sum, e) => sum + (e.engagement_score || 0), 0);
    const avgEngagement = totalEvents > 0 ? totalEngagement / totalEvents : 0;
    
    const sessions = groupBySession(events);
    const avgSessionTime = sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + getSessionDuration(session), 0) / sessions.length 
      : 0;

    // Find struggle points (times where users frequently pause/rewind)
    const timePoints = events
      .filter(e => ['pause', 'rewind'].includes(e.event_type) && e.current_time_seconds)
      .map(e => e.current_time_seconds)
      .sort((a, b) => a - b);
    
    const strugglePoints = findStrugglePoints(timePoints);

    return {
      total_events: totalEvents,
      pause_frequency: totalEvents > 0 ? (pauseEvents / totalEvents) * 100 : 0,
      rewind_rate: totalEvents > 0 ? (rewindEvents / totalEvents) * 100 : 0,
      avg_engagement_score: avgEngagement,
      completion_rate: sessions.length > 0 ? (completeEvents / sessions.length) * 100 : 0,
      avg_session_time: avgSessionTime / 1000, // Convert to seconds
      struggle_points: strugglePoints
    };
  };

  const groupBySession = (events: any[]) => {
    const sessions: { [key: string]: any[] } = {};
    events.forEach(event => {
      const sessionId = event.session_id;
      if (!sessions[sessionId]) {
        sessions[sessionId] = [];
      }
      sessions[sessionId].push(event);
    });
    return Object.values(sessions);
  };

  const getSessionDuration = (sessionEvents: any[]) => {
    if (sessionEvents.length < 2) return 0;
    const times = sessionEvents
      .map(e => new Date(e.timestamp).getTime())
      .sort((a, b) => a - b);
    return times[times.length - 1] - times[0];
  };

  const findStrugglePoints = (timePoints: number[]): number[] => {
    // Group time points into 30-second windows and find clusters
    const windows: { [key: number]: number } = {};
    timePoints.forEach(time => {
      const window = Math.floor(time / 30) * 30;
      windows[window] = (windows[window] || 0) + 1;
    });

    // Return windows with more than 2 events (struggle indicators)
    return Object.entries(windows)
      .filter(([_, count]) => count > 2)
      .map(([window, _]) => parseInt(window))
      .sort((a, b) => a - b);
  };

  const getEngagementTrend = (score: number) => {
    if (score > 5) return { icon: TrendingUp, color: "text-green-600", label: "High" };
    if (score < -2) return { icon: TrendingDown, color: "text-red-600", label: "Low" };
    return { icon: Minus, color: "text-yellow-600", label: "Medium" };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Training Playback Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Training Playback Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No behavior data available</p>
        </CardContent>
      </Card>
    );
  }

  const engagementTrend = getEngagementTrend(stats.avg_engagement_score);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5" />
          Training Playback Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Pause className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Pause Rate</span>
            </div>
            <div className="text-2xl font-bold">{stats.pause_frequency.toFixed(1)}%</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">Rewind Rate</span>
            </div>
            <div className="text-2xl font-bold">{stats.rewind_rate.toFixed(1)}%</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Avg Session</span>
            </div>
            <div className="text-2xl font-bold">{formatTime(stats.avg_session_time)}</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <engagementTrend.icon className={`w-4 h-4 ${engagementTrend.color}`} />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.avg_engagement_score.toFixed(1)}</div>
              <Badge variant="outline" className={engagementTrend.color}>
                {engagementTrend.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Completion Rate</span>
            <span>{stats.completion_rate.toFixed(1)}%</span>
          </div>
          <Progress value={stats.completion_rate} className="h-2" />
        </div>

        {/* Struggle Points */}
        {stats.struggle_points.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Common Struggle Points</h4>
            <div className="flex flex-wrap gap-2">
              {stats.struggle_points.map((point, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {formatTime(point)}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Times where learners frequently pause or rewind content
            </p>
          </div>
        )}

        {/* Event Summary */}
        <div className="text-xs text-muted-foreground">
          Total events tracked: {stats.total_events.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};