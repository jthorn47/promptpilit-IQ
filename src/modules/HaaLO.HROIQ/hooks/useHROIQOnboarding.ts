
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useHROIQOnboarding = (clientId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: onboardingPackets, isLoading } = useQuery({
    queryKey: ['hroiq-onboarding', clientId],
    queryFn: async () => {
      let query = supabase
        .from('hroiq_onboarding_packets')
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

  const createOnboardingPacketMutation = useMutation({
    mutationFn: async (packetData: any) => {
      // Create onboarding code
      const { data: onboardingCode, error: codeError } = await supabase
        .from('onboarding_codes')
        .insert({
          code: `HROIQ-${Date.now()}`,
          company_id: packetData.client_id,
          work_state: 'CA',
          employee_first_name: packetData.employee_name.split(' ')[0] || '',
          employee_last_name: packetData.employee_name.split(' ').slice(1).join(' ') || '',
          employee_email: packetData.employee_email || '',
        })
        .select()
        .single();

      if (codeError) throw codeError;

      // Create HROIQ packet
      const { data, error } = await supabase
        .from('hroiq_onboarding_packets')
        .insert({
          ...packetData,
          onboarding_code_id: onboardingCode.id,
        })
        .select()
        .single();

      if (error) throw error;
      return { packet: data, code: onboardingCode };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hroiq-onboarding'] });
      toast({
        title: 'Success',
        description: 'Onboarding packet created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create onboarding packet',
        variant: 'destructive',
      });
    },
  });

  return {
    onboardingPackets,
    isLoading,
    createOnboardingPacket: createOnboardingPacketMutation.mutate,
  };
};
