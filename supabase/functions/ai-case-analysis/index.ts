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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CaseAnalysisRequest {
  caseId: string;
  description: string;
  issueCategory: string;
  wantsHr: boolean;
  employeeName?: string;
  clientName?: string;
  conversationHistory?: string;
}

interface CaseAnalysisResponse {
  summary: string;
  suggestedAction: string;
  confidenceScore: number;
  contentHash: string;
}

const systemPrompt = `You are HALI, an AI assistant specializing in employee case analysis for HR and payroll support. Your role is to analyze employee issues and provide concise summaries and actionable recommendations.

ANALYSIS GUIDELINES:
1. Generate 1-2 sentence summaries that capture the core issue
2. Provide specific, actionable next steps for the internal team
3. Consider urgency based on category and HR escalation flags
4. Use professional, clear language

CATEGORY-SPECIFIC ACTIONS:
- Payroll: Check timecard systems, verify pay calculations, review direct deposit
- Benefits: Verify enrollment status, check plan coverage, review deduction amounts  
- HR: Assess for policy violations, determine if manager involvement needed
- Technical: Identify system access issues, troubleshoot login problems
- General: Triage to appropriate department, gather additional information

ESCALATION TRIGGERS:
- Use of words like "harassment", "discrimination", "unsafe", "illegal"
- Explicit HR help requests
- Time-sensitive payroll issues (missed pay, incorrect amounts)
- Benefits enrollment deadlines

RESPONSE FORMAT:
- Summary: Brief, factual description of the issue
- Action: Specific next step with system/person to contact when applicable
- Be concise but actionable`;

function generateContentHash(content: string): string {
  // Simple hash function for content change detection
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

async function analyzeCase(caseData: CaseAnalysisRequest): Promise<CaseAnalysisResponse> {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const contextualInfo = [
    `Issue Category: ${caseData.issueCategory}`,
    `HR Help Requested: ${caseData.wantsHr ? 'YES' : 'NO'}`,
    caseData.employeeName ? `Employee: ${caseData.employeeName}` : '',
    caseData.clientName ? `Client: ${caseData.clientName}` : '',
    caseData.conversationHistory ? `Conversation History: ${caseData.conversationHistory}` : ''
  ].filter(Boolean).join('\n');

  const analysisPrompt = `
Context:
${contextualInfo}

Issue Description:
${caseData.description}

Provide analysis in this JSON format:
{
  "summary": "1-2 sentence summary of the employee's issue",
  "suggestedAction": "Specific next step for the internal team",
  "confidenceScore": 0.85
}

Focus on clarity and actionability. Include specific systems or people to contact when relevant.`;

  console.log('🤖 Analyzing case with OpenAI:', { caseId: caseData.caseId, category: caseData.issueCategory });

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
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('❌ OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;

  try {
    const analysis = JSON.parse(aiResponse);
    const contentHash = generateContentHash(caseData.description + caseData.issueCategory);
    
    console.log('✅ Case analysis completed:', { 
      caseId: caseData.caseId, 
      summary: analysis.summary.substring(0, 50) + '...',
      confidence: analysis.confidenceScore 
    });

    return {
      summary: analysis.summary,
      suggestedAction: analysis.suggestedAction,
      confidenceScore: analysis.confidenceScore || 0.8,
      contentHash
    };
  } catch (parseError) {
    console.error('❌ Failed to parse AI response:', parseError);
    // Fallback response
    return {
      summary: `${caseData.issueCategory} issue reported by employee requiring attention`,
      suggestedAction: caseData.wantsHr ? 
        'Escalate to HR due to help request' : 
        `Review ${caseData.issueCategory} case and determine appropriate next steps`,
      confidenceScore: 0.5,
      contentHash: generateContentHash(caseData.description + caseData.issueCategory)
    };
  }
}

serve(async (req) => {
  console.log('🚀 AI Case Analysis function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('📋 Request data:', { caseId: requestData.caseId, category: requestData.issueCategory });

    // Validate required fields
    if (!requestData.caseId || !requestData.description || !requestData.issueCategory) {
      throw new Error('Missing required fields: caseId, description, or issueCategory');
    }

    // Check if case needs reanalysis (content changed)
    const { data: existingCase } = await supabase
      .from('sms_cases')
      .select('ai_last_content_hash, ai_summary, ai_suggested_action, ai_confidence_score')
      .eq('id', requestData.caseId)
      .single();

    const newContentHash = generateContentHash(requestData.description + requestData.issueCategory);
    
    // Return existing analysis if content hasn't changed
    if (existingCase?.ai_last_content_hash === newContentHash && existingCase.ai_summary) {
      console.log('♻️ Returning cached analysis - content unchanged');
      return new Response(JSON.stringify({
        success: true,
        analysis: {
          summary: existingCase.ai_summary,
          suggestedAction: existingCase.ai_suggested_action,
          confidenceScore: existingCase.ai_confidence_score,
          cached: true
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Perform AI analysis
    const analysis = await analyzeCase(requestData);

    // Update the case with AI analysis results
    const { error: updateError } = await supabase
      .from('sms_cases')
      .update({
        ai_summary: analysis.summary,
        ai_suggested_action: analysis.suggestedAction,
        ai_confidence_score: analysis.confidenceScore,
        ai_processed_at: new Date().toISOString(),
        ai_last_content_hash: analysis.contentHash
      })
      .eq('id', requestData.caseId);

    if (updateError) {
      console.error('❌ Failed to update case with AI analysis:', updateError);
      throw new Error('Failed to save AI analysis');
    }

    console.log('✅ AI analysis completed and saved');

    return new Response(JSON.stringify({
      success: true,
      analysis: {
        summary: analysis.summary,
        suggestedAction: analysis.suggestedAction,
        confidenceScore: analysis.confidenceScore,
        cached: false
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ AI Case Analysis error:', error.message);
    console.error('❌ Full error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Check function logs for more details'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});