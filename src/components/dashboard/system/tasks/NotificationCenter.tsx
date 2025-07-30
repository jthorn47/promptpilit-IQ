
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  priority: string;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('notification-service');
      
      if (error) throw error;
      setNotifications(data.notifications);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="text-sm lg:text-base">Notification Center</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
          <p className="text-sm text-destructive">Unable to load</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-3 sm:p-4 lg:p-6">
        <CardTitle className="flex items-center gap-2 text-sm lg:text-base">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="truncate">Notification Center</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent notifications</p>
        ) : (
          <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-2 sm:p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-1 sm:mb-2 gap-2">
                  <span className="text-xs sm:text-sm font-medium truncate flex-1">{notification.title}</span>
                  <Badge className={`${getPriorityColor(notification.priority)} text-xs flex-shrink-0`}>
                    {notification.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1 sm:mb-2 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
