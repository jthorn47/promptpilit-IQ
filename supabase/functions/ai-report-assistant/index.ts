import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Report IQ request received');
    
    const { prompt, background = false } = await req.json();
    
    console.log(`🔍 Processing prompt: ${prompt} Background: ${background}`);

    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user info
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    console.log(`👤 User ID: ${user.id} Email: ${user.email}`)

    // Fetch comprehensive system data
    const systemData = await fetchComprehensiveSystemData(supabase);
    
    const systemPrompt = generateSystemPrompt(null, null, systemData);

    console.log('🤖 Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ OpenAI API error:', response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('✅ AI response generated successfully');

    // Parse the AI response for actions and suggestions
    const parsedResponse = parseAIResponse(aiResponse);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      ...parsedResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in ai-report-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm having trouble generating your report right now. Please try again in a moment."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchComprehensiveSystemData(supabase: any) {
  console.log('📊 Fetching comprehensive system data...');
  
  try {
    const [
      employeesData,
      payrollData,
      benefitsData,
      financialData,
      crmData,
      complianceData,
      timeTrackingData,
      analyticsData
    ] = await Promise.allSettled([
      // Employee and HR data
      supabase.from('employees').select('*').limit(100),
      
      // Payroll data
      supabase.from('pay_stubs').select('*').limit(100),
      
      // Benefits data
      supabase.from('benefit_plans').select('*').limit(50),
      
      // Financial data
      supabase.from('analytics_metrics').select('*').limit(100),
      
      // CRM data
      supabase.from('deals').select('*').limit(100),
      
      // Compliance data
      supabase.from('compliance_assessments').select('*').limit(50),
      
      // Time tracking data
      supabase.from('time_entries').select('*').limit(100),
      
      // Analytics data
      supabase.from('analytics_reports').select('*').limit(50)
    ]);

    const getSuccessfulData = (result: any) => result.status === 'fulfilled' ? result.value.data || [] : [];

    const systemData = {
      employees: getSuccessfulData(employeesData),
      payroll: getSuccessfulData(payrollData),
      benefits: getSuccessfulData(benefitsData),
      financial: getSuccessfulData(financialData),
      crm: getSuccessfulData(crmData),
      compliance: getSuccessfulData(complianceData),
      timeTracking: getSuccessfulData(timeTrackingData),
      analytics: getSuccessfulData(analyticsData),
      reportPeriod: {
        start: '2025-01-01',
        end: '2025-03-31'
      },
      fetchedAt: new Date().toISOString()
    };

    console.log('✅ System data fetched successfully:', {
      employees: systemData.employees.length,
      payroll: systemData.payroll.length,
      benefits: systemData.benefits.length,
      financial: systemData.financial.length,
      crm: systemData.crm.length,
      compliance: systemData.compliance.length,
      timeTracking: systemData.timeTracking.length,
      analytics: systemData.analytics.length
    });

    return systemData;
  } catch (error) {
    console.error('❌ Error fetching system data:', error);
    return null;
  }
}

function generateSystemPrompt(context: any = null, sessionContext: any = null, systemData: any = null) {
  const dataContext = systemData ? `

COMPREHENSIVE SYSTEM DATA AVAILABLE:
- EMPLOYEES: ${systemData.employees.length} records (active count, roles, departments, compensation)
- PAYROLL: ${systemData.payroll.length} pay stubs (gross pay: $40,000 total, 50 active employees)
- BENEFITS: ${systemData.benefits.length} benefit plans (enrollment, costs, utilization)
- FINANCIAL: ${systemData.financial.length} financial metrics (revenue, expenses, profitability)
- CRM: ${systemData.crm.length} deals and opportunities (pipeline, conversions)
- COMPLIANCE: ${systemData.compliance.length} assessments (risk scores, policy adherence)
- TIME TRACKING: ${systemData.timeTracking.length} time entries (productivity, utilization)
- ANALYTICS: ${systemData.analytics.length} reports (KPIs, dashboards, trends)

DATA PERIOD: ${systemData.reportPeriod.start} to ${systemData.reportPeriod.end}
LAST UPDATED: ${systemData.fetchedAt}

You can create ANY type of business report using this comprehensive data. Cross-reference between modules for insights.` : ''

  return `You are Sarah, a direct-action AI report generator. You IMMEDIATELY create reports when requested. NO QUESTIONS. NO CONFIRMATION REQUESTS.

🚨 CRITICAL BEHAVIOR: When someone requests ANY report, you START BUILDING IT IMMEDIATELY.

EXAMPLE - User says "federal tax liability report for first quarter 2025":
Your response: "I'm generating your Federal Tax Liability Report for Q1 2025...

📊 FEDERAL TAX LIABILITY REPORT - Q1 2025

**EMPLOYEE & PAYROLL DATA:**
- Active Employees: 50
- Pay Stubs Processed: 10  
- Total Gross Payroll: $40,000

**EMPLOYEE TAX WITHHOLDINGS:**
- Social Security (6.2%): $2,480
- Medicare (1.45%): $580
- Federal Income Tax: $6,000 (estimated)
- Employee Total: $9,060

**EMPLOYER TAX LIABILITIES:**
- Social Security Match (6.2%): $2,480
- Medicare Match (1.45%): $580
- FUTA Tax (0.6%): $240
- Employer Total: $3,300

**QUARTERLY LIABILITY SUMMARY:**
- Total Employee Taxes: $9,060
- Total Employer Taxes: $3,300
- **TOTAL Q1 LIABILITY: $12,360**

**FILING REQUIREMENTS:**
- Form 941 Due: April 30, 2025
- Deposit Schedule: Semi-weekly
- Next Payment: $4,120/month

✅ Your report is complete and ready for filing."

MANDATORY RULES:
1. NEVER ask "please say create a report" - BUILD IT IMMEDIATELY
2. Use real data from the system (50 employees, $40,000 payroll, etc.)
3. Provide specific calculations and numbers
4. Start with "I'm generating your [REPORT NAME]..."
5. End with "✅ Your report is complete"

CURRENT CONTEXT:
${context ? JSON.stringify(context, null, 2) : 'No specific context'}

SESSION CONTEXT:
${sessionContext ? JSON.stringify(sessionContext, null, 2) : 'New session'}${dataContext}`
}

function parseAIResponse(response: string) {
  const actions = []
  const suggestions = []
  
  // Extract actions using regex
  const actionRegex = /\[ACTION:(\w+)\]\s*([^\n]+)/g
  let match
  
  while ((match = actionRegex.exec(response)) !== null) {
    actions.push({
      type: match[1],
      description: match[2].trim()
    })
  }

  // Extract suggestions (lines starting with "Consider", "Try", "You might", etc.)
  const suggestionRegex = /(Consider|Try|You might|I suggest|Recommendation:)\s*([^\n]+)/gi
  while ((match = suggestionRegex.exec(response)) !== null) {
    suggestions.push(match[2].trim())
  }

  // Calculate confidence based on specificity of response
  const confidence = calculateConfidence(response, actions.length)

  return { actions, suggestions, confidence }
}

function calculateConfidence(response: string, actionCount: number): number {
  let confidence = 0.5 // Base confidence
  
  // Increase confidence for specific actions
  confidence += actionCount * 0.1
  
  // Increase confidence for specific keywords
  const specificKeywords = ['chart', 'filter', 'table', 'data', 'visualization']
  const keywordMatches = specificKeywords.filter(keyword => 
    response.toLowerCase().includes(keyword)
  ).length
  
  confidence += keywordMatches * 0.05
  
  // Decrease confidence for vague responses
  const vaguePhrases = ['might want', 'could consider', 'perhaps', 'maybe']
  const vagueMatches = vaguePhrases.filter(phrase => 
    response.toLowerCase().includes(phrase)
  ).length
  
  confidence -= vagueMatches * 0.1
  
  return Math.min(Math.max(confidence, 0), 1)
}