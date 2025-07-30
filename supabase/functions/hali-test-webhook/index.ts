import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    
    console.log(`🧪 Test webhook called at ${timestamp}`);
    console.log(`📄 Method: ${method}, URL: ${url}`);
    
    // Log headers
    const headers = Object.fromEntries(req.headers.entries());
    console.log('📋 Headers:', JSON.stringify(headers, null, 2));
    
    // Try to parse body
    let body = null;
    try {
      if (req.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
        const formData = await req.formData();
        body = Object.fromEntries(formData.entries());
        console.log('📝 Form data:', JSON.stringify(body, null, 2));
      } else {
        const text = await req.text();
        body = text;
        console.log('📝 Raw body:', text);
      }
    } catch (bodyError) {
      console.log('❌ Error parsing body:', bodyError);
    }
    
    const responseData = {
      success: true,
      message: "HALI Test webhook is working!",
      timestamp,
      method,
      url,
      headers: headers,
      body: body
    };
    
    console.log('✅ Sending response:', JSON.stringify(responseData, null, 2));
    
    return new Response(JSON.stringify(responseData), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      },
      status: 200,
    });
    
  } catch (error) {
    console.error('❌ Test webhook error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message, 
      timestamp: new Date().toISOString(),
      message: "Test webhook failed" 
    }), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      },
      status: 500,
    });
  }
});