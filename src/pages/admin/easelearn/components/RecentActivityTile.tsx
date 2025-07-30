import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  UserPlus, 
  BookOpen, 
  Award, 
  Settings, 
  Clock,
  Filter,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { useRecentActivity } from "../hooks/useRecentActivity";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ActivityItem {
  id: string;
  type: 'learner_added' | 'course_started' | 'course_completed' | 'onboarding_milestone' | 'admin_note';
  title: string;
  description: string;
  companyName: string;
  companyId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const RecentActivityTile = () => {
  const { data: activities, isLoading, refetch } = useRecentActivity();
  const [filter, setFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'learner_added': return UserPlus;
      case 'course_started': return BookOpen;
      case 'course_completed': return Award;
      case 'onboarding_milestone': return Settings;
      case 'admin_note': return Activity;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'learner_added': return 'text-emerald-600 bg-emerald-500/10';
      case 'course_started': return 'text-blue-600 bg-blue-500/10';
      case 'course_completed': return 'text-purple-600 bg-purple-500/10';
      case 'onboarding_milestone': return 'text-amber-600 bg-amber-500/10';
      case 'admin_note': return 'text-slate-600 bg-slate-500/10';
      default: return 'text-slate-600 bg-slate-500/10';
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'learner_added': return { label: 'New Learner', variant: 'default' as const };
      case 'course_started': return { label: 'Training', variant: 'secondary' as const };
      case 'course_completed': return { label: 'Completed', variant: 'default' as const };
      case 'onboarding_milestone': return { label: 'Milestone', variant: 'outline' as const };
      case 'admin_note': return { label: 'Note', variant: 'outline' as const };
      default: return { label: 'Activity', variant: 'outline' as const };
    }
  };

  const filteredActivities = activities?.filter((activity: ActivityItem) => 
    filter === 'all' || activity.type === filter
  ) || [];

  return (
    <Card className="shadow-elegant border-0 bg-gradient-to-br from-card via-card/95 to-card/90">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Recent Activity Feed</CardTitle>
              <p className="text-sm text-muted-foreground">
                LMS-specific activities across all clients
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-emerald-500/10 text-emerald-700 border-emerald-200" : ""}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto' : 'Manual'}
            </Button>
            
            {/* Filter Dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 text-sm border rounded-md bg-background"
            >
              <option value="all">All Activities</option>
              <option value="learner_added">New Learners</option>
              <option value="course_started">Course Started</option>
              <option value="course_completed">Course Completed</option>
              <option value="onboarding_milestone">Milestones</option>
              <option value="admin_note">Admin Notes</option>
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="space-y-3">
              {filteredActivities.map((activity: ActivityItem) => {
                const Icon = getActivityIcon(activity.type);
                const colorClasses = getActivityColor(activity.type);
                const badge = getActivityBadge(activity.type);
                
                return (
                  <div
                    key={activity.id}
                    className="group p-4 rounded-xl border border-muted hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${colorClasses} mt-0.5`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{activity.title}</h4>
                          <Badge variant={badge.variant} className="text-xs">
                            {badge.label}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">{activity.companyName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {filter === 'all' ? 'No recent activity' : `No ${filter.replace('_', ' ')} activities`}
              </p>
            </div>
          )}
        </ScrollArea>
        
        {/* Activity Summary */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {filteredActivities.length} activities shown
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => console.log('View all activities')}
          >
            View All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};