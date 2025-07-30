import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Reply, 
  Forward, 
  CheckSquare, 
  Building2, 
  FileText, 
  MessageCircle, 
  Brain, 
  Calendar, 
  Edit3,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivityEntry } from '@/hooks/useEmailActivityHistory';

interface ActivityHistoryPanelProps {
  activities: ActivityEntry[];
  loading: boolean;
  className?: string;
}

const getActivityIcon = (type: ActivityEntry['type']) => {
  switch (type) {
    case 'reply':
      return Reply;
    case 'forward':
      return Forward;
    case 'task_created':
      return CheckSquare;
    case 'crm_linked':
      return Building2;
    case 'pulse_linked':
      return FileText;
    case 'chat_message':
      return MessageCircle;
    case 'ai_summary':
    case 'ai_rewrite':
      return Brain;
    case 'calendar_push':
      return Calendar;
    default:
      return Edit3;
  }
};

const getActivityColor = (type: ActivityEntry['type']) => {
  switch (type) {
    case 'reply':
    case 'forward':
      return 'text-blue-600 bg-blue-50';
    case 'task_created':
      return 'text-green-600 bg-green-50';
    case 'crm_linked':
      return 'text-purple-600 bg-purple-50';
    case 'pulse_linked':
      return 'text-orange-600 bg-orange-50';
    case 'chat_message':
      return 'text-cyan-600 bg-cyan-50';
    case 'ai_summary':
    case 'ai_rewrite':
      return 'text-pink-600 bg-pink-50';
    case 'calendar_push':
      return 'text-indigo-600 bg-indigo-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getActivityTypeLabel = (type: ActivityEntry['type']) => {
  switch (type) {
    case 'reply':
      return 'Reply';
    case 'forward':
      return 'Forward';
    case 'task_created':
      return 'Task Created';
    case 'crm_linked':
      return 'CRM Linked';
    case 'pulse_linked':
      return 'Pulse Linked';
    case 'chat_message':
      return 'Internal Chat';
    case 'ai_summary':
      return 'AI Summary';
    case 'ai_rewrite':
      return 'AI Rewrite';
    case 'calendar_push':
      return 'Calendar Event';
    default:
      return 'Activity';
  }
};

export const ActivityHistoryPanel = ({ activities, loading, className }: ActivityHistoryPanelProps) => {
  if (loading) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4" />
          <h3 className="font-medium">Activity History</h3>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-2 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4" />
        <h3 className="font-medium">Activity History</h3>
        <Badge variant="secondary" className="text-xs">
          {activities.length}
        </Badge>
      </div>

      <ScrollArea className="h-80">
        <div className="space-y-3 pr-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No activity yet</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <div 
                  key={activity.id} 
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50 transition-all duration-200 hover:bg-card",
                    index === 0 && "ring-1 ring-primary/20"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    colorClass
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-medium">
                        {getActivityTypeLabel(activity.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground mb-1">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        by {activity.actor}
                      </span>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <Badge variant="secondary" className="text-xs opacity-60">
                          {Object.keys(activity.metadata).length} details
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};