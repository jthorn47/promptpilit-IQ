import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BalanceSheetEntry {
  account_number: string;
  account_name: string;
  account_type: string;
  account_subtype: string;
  net_balance: number;
}

interface BalanceSheetGroup {
  group_name: string;
  group_type: string;
  entries: BalanceSheetEntry[];
  total: number;
}

interface BalanceSheetSummary {
  asset_groups: BalanceSheetGroup[];
  liability_groups: BalanceSheetGroup[];
  equity_groups: BalanceSheetGroup[];
  retained_earnings: number;
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  is_balanced: boolean;
  difference: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    if (req.method === 'POST') {
      const { company_id, as_of_date, entity_id, department_id } = await req.json();

      if (!company_id) {
        throw new Error('Company ID is required');
      }

      console.log(`Calculating balance sheet for company ${company_id} as of ${as_of_date}`);

      // First, calculate retained earnings (YTD net income)
      const currentYear = as_of_date ? new Date(as_of_date).getFullYear() : new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;
      
      // Get YTD P&L to calculate retained earnings
      const { data: plData, error: plError } = await supabaseClient.functions.invoke('calculate-profit-loss', {
        body: {
          company_id,
          date_from: yearStart,
          date_to: as_of_date
        }
      });

      const retainedEarnings = plData?.net_income || 0;

      // Get chart of accounts first
      const { data: chartData, error: chartError } = await supabaseClient
        .from('chart_of_accounts')
        .select('id, account_number, full_name, account_type, detail_type')
        .eq('company_id', company_id)
        .in('account_type', ['Asset', 'Liability', 'Equity']);

      if (chartError) {
        console.error('Chart of accounts query error:', chartError);
        throw new Error(`Failed to fetch chart of accounts: ${chartError.message}`);
      }

      // Create a map for quick lookups
      const accountMap = new Map();
      chartData?.forEach(account => {
        accountMap.set(account.account_number, account);
        accountMap.set(account.id, account);
      });

      // Get general ledger entries
      let glQuery = supabaseClient
        .from('general_ledger')
        .select('split_account, amount, date')
        .eq('company_id', company_id);

      // Add date filter - only entries up to the as_of_date
      if (as_of_date) {
        glQuery = glQuery.lte('date', as_of_date);
      }

      // Add entity/department filters if provided
      if (entity_id) {
        glQuery = glQuery.eq('entity_id', entity_id);
      }
      if (department_id) {
        glQuery = glQuery.eq('department_id', department_id);
      }

      const { data: glData, error } = await glQuery;

      if (error) {
        console.error('General ledger query error:', error);
        throw new Error(`Failed to fetch general ledger: ${error.message}`);
      }

      // Process the data to create grouped entries
      const accountTotals = new Map();

      glData?.forEach(entry => {
        // Try to find the account by split_account (could be ID or account number)
        const account = accountMap.get(entry.split_account);
        
        if (!account) return; // Skip if account not found or not relevant
        
        const key = `${account.account_number}-${account.full_name}`;
        
        if (!accountTotals.has(key)) {
          accountTotals.set(key, {
            account_number: account.account_number,
            account_name: account.full_name,
            account_type: account.account_type,
            account_subtype: account.detail_type || account.account_type,
            net_balance: 0
          });
        }
        
        const accountTotal = accountTotals.get(key);
        const amount = entry.amount || 0;
        
        // Apply proper debit/credit rules
        if (account.account_type === 'Asset') {
          // Assets: Debits increase, Credits decrease
          accountTotal.net_balance += amount;
        } else if (account.account_type === 'Liability' || account.account_type === 'Equity') {
          // Liabilities & Equity: Credits increase, Debits decrease
          accountTotal.net_balance -= amount;
        }
      });

      const allEntries = Array.from(accountTotals.values()).filter(entry => Math.abs(entry.net_balance) > 0.01);

      // Group entries by type and subtype
      const assetEntries = allEntries.filter(entry => entry.account_type === 'Asset');
      const liabilityEntries = allEntries.filter(entry => entry.account_type === 'Liability');
      const equityEntries = allEntries.filter(entry => entry.account_type === 'Equity');

      // Group assets by subtype
      const assetGroupsMap = new Map<string, BalanceSheetEntry[]>();
      assetEntries.forEach(entry => {
        const subtype = entry.account_subtype || 'Other Assets';
        if (!assetGroupsMap.has(subtype)) {
          assetGroupsMap.set(subtype, []);
        }
        assetGroupsMap.get(subtype)!.push(entry);
      });

      // Group liabilities by subtype
      const liabilityGroupsMap = new Map<string, BalanceSheetEntry[]>();
      liabilityEntries.forEach(entry => {
        const subtype = entry.account_subtype || 'Other Liabilities';
        if (!liabilityGroupsMap.has(subtype)) {
          liabilityGroupsMap.set(subtype, []);
        }
        liabilityGroupsMap.get(subtype)!.push({
          ...entry,
          net_balance: Math.abs(entry.net_balance)
        });
      });

      // Group equity by subtype and add retained earnings
      const equityGroupsMap = new Map<string, BalanceSheetEntry[]>();
      equityEntries.forEach(entry => {
        const subtype = entry.account_subtype || 'Other Equity';
        if (!equityGroupsMap.has(subtype)) {
          equityGroupsMap.set(subtype, []);
        }
        equityGroupsMap.get(subtype)!.push({
          ...entry,
          net_balance: Math.abs(entry.net_balance)
        });
      });

      // Add retained earnings to equity
      if (retainedEarnings !== 0) {
        const retainedEarningsGroup = 'Retained Earnings';
        if (!equityGroupsMap.has(retainedEarningsGroup)) {
          equityGroupsMap.set(retainedEarningsGroup, []);
        }
        equityGroupsMap.get(retainedEarningsGroup)!.push({
          account_number: '3900',
          account_name: 'Retained Earnings',
          account_type: 'Equity',
          account_subtype: 'Retained Earnings',
          net_balance: Math.abs(retainedEarnings)
        });
      }

      // Create group objects
      const assetGroups: BalanceSheetGroup[] = Array.from(assetGroupsMap.entries()).map(([groupName, entries]) => ({
        group_name: groupName,
        group_type: 'asset',
        entries: entries,
        total: entries.reduce((sum, entry) => sum + entry.net_balance, 0)
      }));

      const liabilityGroups: BalanceSheetGroup[] = Array.from(liabilityGroupsMap.entries()).map(([groupName, entries]) => ({
        group_name: groupName,
        group_type: 'liability',
        entries: entries,
        total: entries.reduce((sum, entry) => sum + entry.net_balance, 0)
      }));

      const equityGroups: BalanceSheetGroup[] = Array.from(equityGroupsMap.entries()).map(([groupName, entries]) => ({
        group_name: groupName,
        group_type: 'equity',
        entries: entries,
        total: entries.reduce((sum, entry) => sum + entry.net_balance, 0)
      }));

      // Calculate totals
      const totalAssets = assetGroups.reduce((sum, group) => sum + group.total, 0);
      const totalLiabilities = liabilityGroups.reduce((sum, group) => sum + group.total, 0);
      const totalEquity = equityGroups.reduce((sum, group) => sum + group.total, 0);
      
      // Check if balanced (Assets = Liabilities + Equity)
      const difference = totalAssets - (totalLiabilities + totalEquity);
      const isBalanced = Math.abs(difference) < 0.01;

      console.log(`Balance sheet calculated: Assets: ${totalAssets}, Liabilities: ${totalLiabilities}, Equity: ${totalEquity}, Retained Earnings: ${retainedEarnings}, Balanced: ${isBalanced}`);

      const summary: BalanceSheetSummary = {
        asset_groups: assetGroups,
        liability_groups: liabilityGroups,
        equity_groups: equityGroups,
        retained_earnings: retainedEarnings,
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        total_equity: totalEquity,
        is_balanced: isBalanced,
        difference: difference
      };

      return new Response(
        JSON.stringify({
          success: true,
          ...summary
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    );

  } catch (error) {
    console.error('Error in calculate-balance-sheet function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});