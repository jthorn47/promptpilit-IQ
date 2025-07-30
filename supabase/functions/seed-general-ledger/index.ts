import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneralLedgerEntry {
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
      const { entries, company_id } = await req.json();

      if (!entries || !Array.isArray(entries) || !company_id) {
        throw new Error('Invalid request body. Expected entries array and company_id');
      }

      console.log(`Seeding ${entries.length} general ledger entries for company ${company_id}`);

      // Validate and transform entries
      const validatedEntries = entries.map((entry: any, index: number) => {
        // Validate required fields
        const requiredFields = ['date', 'type', 'split_account', 'amount', 'balance', 'account_name'];
        const missingFields = requiredFields.filter(field => !entry.hasOwnProperty(field));
        
        if (missingFields.length > 0) {
          throw new Error(`Entry ${index + 1} missing required fields: ${missingFields.join(', ')}`);
        }

        // Parse and validate amounts
        const amount = parseFloat(entry.amount);
        const balance = parseFloat(entry.balance);
        
        if (isNaN(amount) || isNaN(balance)) {
          throw new Error(`Entry ${index + 1} has invalid amount or balance values`);
        }

        // Validate date format
        const date = new Date(entry.date);
        if (isNaN(date.getTime())) {
          throw new Error(`Entry ${index + 1} has invalid date format`);
        }

        return {
          company_id,
          date: entry.date,
          type: entry.type,
          reference: entry.reference || null,
          name: entry.name || null,
          description: entry.description || null,
          split_account: entry.split_account,
          amount,
          balance,
          account_name: entry.account_name,
        };
      });

      // Insert entries in batches to avoid timeout
      const batchSize = 50;
      const results = [];
      
      for (let i = 0; i < validatedEntries.length; i += batchSize) {
        const batch = validatedEntries.slice(i, i + batchSize);
        
        const { data, error } = await supabaseClient
          .from('general_ledger')
          .insert(batch)
          .select();

        if (error) {
          console.error('Batch insert error:', error);
          throw new Error(`Failed to insert batch ${i / batchSize + 1}: ${error.message}`);
        }

        results.push(...(data || []));
        console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(validatedEntries.length / batchSize)}`);
      }

      console.log(`Successfully seeded ${results.length} general ledger entries`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully seeded ${results.length} general ledger entries`,
          entries_created: results.length,
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
    console.error('Error in seed-general-ledger function:', error);
    
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