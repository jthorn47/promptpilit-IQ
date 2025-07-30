import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrialBalanceEntry {
  account_number: string;
  account_name: string;
  account_type: string;
  debit_amount: number;
  credit_amount: number;
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
      const { company_id, date_from, date_to } = await req.json();

      if (!company_id) {
        throw new Error('Company ID is required');
      }

      console.log(`Calculating trial balance for company ${company_id} from ${date_from || 'beginning'} to ${date_to || 'now'}`);

      // First, get the chart of accounts for the company
      let coaQuery = supabaseClient
        .from('chart_of_accounts')
        .select('id, account_number, full_name, account_type')
        .eq('company_id', company_id)
        .order('account_number');

      const { data: accounts, error: coaError } = await coaQuery;

      if (coaError) {
        console.error('Chart of accounts query error:', coaError);
        throw new Error(`Failed to fetch chart of accounts: ${coaError.message}`);
      }

      if (!accounts || accounts.length === 0) {
        console.log('No accounts found for company');
        return new Response(
          JSON.stringify({
            success: true,
            entries: [],
            totals: {
              total_debits: 0,
              total_credits: 0,
              is_balanced: true,
              difference: 0
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      // Get general ledger entries for all accounts
      let glQuery = supabaseClient
        .from('general_ledger')
        .select('split_account, amount, date, status')
        .eq('company_id', company_id)
        .eq('status', 'posted'); // Only posted entries

      // Apply date filters if provided
      if (date_from) {
        glQuery = glQuery.gte('date', date_from);
      }
      if (date_to) {
        glQuery = glQuery.lte('date', date_to);
      }

      const { data: glEntries, error: glError } = await glQuery;

      if (glError) {
        console.error('General ledger query error:', glError);
        throw new Error(`Failed to fetch general ledger entries: ${glError.message}`);
      }

      // Create a map to aggregate amounts by account
      const accountBalances = new Map<string, { debit: number; credit: number }>();

      // Initialize all accounts with zero balances
      accounts.forEach(account => {
        accountBalances.set(account.id, { debit: 0, credit: 0 });
      });

      // Process general ledger entries
      if (glEntries) {
        glEntries.forEach(entry => {
          const accountId = entry.split_account;
          const amount = parseFloat(entry.amount) || 0;
          
          if (accountBalances.has(accountId)) {
            const balance = accountBalances.get(accountId)!;
            const account = accounts.find(a => a.id === accountId);
            
            if (account) {
              // Apply proper debit/credit logic based on account type
              if (['Asset', 'Expense'].includes(account.account_type)) {
                // Asset and Expense accounts: positive amounts are debits, negative are credits
                if (amount >= 0) {
                  balance.debit += amount;
                } else {
                  balance.credit += Math.abs(amount);
                }
              } else if (['Liability', 'Equity', 'Revenue', 'Income'].includes(account.account_type)) {
                // Liability, Equity, Revenue accounts: positive amounts are credits, negative are debits
                if (amount >= 0) {
                  balance.credit += amount;
                } else {
                  balance.debit += Math.abs(amount);
                }
              }
            }
          }
        });
      }

      // Build trial balance entries (only include accounts with activity)
      const trialBalanceEntries: TrialBalanceEntry[] = [];
      let totalDebits = 0;
      let totalCredits = 0;

      accounts.forEach(account => {
        const balance = accountBalances.get(account.id);
        if (balance && (balance.debit !== 0 || balance.credit !== 0)) {
          const entry: TrialBalanceEntry = {
            account_number: account.account_number,
            account_name: account.full_name,
            account_type: account.account_type,
            debit_amount: balance.debit,
            credit_amount: balance.credit
          };
          
          trialBalanceEntries.push(entry);
          totalDebits += balance.debit;
          totalCredits += balance.credit;
        }
      });

      // Calculate totals and check if balanced
      const difference = totalDebits - totalCredits;
      const isBalanced = Math.abs(difference) < 0.01; // Allow for minor rounding differences

      console.log(`Trial balance calculated: ${trialBalanceEntries.length} accounts, Total Debits: ${totalDebits}, Total Credits: ${totalCredits}, Balanced: ${isBalanced}`);

      return new Response(
        JSON.stringify({
          success: true,
          entries: trialBalanceEntries,
          totals: {
            total_debits: totalDebits,
            total_credits: totalCredits,
            is_balanced: isBalanced,
            difference: difference
          }
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
    console.error('Error in calculate-trial-balance function:', error);
    
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