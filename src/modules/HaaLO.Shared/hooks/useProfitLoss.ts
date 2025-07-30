import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export interface ProfitLossEntry {
  account_number: string;
  account_name: string;
  account_type: string;
  amount: number;
}

export interface ProfitLossSummary {
  income_entries: ProfitLossEntry[];
  expense_entries: ProfitLossEntry[];
  total_income: number;
  total_expenses: number;
  net_profit: number;
}

export const useProfitLoss = (companyId: string, dateFrom?: string, dateTo?: string) => {
  const { data, isLoading, error } = useSupabaseQuery(
    ['profit-loss', companyId, dateFrom, dateTo],
    async () => {
      const { data, error } = await supabase.functions.invoke('calculate-profit-loss', {
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
    incomeEntries: (data?.income_entries || []) as ProfitLossEntry[],
    expenseEntries: (data?.expense_entries || []) as ProfitLossEntry[],
    totalIncome: data?.total_income || 0,
    totalExpenses: data?.total_expenses || 0,
    netProfit: data?.net_profit || 0,
    isLoading,
    error
  };
};