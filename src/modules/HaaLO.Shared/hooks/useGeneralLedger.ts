import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface GeneralLedgerEntry {
  id: string;
  company_id: string;
  date: string;
  type: string;
  reference?: string;
  name?: string;
  description?: string;
  split_account: string;
  amount: number;
  balance: number;
  account_name: string;
  created_at: string;
  updated_at: string;
}

export interface GeneralLedgerFilters {
  dateFrom?: string;
  dateTo?: string;
  accountName?: string;
  type?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const useGeneralLedger = (companyId: string, filters?: GeneralLedgerFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useSupabaseQuery(
    ['general-ledger', companyId, JSON.stringify(filters)],
    async () => {
      let query = supabase
        .from('general_ledger')
        .select('*')
        .eq('company_id', companyId)
        .order('date', { ascending: false });

      // Apply filters
      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo);
      }
      if (filters?.accountName) {
        query = query.ilike('account_name', `%${filters.accountName}%`);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.minAmount !== undefined) {
        query = query.gte('amount', filters.minAmount);
      }
      if (filters?.maxAmount !== undefined) {
        query = query.lte('amount', filters.maxAmount);
      }

      const { data, error } = await query;
      return { data: data as GeneralLedgerEntry[], error };
    },
    { enabled: !!companyId }
  );

  const createJournalEntryMutation = useSupabaseMutation(
    async (entryData: Omit<GeneralLedgerEntry, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('general_ledger')
        .insert([entryData])
        .select()
        .single();
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['general-ledger'] });
        toast({
          title: 'Success',
          description: 'Journal entry created successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to create journal entry',
          variant: 'destructive',
        });
      },
    }
  );

  const bulkUploadMutation = useSupabaseMutation(
    async (entries: Omit<GeneralLedgerEntry, 'id' | 'created_at' | 'updated_at'>[]) => {
      const { data, error } = await supabase.functions.invoke('seed-general-ledger', {
        body: { entries, company_id: companyId }
      });
      return { data, error };
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['general-ledger'] });
        toast({
          title: 'Success',
          description: `Successfully uploaded ${data?.entries_created || 0} journal entries`,
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to upload journal entries',
          variant: 'destructive',
        });
      },
    }
  );

  const updateJournalEntryMutation = useSupabaseMutation(
    async ({ id, ...updates }: Partial<GeneralLedgerEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('general_ledger')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['general-ledger'] });
        toast({
          title: 'Success',
          description: 'Journal entry updated successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update journal entry',
          variant: 'destructive',
        });
      },
    }
  );

  const deleteJournalEntryMutation = useSupabaseMutation(
    async (id: string) => {
      const { data, error } = await supabase
        .from('general_ledger')
        .delete()
        .eq('id', id);
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['general-ledger'] });
        toast({
          title: 'Success',
          description: 'Journal entry deleted successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete journal entry',
          variant: 'destructive',
        });
      },
    }
  );

  return {
    entries: entries || [],
    isLoading,
    createJournalEntry: createJournalEntryMutation.mutate,
    bulkUpload: bulkUploadMutation.mutate,
    updateJournalEntry: updateJournalEntryMutation.mutate,
    deleteJournalEntry: deleteJournalEntryMutation.mutate,
    isCreating: createJournalEntryMutation.isPending,
    isUploading: bulkUploadMutation.isPending,
    isUpdating: updateJournalEntryMutation.isPending,
    isDeleting: deleteJournalEntryMutation.isPending,
  };
};