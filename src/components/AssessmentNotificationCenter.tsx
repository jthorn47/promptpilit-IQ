import { useState, useEffect } from "react";
import { Bell, Check, X, Shield, Award, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AssessmentNotification {
  id: string;
  assessment_id: string;
  notification_type: string;
  title: string;
  message: string;
  action_url: string;
  is_read: boolean;
  metadata: any;
  created_at: string;
  read_at: string;
}

const getNotificationIcon = (type: string, metadata?: any) => {
  if (metadata?.achievement) {
    return <Award className="h-4 w-4 text-yellow-500" />;
  }
  
  switch (type) {
    case 'completion':
      return <Shield className="h-4 w-4 text-green-500" />;
    case 'assignment':
      return <Bell className="h-4 w-4 text-blue-500" />;
    case 'reminder':
      return <Clock className="h-4 w-4 text-orange-500" />;
    case 'overdue':
      return <X className="h-4 w-4 text-red-500" />;
    default:
      return <Bell className="h-4 w-4 text-blue-500" />;
  }
};

const getNotificationColor = (type: string, metadata?: any) => {
  if (metadata?.achievement) {
    return 'border-l-yellow-500';
  }
  
  switch (type) {
    case 'completion':
      return 'border-l-green-500';
    case 'assignment':
      return 'border-l-blue-500';
    case 'reminder':
      return 'border-l-orange-500';
    case 'overdue':
      return 'border-l-red-500';
    default:
      return 'border-l-blue-500';
  }
};

export function AssessmentNotificationCenter() {
  const [notifications, setNotifications] = useState<AssessmentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Subscribe to real-time assessment notifications
      const channel = supabase
        .channel('assessment-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'assessment_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as AssessmentNotification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast for new notification
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('assessment_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error: any) {
      console.error('Error fetching assessment notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('assessment_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('assessment_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => ({ 
          ...n, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
      
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All assessment notifications marked as read.",
      });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('assessment_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: AssessmentNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Shield className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Assessment Alerts
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <CardDescription>
                You have {unreadCount} unread assessment notifications
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No assessment notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors border-l-4 ${getNotificationColor(notification.notification_type, notification.metadata)} ${
                        !notification.is_read ? 'bg-muted/30' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.notification_type, notification.metadata)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium truncate ${
                              !notification.is_read ? 'font-semibold' : ''
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.metadata?.achievement && (
                            <Badge variant="secondary" className="mb-2">
                              🏆 {notification.metadata.achievement}
                            </Badge>
                          )}
                          {notification.metadata?.points_earned && (
                            <Badge variant="outline" className="mb-2 ml-1">
                              +{notification.metadata.points_earned} points
                            </Badge>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-xs h-6 px-2"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}