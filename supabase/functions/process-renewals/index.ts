import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting renewal processing...");

    // Call the database function to process renewals
    const { data, error } = await supabase.rpc('process_automatic_renewals');

    if (error) {
      console.error("Error processing renewals:", error);
      throw error;
    }

    console.log("Renewal processing completed successfully");

    // Get some stats for the response
    const { data: stats } = await supabase
      .from('renewal_history')
      .select('status, renewal_date')
      .gte('renewal_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const processedToday = stats?.filter(s => 
      new Date(s.renewal_date).toDateString() === new Date().toDateString()
    ).length || 0;

    return new Response(
      JSON.stringify({
        success: true,
        message: "Renewal processing completed",
        processedToday,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in process-renewals function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});