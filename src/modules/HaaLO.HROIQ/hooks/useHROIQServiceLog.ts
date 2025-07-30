
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ServiceLogFilters {
  clientId?: string;
  consultantId?: string;
  serviceType?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const useHROIQServiceLog = (filters: ServiceLogFilters = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: serviceLogs, isLoading } = useQuery({
    queryKey: ['hroiq-service-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('hroiq_service_logs')
        .select('*')
        .order('log_date', { ascending: false });

      if (filters.clientId) {
        query = query.eq('company_id', filters.clientId);
      }

      if (filters.consultantId) {
        query = query.eq('consultant_id', filters.consultantId);
      }

      if (filters.dateRange) {
        query = query
          .gte('log_date', filters.dateRange.start)
          .lte('log_date', filters.dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const createServiceLogMutation = useMutation({
    mutationFn: async (logData: any) => {
      const { data, error } = await supabase
        .from('hroiq_service_logs')
        .insert(logData)
        .select()
        .single();

      if (error) throw error;

      // Update retainer usage - this will be handled by the edge function

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hroiq-service-logs'] });
      queryClient.invalidateQueries({ queryKey: ['hroiq-retainer'] });
      toast({
        title: 'Success',
        description: 'Service log created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create service log',
        variant: 'destructive',
      });
    },
  });

  const waiveHoursMutation = useMutation({
    mutationFn: async ({ logId, reason }: { logId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('hroiq_service_logs')
        .update({ billable: false })
        .eq('id', logId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hroiq-service-logs'] });
      toast({
        title: 'Success',
        description: 'Hours waived successfully',
      });
    },
  });

  return {
    serviceLogs,
    isLoading,
    createServiceLog: createServiceLogMutation.mutate,
    waiveHours: waiveHoursMutation.mutate,
  };
};
