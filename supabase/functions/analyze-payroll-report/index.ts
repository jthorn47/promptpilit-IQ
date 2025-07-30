import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { reportId } = await req.json();
    
    if (!reportId) {
      throw new Error('Report ID is required');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the report record
    const { data: report, error: reportError } = await supabase
      .from('payroll_report_uploads')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      throw new Error('Report not found');
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(report.file_url);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file');
    }

    // Convert file to base64 for AI analysis
    const buffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));

    // Prepare the AI analysis prompt
    const prompt = `
    You are a payroll analysis expert. Analyze the uploaded payroll report and extract the following information:

    1. Total number of employees/instructors
    2. Total hours worked (regular + overtime)
    3. Total number of classes taught (if applicable for F45 fitness)
    4. Estimated gross pay
    5. Any potential compliance issues
    6. Recommendations for payroll processing

    Please provide a JSON response with this structure:
    {
      "total_employees": number,
      "total_hours": number,
      "total_classes": number,
      "estimated_gross_pay": number,
      "compliance_issues": string[],
      "recommendations": string[],
      "summary": string
    }

    If you cannot extract specific numbers, use null for those fields and explain in the summary.
    `;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a payroll analysis expert specializing in F45 fitness studio payroll processing.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiData = await openAIResponse.json();
    const aiAnalysis = aiData.choices[0]?.message?.content;

    if (!aiAnalysis) {
      throw new Error('No analysis received from AI');
    }

    // Try to parse JSON response from AI
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiAnalysis);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      analysisResult = {
        summary: aiAnalysis,
        total_employees: null,
        total_hours: null,
        total_classes: null,
        estimated_gross_pay: null,
        compliance_issues: [],
        recommendations: ['Manual review required due to file format complexity']
      };
    }

    // Update the report with analysis results
    const { error: updateError } = await supabase
      .from('payroll_report_uploads')
      .update({
        status: 'analyzed',
        analysis_result: analysisResult,
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Error updating report:', updateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: analysisResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-payroll-report function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Analysis failed',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});