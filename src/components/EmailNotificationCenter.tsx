import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Mail, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Check,
  Trash2
} from "lucide-react";

interface EmailNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: any;
}

export const EmailNotificationCenter = () => {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('email-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'assessment_notifications',
          filter: 'notification_type=eq.email_opened'
        },
        (payload) => {
          console.log('New notification:', payload);
          handleNewNotification(payload.new as EmailNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('assessment_notifications')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('notification_type', 'email_opened')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
      
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (newNotification: EmailNotification) => {
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
        tag: 'email-tracking'
      });
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
            ? { ...n, is_read: true }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase
        .from('assessment_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userData.user.id)
        .eq('notification_type', 'email_opened')
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
      
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
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

      const wasUnread = notifications.find(n => n.id === notificationId)?.is_read === false;
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive browser notifications for email opens",
        });
      }
    }
  };

  useEffect(() => {
    // Request notification permission on component mount
    requestNotificationPermission();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'email_opened': return <Eye className="w-4 h-4 text-green-500" />;
      default: return <Mail className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Email Notifications</h1>
        <div className="text-center py-8">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            Email Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Real-time notifications for email opens and clicks</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchNotifications}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Recent Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground">You'll see email tracking notifications here</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start justify-between p-4 border rounded-lg ${
                    !notification.is_read ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.notification_type)}
                    <div className="flex-1">
                      <h3 className={`font-semibold ${!notification.is_read ? 'text-blue-900' : ''}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                        {notification.metadata?.opened_at && (
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            Opened: {new Date(notification.metadata.opened_at).toLocaleString()}
                          </span>
                        )}
                        {notification.metadata?.ip_address && (
                          <span>IP: {notification.metadata.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};