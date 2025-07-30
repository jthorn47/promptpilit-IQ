import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';

export interface BalanceSheetEntry {
  account_number: string;
  account_name: string;
  account_type: string;
  net_balance: number;
}

export interface BalanceSheetSummary {
  asset_entries: BalanceSheetEntry[];
  liability_entries: BalanceSheetEntry[];
  equity_entries: BalanceSheetEntry[];
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  is_balanced: boolean;
  difference: number;
}

export const useBalanceSheet = (companyId: string, asOfDate?: string) => {
  const { data, isLoading, error } = useSupabaseQuery(
    ['balance-sheet', companyId, asOfDate],
    async () => {
      const { data, error } = await supabase.functions.invoke('calculate-balance-sheet', {
        body: { 
          company_id: companyId,
          as_of_date: asOfDate
        }
      });
      
      if (error) throw error;
      return data;
    },
    { enabled: !!companyId }
  );

  return {
    assetEntries: (data?.asset_entries || []) as BalanceSheetEntry[],
    liabilityEntries: (data?.liability_entries || []) as BalanceSheetEntry[],
    equityEntries: (data?.equity_entries || []) as BalanceSheetEntry[],
    totalAssets: data?.total_assets || 0,
    totalLiabilities: data?.total_liabilities || 0,
    totalEquity: data?.total_equity || 0,
    isBalanced: data?.is_balanced ?? true,
    difference: data?.difference || 0,
    isLoading,
    error
  };
};