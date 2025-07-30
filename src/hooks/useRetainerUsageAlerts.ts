import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RetainerUsageAlert {
  id: string;
  retainer_id: string;
  company_id: string;
  alert_type: '75_percent' | '90_percent' | '100_percent' | 'overage';
  threshold_hours: number;
  current_hours: number;
  alert_sent_at: string;
  recipients: any[];
  resolved: boolean;
  created_at: string;
}

export const useRetainerUsageAlerts = (companyId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['retainer-usage-alerts', companyId],
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
      return data as RetainerUsageAlert[];
    },
    enabled: !!companyId,
  });

  const createAlertMutation = useMutation({
    mutationFn: async (alertData: Omit<RetainerUsageAlert, 'id' | 'alert_sent_at' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('retainer_usage_alerts')
        .insert(alertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retainer-usage-alerts'] });
      toast({
        title: 'Alert Created',
        description: 'Retainer usage alert has been created',
      });
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { data, error } = await supabase
        .from('retainer_usage_alerts')
        .update({ resolved: true })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retainer-usage-alerts'] });
      toast({
        title: 'Alert Resolved',
        description: 'Alert has been marked as resolved',
      });
    },
  });

  const getActiveAlerts = () => {
    return alerts?.filter(alert => !alert.resolved) || [];
  };

  const getAlertsByType = (type: RetainerUsageAlert['alert_type']) => {
    return alerts?.filter(alert => alert.alert_type === type) || [];
  };

  return {
    alerts,
    isLoading,
    createAlert: createAlertMutation.mutate,
    resolveAlert: resolveAlertMutation.mutate,
    getActiveAlerts,
    getAlertsByType,
  };
};