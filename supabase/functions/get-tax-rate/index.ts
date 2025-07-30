import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { year, rateType, jurisdiction = 'federal' } = await req.json();

    console.log(`Getting tax rate: year=${year}, rateType=${rateType}, jurisdiction=${jurisdiction}`);

    // Query tax_rate_archives table
    const { data, error } = await supabase
      .from('tax_rate_archives')
      .select('rate_value, wage_base, threshold')
      .eq('tax_year', year)
      .eq('rate_type', rateType)
      .eq('jurisdiction', jurisdiction)
      .single();

    if (error) {
      console.error('Database error:', error);
      // Return fallback values for 2024/2025
      const fallbackRate = getFallbackRate(year, rateType);
      return new Response(
        JSON.stringify({ 
          rate: fallbackRate.rate,
          wageBase: fallbackRate.wageBase,
          threshold: fallbackRate.threshold,
          fallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        rate: data.rate_value,
        wageBase: data.wage_base,
        threshold: data.threshold,
        fallback: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Fallback tax rates for 2024 and 2025
function getFallbackRate(year: number, rateType: string) {
  const rates2024 = {
    'fica_social_security': { rate: 0.062, wageBase: 168600, threshold: null },
    'fica_medicare': { rate: 0.0145, wageBase: null, threshold: null },
    'fica_additional_medicare': { rate: 0.009, wageBase: null, threshold: 200000 },
    'ca_sdi': { rate: 0.009, wageBase: 153164, threshold: null },
  };

  const rates2025 = {
    'fica_social_security': { rate: 0.062, wageBase: 176100, threshold: null },
    'fica_medicare': { rate: 0.0145, wageBase: null, threshold: null },
    'fica_additional_medicare': { rate: 0.009, wageBase: null, threshold: 200000 },
    'ca_sdi': { rate: 0.009, wageBase: 168350, threshold: null },
  };

  const fallbackRates = year === 2025 ? rates2025 : rates2024;
  return fallbackRates[rateType as keyof typeof fallbackRates] || { rate: 0, wageBase: null, threshold: null };
}