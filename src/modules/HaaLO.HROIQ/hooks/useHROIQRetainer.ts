
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useHROIQRetainer = (clientId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: retainer, isLoading } = useQuery({
    queryKey: ['hroiq-retainer', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hroiq_client_retainers')
        .select('*')
        .eq('company_id', clientId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  const updateRetainerMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { data, error } = await supabase
        .from('hroiq_client_retainers')
        .update(updates)
        .eq('company_id', clientId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hroiq-retainer', clientId] });
      toast({
        title: 'Success',
        description: 'Retainer updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update retainer',
        variant: 'destructive',
      });
    },
  });

  const calculateUsage = () => {
    if (!retainer) return { used: 0, remaining: 0, percentage: 0 };
    
    const used = retainer.hours_used || 0;
    const total = retainer.retainer_hours || 0;
    const remaining = Math.max(0, total - used);
    const percentage = total > 0 ? (used / total) * 100 : 0;

    return { used, remaining, percentage, total };
  };

  return {
    retainer,
    isLoading,
    updateRetainer: updateRetainerMutation.mutate,
    calculateUsage,
  };
};
