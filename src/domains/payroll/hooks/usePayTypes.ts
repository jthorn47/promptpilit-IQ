import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PayType } from '../types';

export const usePayTypes = (companyId?: string) => {
  return useQuery({
    queryKey: ['pay-types', companyId],
    queryFn: async () => {
      console.log('🔍 usePayTypes - companyId:', companyId);
      let query = supabase
        .from('pay_types')
        .select('*')
        .order('name');
      
      if (companyId && companyId !== 'global') {
        console.log('🔍 Adding company_id filter for company and global data:', companyId);
        query = query.or(`company_id.eq.${companyId},company_id.is.null`);
      } else {
        console.log('🔍 Fetching global pay types (no company filter)');
      }
      
      const { data, error } = await query;
      
      console.log('🔍 usePayTypes - data:', data, 'error:', error);
      if (error) throw error;
      return data;
    },
    enabled: true // Always enabled to see what's happening
  });
};

export const useCreatePayType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payType: any) => {
      const { data, error } = await supabase
        .from('pay_types')
        .insert(payType)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-types'] });
    }
  });
};

export const useUpdatePayType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('pay_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pay-types'] });
    }
  });
};