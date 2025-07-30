import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Users, 
  ThumbsDown,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { useChatInsights } from "../hooks/useChatInsights";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export const ChatInsightsTile = () => {
  const { data, isLoading, error, refetch } = useChatInsights();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Insights
            <RefreshCw className="h-4 w-4 animate-spin ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading chat insights...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Insights
            <Button variant="ghost" size="sm" onClick={refetch} className="ml-auto">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  const getAlertLevel = (metric: string, value: number) => {
    switch (metric) {
      case 'unanswered':
        return value > 10 ? 'critical' : value > 5 ? 'warning' : 'healthy';
      case 'escalation':
        return value > 5 ? 'critical' : value > 2 ? 'warning' : 'healthy';
      case 'response_time':
        return value > 180 ? 'critical' : value > 120 ? 'warning' : 'healthy';
      case 'failed':
      case 'stalled':
        return value > 0 ? 'warning' : 'healthy';
      case 'poor_ratings':
        return value > 3 ? 'warning' : 'healthy';
      default:
        return 'healthy';
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'healthy':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const handleMetricClick = (metric: string) => {
    // Navigate to chat review dashboard with filters
    // For now, we'll navigate to companies page with chat-related filters
    switch (metric) {
      case 'unanswered':
        navigate('/admin/companies?filter=chat:unanswered');
        break;
      case 'escalation':
        navigate('/admin/companies?filter=chat:escalation');
        break;
      case 'response_time':
        navigate('/admin/companies?filter=chat:slow_response');
        break;
      case 'poor_ratings':
        navigate('/admin/companies?filter=chat:flagged');
        break;
      default:
        navigate('/admin/companies');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat Insights
          <Badge variant="outline" className="ml-auto">
            Live
          </Badge>
          <Button variant="ghost" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Unanswered Chats */}
          <div 
            className={cn(
              "p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow",
              getAlertColor(getAlertLevel('unanswered', data?.unansweredChats || 0))
            )}
            onClick={() => handleMetricClick('unanswered')}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Unanswered</span>
            </div>
            <div className="text-2xl font-bold">{data?.unansweredChats || 0}</div>
            <div className="text-xs opacity-75">Last 30-60 min</div>
          </div>

          {/* Escalation Queue */}
          <div 
            className={cn(
              "p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow",
              getAlertColor(getAlertLevel('escalation', data?.escalationQueue || 0))
            )}
            onClick={() => handleMetricClick('escalation')}
          >
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Escalations</span>
            </div>
            <div className="text-2xl font-bold">{data?.escalationQueue || 0}</div>
            <div className="text-xs opacity-75">Pending review</div>
          </div>

          {/* Response Time */}
          <div 
            className={cn(
              "p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow",
              getAlertColor(getAlertLevel('response_time', data?.avgResponseTime || 0))
            )}
            onClick={() => handleMetricClick('response_time')}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Avg Response</span>
            </div>
            <div className="text-2xl font-bold">{data?.avgResponseTime || 0}s</div>
            <div className="text-xs opacity-75">Last 24h</div>
          </div>

          {/* Poor Ratings */}
          <div 
            className={cn(
              "p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow",
              getAlertColor(getAlertLevel('poor_ratings', data?.poorRatings || 0))
            )}
            onClick={() => handleMetricClick('poor_ratings')}
          >
            <div className="flex items-center gap-2 mb-1">
              <ThumbsDown className="h-4 w-4" />
              <span className="text-sm font-medium">Flagged</span>
            </div>
            <div className="text-2xl font-bold">{data?.poorRatings || 0}</div>
            <div className="text-xs opacity-75">Require review</div>
          </div>
        </div>

        <div className="border-t my-4" />

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2">
            <div className="text-lg font-semibold text-amber-600">{data?.failedEscalations || 0}</div>
            <div className="text-xs text-muted-foreground">Failed Escalations</div>
          </div>
          <div className="text-center p-2">
            <div className="text-lg font-semibold text-amber-600">{data?.stalledConversations || 0}</div>
            <div className="text-xs text-muted-foreground">Stalled Chats</div>
          </div>
        </div>

        <div className="border-t my-4" />

        {/* Common Topics */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Top Topics (24h)</span>
          </div>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {data?.commonTopics?.length ? (
              data.commonTopics.slice(0, 3).map((topic, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="truncate">{topic.topic}</span>
                  <Badge variant="secondary" className="text-xs">
                    {topic.count}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground">No topics detected</div>
            )}
          </div>
        </div>

        <div className="border-t my-4" />

        {/* AI Recommendations */}
        {data?.recommendations && data.recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">🧠 AI Recommendations</span>
            </div>
            <div className="space-y-1 max-h-16 overflow-y-auto">
              {data.recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                  {rec}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigate('/admin/companies?filter=chat:all')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View All Chat Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};