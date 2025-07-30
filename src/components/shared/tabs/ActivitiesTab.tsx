import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Plus, MessageSquare, Phone, Mail } from "lucide-react";

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  description?: string;
  date: string;
  duration?: number;
  assignedTo?: string;
  status?: 'completed' | 'pending' | 'scheduled';
  outcome?: string;
}

interface ActivitiesTabProps {
  activities: Activity[];
  onAddActivity?: () => void;
  onViewActivity?: (activity: Activity) => void;
  readonly?: boolean;
}

export const ActivitiesTab = ({ 
  activities, 
  onAddActivity, 
  onViewActivity,
  readonly = false 
}: ActivitiesTabProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'note':
        return <MessageSquare className="h-4 w-4" />;
      case 'task':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'email':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'meeting':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'note':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'task':
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Timeline of interactions and activities</CardDescription>
          </div>
          {!readonly && onAddActivity && (
            <Button onClick={onAddActivity} size="sm" data-activity-create>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-full ${getActivityTypeColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{activity.subject}</h4>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge 
                        variant="outline" 
                        className={getActivityTypeColor(activity.type)}
                      >
                        {activity.type}
                      </Badge>
                      {activity.status && (
                        <Badge 
                          variant="outline" 
                          className={getStatusColor(activity.status)}
                        >
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                    
                    {activity.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.duration} min
                      </div>
                    )}
                    
                    {activity.assignedTo && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {activity.assignedTo}
                      </div>
                    )}
                  </div>
                  
                  {activity.outcome && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Outcome: </span>
                      <span>{activity.outcome}</span>
                    </div>
                  )}
                  
                  {onViewActivity && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => onViewActivity(activity)}
                      className="mt-2"
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No activities recorded</p>
            {!readonly && onAddActivity && (
              <Button onClick={onAddActivity} variant="outline" className="mt-4" data-activity-create>
                <Plus className="h-4 w-4 mr-2" />
                Add First Activity
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};