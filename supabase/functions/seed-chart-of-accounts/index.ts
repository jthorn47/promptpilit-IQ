import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RawAccountData {
  "Account #": string;
  "Full name": string;
  "Type": string;
  "Detail type"?: string;
  "Description"?: any; // Can be NaN or null
  "Total balance"?: any; // Can be NaN or null
}

interface AccountData {
  account_number: string;
  full_name: string;
  account_type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  detail_type?: string;
  description?: string;
  initial_balance?: number;
  parent_account_id?: string;
  sort_order?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
        auth: {
          persistSession: false,
        },
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    if (req.method === 'POST') {
      const { accounts, company_id } = await req.json();

      if (!accounts || !Array.isArray(accounts) || !company_id) {
        throw new Error('Invalid request body. Expected accounts array and company_id');
      }

      console.log(`Seeding ${accounts.length} accounts for company ${company_id}`);

      // Function to map account type from JSON to our enum
      const mapAccountType = (type: string): 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' => {
        const typeMap: { [key: string]: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' } = {
          'Bank': 'Asset',
          'Accounts receivable (A/R)': 'Asset',
          'Other Current Assets': 'Asset',
          'Fixed Assets': 'Asset',
          'Other Assets': 'Asset',
          'Accounts Payable (A/P)': 'Liability',
          'Other Current Liabilities': 'Liability',
          'Long Term Liabilities': 'Liability',
          'Credit Card': 'Liability',
          'Equity': 'Equity',
          'Income': 'Revenue',
          'Other Income': 'Revenue',
          'Expenses': 'Expense',
          'Cost of Goods Sold': 'Expense',
          'Other Expense': 'Expense'
        };
        
        return typeMap[type] || 'Expense'; // Default to Expense if unknown
      };

      // Helper function to handle NaN values
      const parseNumber = (value: any): number => {
        if (value === null || value === undefined || value === 'NaN' || Number.isNaN(value)) {
          return 0;
        }
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? 0 : parsed;
      };

      // Transform account data to our format
      const validatedAccounts = accounts.map((account: any, index: number) => {
        // Handle both raw JSON format and clean format
        const accountNumber = account["Account #"] || account.account_number || `UNKNOWN_${index}`;
        const fullName = account["Full name"] || account.full_name || `Unknown Account ${index}`;
        const accountType = account["Type"] || account.account_type;
        const detailType = account["Detail type"] || account.detail_type;
        const description = account["Description"] || account.description;
        const balance = account["Total balance"] || account.initial_balance;

        return {
          company_id,
          account_number: accountNumber,
          full_name: fullName,
          account_type: mapAccountType(accountType),
          detail_type: detailType || null,
          description: (description && description !== 'NaN' && description !== '') ? String(description) : null,
          initial_balance: parseNumber(balance),
          current_balance: parseNumber(balance),
          is_active: true,
          parent_account_id: null,
          sort_order: index,
        };
      });

      // Insert accounts in batches
      const batchSize = 50;
      const results = [];
      
      for (let i = 0; i < validatedAccounts.length; i += batchSize) {
        const batch = validatedAccounts.slice(i, i + batchSize);
        
        const { data, error } = await supabaseClient
          .from('chart_of_accounts')
          .upsert(batch, {
            onConflict: 'company_id,account_number',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          console.error('Batch insert error:', error);
          throw new Error(`Failed to insert batch ${i / batchSize + 1}: ${error.message}`);
        }

        results.push(...(data || []));
        console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(validatedAccounts.length / batchSize)}`);
      }

      console.log(`Successfully seeded ${results.length} accounts`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully seeded ${results.length} accounts`,
          accounts_created: results.length,
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
    console.error('Error in seed-chart-of-accounts function:', error);
    
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