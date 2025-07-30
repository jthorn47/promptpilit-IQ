
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

    const { retainer_id, hours_used } = await req.json();

    console.log('Updating retainer usage:', { retainer_id, hours_used });

    // Update retainer usage
    const { data: retainer, error: fetchError } = await supabaseClient
      .from('hroiq_client_retainers')
      .select('*')
      .eq('id', retainer_id)
      .single();

    if (fetchError) {
      console.error('Error fetching retainer:', fetchError);
      throw fetchError;
    }

  const currentHours = retainer.hours_used || 0;
  
  // Include Pulse case time in total calculation
  const { data: pulseTimeEntries } = await supabaseClient
    .from('unified_time_entries')
    .select('hours_logged')
    .eq('retainer_id', retainer_id)
    .eq('time_type', 'case_work');
  
  const pulseHours = pulseTimeEntries?.reduce((sum, entry) => sum + (entry.hours_logged || 0), 0) || 0;
  const newHours = currentHours + hours_used + pulseHours;
  const monthlyLimit = retainer.monthly_hours || 0;

    let updateData: any = {
      hours_used: newHours,
      updated_at: new Date().toISOString(),
    };

    // Handle overage
    if (newHours > monthlyLimit) {
      const overage = newHours - monthlyLimit;
      updateData.overage_hours = overage;
      
      // Check if overage is allowed
      if (!retainer.overage_allowed) {
        return new Response(
          JSON.stringify({ error: 'Overage not allowed for this retainer' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    const { data, error } = await supabaseClient
      .from('hroiq_client_retainers')
      .update(updateData)
      .eq('id', retainer_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating retainer:', error);
      throw error;
    }

    console.log('Retainer updated successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in update-retainer-usage function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
