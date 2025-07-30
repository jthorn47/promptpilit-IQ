
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useHROIQRequests = (clientId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['hroiq-requests', clientId],
    queryFn: async () => {
      let query = supabase
        .from('hroiq_service_requests')
        .select(`
          *,
          hroiq_client_retainers!inner(
            client_id,
            company_settings(company_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('hroiq_client_retainers.client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (requestData: any) => {
      const { data, error } = await supabase
        .from('hroiq_service_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hroiq-requests'] });
      toast({
        title: 'Success',
        description: 'Request submitted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit request',
        variant: 'destructive',
      });
    },
  });

  const escalateToPulseMutation = useMutation({
    mutationFn: async ({ requestId, caseData }: { requestId: string; caseData: any }) => {
      // Create Pulse case
      const { data: pulseCase, error: caseError } = await supabase
        .from('cases')
        .insert({
          ...caseData,
          source: 'hroiq',
          external_reference: requestId,
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // Update request status
      const { data, error } = await supabase
        .from('hroiq_service_requests')
        .update({ status: 'escalated' })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hroiq-requests'] });
      toast({
        title: 'Success',
        description: 'Request escalated to Pulse case successfully',
      });
    },
  });

  return {
    requests,
    isLoading,
    createRequest: createRequestMutation.mutate,
    escalateToPulse: escalateToPulseMutation.mutate,
  };
};
