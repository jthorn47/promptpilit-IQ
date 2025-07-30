import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RetainerNotification {
  id: string;
  company_id: string;
  retainer_id: string;
  notification_type: 'retainer_75_percent' | 'retainer_90_percent' | 'retainer_100_percent' | 'monthly_report_ready' | 'case_resolved';
  title: string;
  message: string;
  threshold_value?: number;
  current_value?: number;
  is_read: boolean;
  sent_at?: string;
  created_at: string;
  metadata?: any;
}

export const useRetainerNotifications = (companyId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['retainer-notifications', companyId],
    queryFn: async () => {
      let query = supabase
        .from('retainer_usage_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(alert => ({
        id: alert.id,
        company_id: alert.company_id,
        retainer_id: alert.retainer_id,
        notification_type: alert.alert_type as any,
        title: `Retainer Alert - ${alert.alert_type}`,
        message: `Threshold reached: ${alert.threshold_hours}h`,
        threshold_value: alert.threshold_hours,
        current_value: alert.current_hours,
        is_read: alert.resolved,
        sent_at: alert.alert_sent_at,
        created_at: alert.created_at,
        metadata: null
      }));
    },
    enabled: !!companyId,
  });

  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    }
  }, [notifications]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('retainer_usage_alerts')
        .update({ resolved: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retainer-notifications'] });
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (notification: Omit<RetainerNotification, 'id' | 'created_at' | 'is_read'>) => {
      const { data, error } = await supabase
        .from('retainer_usage_alerts')
        .insert({
          company_id: notification.company_id,
          retainer_id: notification.retainer_id,
          alert_type: notification.notification_type,
          threshold_hours: notification.threshold_value,
          current_hours: notification.current_value,
          recipients: [], // Will be populated by email notification system
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retainer-notifications'] });
    },
  });

  const checkRetainerThresholds = async (companyId: string, retainerId: string, currentHours: number, totalHours: number) => {
    const percentage = (currentHours / totalHours) * 100;
    
    // Check if we need to create threshold notifications
    const thresholds = [
      { percent: 75, type: 'retainer_75_percent' as const },
      { percent: 90, type: 'retainer_90_percent' as const },
      { percent: 100, type: 'retainer_100_percent' as const },
    ];

    for (const threshold of thresholds) {
      if (percentage >= threshold.percent) {
        // Check if notification already exists for this threshold
        const existingNotification = notifications?.find(n => 
          n.retainer_id === retainerId && 
          n.notification_type === threshold.type
        );

        if (!existingNotification) {
          const message = threshold.percent === 100 
            ? `Retainer hours have been exceeded. Current usage: ${currentHours}/${totalHours} hours (${percentage.toFixed(1)}%)`
            : `Retainer usage has reached ${threshold.percent}%. Current usage: ${currentHours}/${totalHours} hours`;

          await createNotificationMutation.mutateAsync({
            company_id: companyId,
            retainer_id: retainerId,
            notification_type: threshold.type,
            title: `Retainer Usage Alert - ${threshold.percent}%`,
            message,
            threshold_value: threshold.percent,
            current_value: percentage,
            sent_at: new Date().toISOString(),
            metadata: {
              total_hours: totalHours,
              used_hours: currentHours,
              remaining_hours: Math.max(0, totalHours - currentHours)
            }
          });

          // Show toast notification
          toast({
            title: 'Retainer Usage Alert',
            description: message,
            variant: threshold.percent >= 90 ? 'destructive' : 'default',
          });
        }
      }
    }
  };

  const notifyMonthlyReportReady = async (companyId: string, retainerId: string, reportMonth: string) => {
    await createNotificationMutation.mutateAsync({
      company_id: companyId,
      retainer_id: retainerId,
      notification_type: 'monthly_report_ready',
      title: 'Monthly Service Report Ready',
      message: `Your monthly service report for ${reportMonth} is now available for download.`,
      sent_at: new Date().toISOString(),
      metadata: {
        report_month: reportMonth,
        download_available: true
      }
    });

    toast({
      title: 'Report Ready',
      description: 'Your monthly service report is now available',
    });
  };

  const notifyCaseResolved = async (companyId: string, retainerId: string, caseTitle: string, hoursSpent: number) => {
    await createNotificationMutation.mutateAsync({
      company_id: companyId,
      retainer_id: retainerId,
      notification_type: 'case_resolved',
      title: 'Case Resolved',
      message: `Case "${caseTitle}" has been resolved. Time spent: ${hoursSpent} hours.`,
      sent_at: new Date().toISOString(),
      metadata: {
        case_title: caseTitle,
        hours_spent: hoursSpent
      }
    });
  };

  const getNotificationsByType = (type: RetainerNotification['notification_type']) => {
    return notifications?.filter(n => n.notification_type === type) || [];
  };

  const getUnreadNotifications = () => {
    return notifications?.filter(n => !n.is_read) || [];
  };

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead: markAsReadMutation.mutate,
    checkRetainerThresholds,
    notifyMonthlyReportReady,
    notifyCaseResolved,
    getNotificationsByType,
    getUnreadNotifications,
  };
};