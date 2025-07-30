import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProfitLossEntry {
  account_number: string;
  account_name: string;
  account_type: string;
  account_group: string;
  amount: number;
}

interface ProfitLossGroup {
  group_name: string;
  group_type: string;
  entries: ProfitLossEntry[];
  total: number;
}

interface ProfitLossSummary {
  revenue_group: ProfitLossGroup;
  cogs_group: ProfitLossGroup;
  expense_groups: ProfitLossGroup[];
  total_revenue: number;
  total_cogs: number;
  total_expenses: number;
  gross_profit: number;
  net_income: number;
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
      const { company_id, date_from, date_to, department_id, entity_id } = await req.json();

      if (!company_id) {
        throw new Error('Company ID is required');
      }

      console.log(`Calculating P&L for company ${company_id} from ${date_from} to ${date_to}`);

      // Get chart of accounts first
      const { data: chartData, error: chartError } = await supabaseClient
        .from('chart_of_accounts')
        .select('id, account_number, full_name, account_type, detail_type')
        .eq('company_id', company_id)
        .in('account_type', ['income', 'expense', 'asset', 'liability', 'equity', 'Income', 'Expense', 'Revenue']);

      if (chartError) {
        console.error('Chart of accounts query error:', chartError);
        throw new Error(`Failed to fetch chart of accounts: ${chartError.message}`);
      }

      // Create a map for quick lookups by account number and name
      const accountMap = new Map();
      chartData?.forEach(account => {
        accountMap.set(account.account_number, account);
        accountMap.set(account.full_name, account);
        accountMap.set(account.id, account);
      });

      // Get general ledger entries
      let glQuery = supabaseClient
        .from('general_ledger')
        .select('account_name, amount, date, type')
        .eq('company_id', company_id);

      // Add date filters
      if (date_from) {
        glQuery = glQuery.gte('date', date_from);
      }
      if (date_to) {
        glQuery = glQuery.lte('date', date_to);
      }

      const { data: glData, error: glError } = await glQuery;

      if (glError) {
        console.error('General ledger query error:', glError);
        throw new Error(`Failed to fetch general ledger: ${glError.message}`);
      }

      // Process the data to create grouped entries
      const accountTotals = new Map();

      glData?.forEach(entry => {
        // Try to find the account by account_name
        const account = accountMap.get(entry.account_name);
        
        if (!account) return; // Skip if account not found
        
        // Only include income/expense accounts for P&L
        if (!['income', 'expense'].includes(account.account_type)) return;
        
        const key = `${account.account_number}-${account.full_name}`;
        
        if (!accountTotals.has(key)) {
          accountTotals.set(key, {
            account_number: account.account_number,
            account_name: account.full_name,
            account_type: account.account_type,
            account_group: account.detail_type || account.account_type,
            amount: 0
          });
        }
        
        // For P&L: Income accounts are credits (positive), Expense accounts are debits (positive)
        let adjustedAmount = entry.amount || 0;
        if (account.account_type === 'income') {
          // Income accounts increase with credits
          adjustedAmount = Math.abs(adjustedAmount);
        } else if (account.account_type === 'expense') {
          // Expense accounts increase with debits  
          adjustedAmount = Math.abs(adjustedAmount);
        }
        
        accountTotals.get(key).amount += adjustedAmount;
      });

      const allEntries = Array.from(accountTotals.values()).filter(entry => entry.amount !== 0);

      // Group entries by type
      const revenueEntries = allEntries.filter(entry => 
        entry.account_type === 'income'
      );
      
      const cogsEntries = allEntries.filter(entry => 
        entry.account_group === 'COGS' || entry.account_group === 'Cost of Goods Sold'
      );
      
      const expenseEntries = allEntries.filter(entry => 
        entry.account_type === 'expense' && !['COGS', 'Cost of Goods Sold'].includes(entry.account_group)
      );

      // Group expenses by account_group
      const expenseGroupsMap = new Map<string, ProfitLossEntry[]>();
      expenseEntries.forEach(entry => {
        const groupName = entry.account_group || 'General Expenses';
        if (!expenseGroupsMap.has(groupName)) {
          expenseGroupsMap.set(groupName, []);
        }
        expenseGroupsMap.get(groupName)!.push({
          ...entry,
          amount: Math.abs(entry.amount)
        });
      });

      // Calculate totals
      const totalRevenue = revenueEntries.reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
      const totalCogs = cogsEntries.reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
      const totalExpenses = expenseEntries.reduce((sum, entry) => sum + Math.abs(entry.amount), 0);
      const grossProfit = totalRevenue - totalCogs;
      const netIncome = grossProfit - totalExpenses;

      console.log(`P&L calculated: Revenue: ${totalRevenue}, COGS: ${totalCogs}, Expenses: ${totalExpenses}, Net Income: ${netIncome}`);

      // Create expense groups
      const expenseGroups: ProfitLossGroup[] = Array.from(expenseGroupsMap.entries()).map(([groupName, entries]) => ({
        group_name: groupName,
        group_type: 'expense',
        entries: entries,
        total: entries.reduce((sum, entry) => sum + entry.amount, 0)
      }));

      const summary: ProfitLossSummary = {
        revenue_group: {
          group_name: 'Revenue',
          group_type: 'revenue',
          entries: revenueEntries.map(entry => ({
            ...entry,
            amount: Math.abs(entry.amount)
          })),
          total: totalRevenue
        },
        cogs_group: {
          group_name: 'Cost of Goods Sold',
          group_type: 'cogs',
          entries: cogsEntries.map(entry => ({
            ...entry,
            amount: Math.abs(entry.amount)
          })),
          total: totalCogs
        },
        expense_groups: expenseGroups,
        total_revenue: totalRevenue,
        total_cogs: totalCogs,
        total_expenses: totalExpenses,
        gross_profit: grossProfit,
        net_income: netIncome
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
    console.error('Error in calculate-profit-loss function:', error);
    
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