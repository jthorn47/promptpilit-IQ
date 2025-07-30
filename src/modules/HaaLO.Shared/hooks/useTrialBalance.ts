import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export interface TrialBalanceEntry {
  account_number: string;
  account_name: string;
  account_type: string;
  debit_amount: number;
  credit_amount: number;
}

export interface TrialBalanceTotals {
  total_debits: number;
  total_credits: number;
  is_balanced: boolean;
  difference: number;
}

export const useTrialBalance = (companyId: string, dateFrom?: string, dateTo?: string) => {
  const { data, isLoading, error } = useSupabaseQuery(
    ['trial-balance', companyId, dateFrom, dateTo],
    async () => {
      const { data, error } = await supabase.functions.invoke('calculate-trial-balance', {
        body: { 
          company_id: companyId,
          date_from: dateFrom,
          date_to: dateTo
        }
      });
      
      if (error) throw error;
      return data;
    },
    { enabled: !!companyId }
  );

  return {
    entries: (data?.entries || []) as TrialBalanceEntry[],
    totals: data?.totals as TrialBalanceTotals,
    isLoading,
    error
  };
};