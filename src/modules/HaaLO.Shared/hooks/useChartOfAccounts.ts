import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface ChartOfAccount {
  id: string;
  company_id: string;
  account_number: string;
  full_name: string;
  account_type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  detail_type?: string;
  description?: string;
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
  parent_account_id?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  level?: number;
  path?: string[];
}

export const useChartOfAccounts = (companyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useSupabaseQuery(
    ['chart-of-accounts', companyId],
    async () => {
      const { data, error } = await supabase.rpc('get_account_hierarchy', {
        p_company_id: companyId
      });
      return { data: data as ChartOfAccount[], error };
    },
    { enabled: !!companyId }
  );

  const createAccountMutation = useSupabaseMutation(
    async (accountData: Omit<ChartOfAccount, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert([accountData])
        .select()
        .single();
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
        toast({
          title: 'Success',
          description: 'Account created successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to create account',
          variant: 'destructive',
        });
      },
    }
  );

  const updateAccountMutation = useSupabaseMutation(
    async ({ id, ...updates }: Partial<ChartOfAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
        toast({
          title: 'Success',
          description: 'Account updated successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update account',
          variant: 'destructive',
        });
      },
    }
  );

  const deleteAccountMutation = useSupabaseMutation(
    async (id: string) => {
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('id', id);
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
        toast({
          title: 'Success',
          description: 'Account deleted successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete account',
          variant: 'destructive',
        });
      },
    }
  );

  return {
    accounts: accounts || [],
    isLoading,
    createAccount: createAccountMutation.mutate,
    updateAccount: updateAccountMutation.mutate,
    deleteAccount: deleteAccountMutation.mutate,
    isCreating: createAccountMutation.isPending,
    isUpdating: updateAccountMutation.isPending,
    isDeleting: deleteAccountMutation.isPending,
  };
};