import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { companyId, retainerId, periodStart, periodEnd } = await req.json();

    console.log('Generating billing preview for company:', companyId);

    // Get retainer details
    const { data: retainer, error: retainerError } = await supabaseClient
      .from('hroiq_client_retainers')
      .select('*')
      .eq('id', retainerId)
      .single();

    if (retainerError) {
      throw retainerError;
    }

    // Get unified time entries for the period
    const { data: timeEntries, error: timeError } = await supabaseClient
      .from('unified_time_entries')
      .select('*')
      .eq('company_id', companyId)
      .gte('work_date', periodStart)
      .lte('work_date', periodEnd)
      .eq('billable', true);

    if (timeError) {
      throw timeError;
    }

    // Calculate breakdown by time type
    const breakdown = {
      case_work: { hours: 0, amount: 0 },
      service_delivery: { hours: 0, amount: 0 },
      consultation: { hours: 0, amount: 0 },
      document_prep: { hours: 0, amount: 0 }
    };

    let totalHours = 0;
    const standardRate = retainer.overage_rate || 150;

    timeEntries?.forEach(entry => {
      const hours = entry.hours_logged || 0;
      totalHours += hours;
      
      const category = entry.time_type as keyof typeof breakdown;
      if (breakdown[category]) {
        breakdown[category].hours += hours;
        breakdown[category].amount += hours * standardRate;
      }
    });

    // Calculate overage
    const includedHours = retainer.retainer_hours || 0;
    const overageHours = Math.max(0, totalHours - includedHours);
    const overageAmount = overageHours * (retainer.overage_rate || 150);

    // Base retainer amount
    const retainerBase = retainer.monthly_retainer_fee || 0;

    // Total amount
    const totalAmount = retainerBase + overageAmount;

    // Get any applicable discounts (mock data for now)
    const discounts = [];
    
    // Calculate taxes (mock data for now)
    const taxRate = 0.0875; // 8.75% example
    const taxes = [{
      type: 'sales_tax',
      rate: taxRate,
      amount: totalAmount * taxRate
    }];

    const preview = {
      retainer_base: retainerBase,
      overage_hours: overageHours,
      overage_amount: overageAmount,
      total_amount: totalAmount,
      breakdown,
      discounts,
      taxes,
      summary: {
        total_hours: totalHours,
        included_hours: includedHours,
        billable_hours: totalHours,
        hourly_rate: retainer.overage_rate || 150
      },
      period: {
        start: periodStart,
        end: periodEnd
      }
    };

    console.log('Billing preview generated:', preview);

    return new Response(
      JSON.stringify({ success: true, preview }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error generating billing preview:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});