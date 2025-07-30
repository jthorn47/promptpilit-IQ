import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are HALO Copilot, an advanced AI assistant specializing in payroll, HR, and compliance for Easeworks. You provide expert insights, answer complex payroll questions, and offer strategic recommendations.

CAPABILITIES:
- Payroll calculation explanations and troubleshooting
- Tax compliance guidance (Federal, State, Local)
- Benefits administration advice
- Risk assessment and anomaly detection
- Forecasting and budgeting insights
- Employee data management
- Regulatory compliance updates

RESPONSE STYLE:
- Clear, professional, and actionable
- Include specific numbers when available
- Suggest follow-up actions
- Flag potential risks or compliance issues
- Reference relevant regulations when applicable

CONTEXT AWARENESS:
- You have access to the user's payroll data, employee records, and historical trends
- Always consider the user's company size, industry, and state jurisdictions
- Provide personalized recommendations based on their specific situation

Example queries you can handle:
- "Why is net pay down this period?"
- "What's our projected Q3 payroll?"
- "Who's nearing overtime thresholds?"
- "How will the new CA minimum wage affect us?"
- "Explain this employee's pay calculation"
- "What tax deductions are we missing?"

Always end responses with relevant follow-up suggestions or actions the user can take.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, companyId, context } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('HALO Copilot query:', { question, companyId });

    // Get company context if companyId provided
    let companyContext = '';
    if (companyId) {
      const { data: company } = await supabase
        .from('company_settings')
        .select('company_name, industry, employee_count, primary_state')
        .eq('id', companyId)
        .single();

      if (company) {
        companyContext = `Company: ${company.company_name}, Industry: ${company.industry}, Employees: ${company.employee_count}, State: ${company.primary_state}`;
      }
    }

    // Enhance question with context
    const enhancedPrompt = `
Company Context: ${companyContext}
Additional Context: ${context || 'None provided'}

User Question: ${question}

Please provide a comprehensive answer that includes:
1. Direct answer to the question
2. Relevant calculations or data points
3. Potential risks or considerations
4. Recommended next steps
5. Related compliance requirements if applicable
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: enhancedPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const answer = data.choices[0].message.content;

    // Log the interaction for analytics
    if (companyId) {
      await supabase
        .from('halo_copilot_logs')
        .insert({
          company_id: companyId,
          question,
          answer,
          context: context || {},
          response_time_ms: Date.now(),
          model_used: 'gpt-4o-mini'
        });
    }

    console.log('HALO Copilot response generated successfully');

    return new Response(JSON.stringify({ 
      answer,
      timestamp: new Date().toISOString(),
      model: 'gpt-4o-mini'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in HALO Copilot:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: "I'm experiencing technical difficulties. Please try again or contact support for assistance."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});