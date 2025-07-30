import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentNotification } from '../types';
import { useToast } from '@/hooks/use-toast';

export const useAssessmentNotifications = () => {
  const [notifications, setNotifications] = useState<AssessmentNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assessment_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('assessment_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => notification.id === id ? data : notification)
      );
      
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
      throw error;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
  };
};