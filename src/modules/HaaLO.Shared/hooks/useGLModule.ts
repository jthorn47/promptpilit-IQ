import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface GLJournal {
  id: string;
  company_id: string;
  journal_number: string;
  date: string;
  memo?: string;
  source: string;
  source_id?: string;
  batch_id?: string;
  created_by: string;
  status: 'Draft' | 'Posted';
  posted_at?: string;
  posted_by?: string;
  total_debits: number;
  total_credits: number;
  is_balanced: boolean;
  reversal_of?: string;
  created_at: string;
  updated_at: string;
  entries?: GLEntry[];
}

export interface GLEntry {
  id: string;
  journal_id: string;
  line_number: number;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
  account?: {
    account_number: string;
    full_name: string;
    account_type: string;
  };
}

export interface GLBatch {
  id: string;
  company_id: string;
  batch_name: string;
  batch_number: string;
  description?: string;
  status: 'Draft' | 'Ready' | 'Posted' | 'Cancelled';
  created_by: string;
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  posted_by?: string;
  posted_at?: string;
  total_journals: number;
  total_debits: number;
  total_credits: number;
}

export interface GLSettings {
  id: string;
  company_id: string;
  default_posting_rules: Record<string, any>;
  auto_journal_number_prefix: string;
  next_journal_number: number;
  current_period_open?: string;
  next_period_open?: string;
  allow_future_posting: boolean;
  require_batch_approval: boolean;
  lock_posted_entries: boolean;
  created_at: string;
  updated_at: string;
}

export interface GLFilters {
  dateFrom?: string;
  dateTo?: string;
  accountId?: string;
  source?: string;
  status?: string;
  batchId?: string;
  entityType?: string;
  entityId?: string;
}

export const useGLJournals = (companyId: string, filters: GLFilters = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: journals, isLoading } = useSupabaseQuery(
    ['gl-journals', companyId, JSON.stringify(filters)],
    async () => {
      let query = supabase
        .from('gl_journals')
        .select(`
          *,
          entries:gl_entries(
            *,
            account:chart_of_accounts(account_number, full_name, account_type)
          )
        `)
        .eq('company_id', companyId)
        .order('date', { ascending: false })
        .order('journal_number', { ascending: false });

      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.source) {
        query = query.eq('source', filters.source);
      }
      if (filters.batchId) {
        query = query.eq('batch_id', filters.batchId);
      }

      const { data, error } = await query;
      return { data: data as GLJournal[], error };
    },
    { enabled: !!companyId }
  );

  const createJournalMutation = useSupabaseMutation(
    async (journalData: Omit<GLJournal, 'id' | 'created_at' | 'updated_at' | 'journal_number' | 'total_debits' | 'total_credits' | 'is_balanced'>) => {
      // Generate journal number
      const { data: journalNumber, error: numberError } = await supabase.rpc(
        'generate_journal_number',
        { p_company_id: journalData.company_id }
      );

      if (numberError) throw numberError;

      const { data, error } = await supabase
        .from('gl_journals')
        .insert([{
          ...journalData,
          journal_number: journalNumber
        }])
        .select()
        .single();
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
        toast({
          title: 'Success',
          description: 'Journal created successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to create journal',
          variant: 'destructive',
        });
      },
    }
  );

  const updateJournalMutation = useSupabaseMutation(
    async ({ id, ...updates }: Partial<GLJournal> & { id: string }) => {
      const { data, error } = await supabase
        .from('gl_journals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
        toast({
          title: 'Success',
          description: 'Journal updated successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update journal',
          variant: 'destructive',
        });
      },
    }
  );

  const postJournalMutation = useSupabaseMutation(
    async (journalId: string) => {
      const { data, error } = await supabase
        .from('gl_journals')
        .update({
          status: 'Posted',
          posted_at: new Date().toISOString(),
          posted_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', journalId)
        .eq('is_balanced', true) // Only allow posting balanced journals
        .select()
        .single();
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
        toast({
          title: 'Success',
          description: 'Journal posted successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to post journal. Make sure it is balanced.',
          variant: 'destructive',
        });
      },
    }
  );

  const deleteJournalMutation = useSupabaseMutation(
    async (id: string) => {
      const { data, error } = await supabase
        .from('gl_journals')
        .delete()
        .eq('id', id)
        .eq('status', 'Draft'); // Only allow deleting draft journals
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
        toast({
          title: 'Success',
          description: 'Journal deleted successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete journal',
          variant: 'destructive',
        });
      },
    }
  );

  return {
    journals: journals || [],
    isLoading,
    createJournal: createJournalMutation.mutate,
    updateJournal: updateJournalMutation.mutate,
    postJournal: postJournalMutation.mutate,
    deleteJournal: deleteJournalMutation.mutate,
    isCreating: createJournalMutation.isPending,
    isUpdating: updateJournalMutation.isPending,
    isPosting: postJournalMutation.isPending,
    isDeleting: deleteJournalMutation.isPending,
  };
};

export const useGLEntries = (journalId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useSupabaseQuery(
    ['gl-entries', journalId],
    async () => {
      const { data, error } = await supabase
        .from('gl_entries')
        .select(`
          *,
          account:chart_of_accounts(account_number, full_name, account_type)
        `)
        .eq('journal_id', journalId)
        .order('line_number');
      return { data: data as GLEntry[], error };
    },
    { enabled: !!journalId }
  );

  const createEntryMutation = useSupabaseMutation(
    async (entryData: Omit<GLEntry, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('gl_entries')
        .insert([entryData])
        .select()
        .single();
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gl-entries', journalId] });
        queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
        toast({
          title: 'Success',
          description: 'Entry created successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to create entry',
          variant: 'destructive',
        });
      },
    }
  );

  const updateEntryMutation = useSupabaseMutation(
    async ({ id, ...updates }: Partial<GLEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from('gl_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gl-entries', journalId] });
        queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
        toast({
          title: 'Success',
          description: 'Entry updated successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update entry',
          variant: 'destructive',
        });
      },
    }
  );

  const deleteEntryMutation = useSupabaseMutation(
    async (id: string) => {
      const { data, error } = await supabase
        .from('gl_entries')
        .delete()
        .eq('id', id);
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gl-entries', journalId] });
        queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
        toast({
          title: 'Success',
          description: 'Entry deleted successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete entry',
          variant: 'destructive',
        });
      },
    }
  );

  return {
    entries: entries || [],
    isLoading,
    createEntry: createEntryMutation.mutate,
    updateEntry: updateEntryMutation.mutate,
    deleteEntry: deleteEntryMutation.mutate,
    isCreating: createEntryMutation.isPending,
    isUpdating: updateEntryMutation.isPending,
    isDeleting: deleteEntryMutation.isPending,
  };
};

export const useGLBatches = (companyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batches, isLoading } = useSupabaseQuery(
    ['gl-batches', companyId],
    async () => {
      const { data, error } = await supabase
        .from('gl_batches')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      return { data: data as GLBatch[], error };
    },
    { enabled: !!companyId }
  );

  const createBatchMutation = useSupabaseMutation(
    async (batchData: Omit<GLBatch, 'id' | 'created_at' | 'updated_at' | 'batch_number' | 'total_journals' | 'total_debits' | 'total_credits'>) => {
      // Generate batch number
      const batchCount = await supabase
        .from('gl_batches')
        .select('id', { count: 'exact' })
        .eq('company_id', batchData.company_id);
      
      const batchNumber = `BATCH-${String((batchCount.count || 0) + 1).padStart(6, '0')}`;

      const { data, error } = await supabase
        .from('gl_batches')
        .insert([{
          ...batchData,
          batch_number: batchNumber
        }])
        .select()
        .single();
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gl-batches'] });
        toast({
          title: 'Success',
          description: 'Batch created successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to create batch',
          variant: 'destructive',
        });
      },
    }
  );

  const updateBatchMutation = useSupabaseMutation(
    async ({ id, ...updates }: Partial<GLBatch> & { id: string }) => {
      const { data, error } = await supabase
        .from('gl_batches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gl-batches'] });
        toast({
          title: 'Success',
          description: 'Batch updated successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update batch',
          variant: 'destructive',
        });
      },
    }
  );

  const postBatchMutation = useSupabaseMutation(
    async (batchId: string) => {
      // Post all journals in the batch
      const { error: journalError } = await supabase
        .from('gl_journals')
        .update({
          status: 'Posted',
          posted_at: new Date().toISOString(),
          posted_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('batch_id', batchId)
        .eq('is_balanced', true);

      if (journalError) throw journalError;

      // Update batch status
      const { data, error } = await supabase
        .from('gl_batches')
        .update({
          status: 'Posted',
          posted_at: new Date().toISOString(),
          posted_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', batchId)
        .select()
        .single();
      
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gl-batches'] });
        queryClient.invalidateQueries({ queryKey: ['gl-journals'] });
        toast({
          title: 'Success',
          description: 'Batch posted successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to post batch. Make sure all journals are balanced.',
          variant: 'destructive',
        });
      },
    }
  );

  return {
    batches: batches || [],
    isLoading,
    createBatch: createBatchMutation.mutate,
    updateBatch: updateBatchMutation.mutate,
    postBatch: postBatchMutation.mutate,
    isCreating: createBatchMutation.isPending,
    isUpdating: updateBatchMutation.isPending,
    isPosting: postBatchMutation.isPending,
  };
};

export const useGLSettings = (companyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useSupabaseQuery(
    ['gl-settings', companyId],
    async () => {
      const { data, error } = await supabase
        .from('gl_settings')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();
      return { data: data as GLSettings, error };
    },
    { enabled: !!companyId }
  );

  const updateSettingsMutation = useSupabaseMutation(
    async (settingsData: Partial<GLSettings>) => {
      const { data, error } = await supabase
        .from('gl_settings')
        .upsert({
          company_id: companyId,
          ...settingsData
        })
        .select()
        .single();
      return { data, error };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['gl-settings'] });
        toast({
          title: 'Success',
          description: 'Settings updated successfully',
        });
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update settings',
          variant: 'destructive',
        });
      },
    }
  );

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
};