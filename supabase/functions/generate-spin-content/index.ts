import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  spinType: 'situation' | 'problem' | 'implication' | 'needPayoff';
  tone: 'concise' | 'persuasive' | 'consultative';
  companyName: string;
  industry?: string;
  companySize?: string;
  existingContent?: string;
  contextData?: {
    riskAssessment?: string;
    emailHistory?: string;
    crmTags?: string[];
  };
}

interface SpinGenerationRequest {
  companyId: string;
  riskData: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Check if this is the new proposal content generation request
    if (requestBody.spinType && requestBody.tone && requestBody.companyName) {
      return await handleProposalContentGeneration(requestBody);
    }
    
    // Legacy SPIN question generation for risk assessments
    return await handleLegacySpinGeneration(requestBody);
    
  } catch (error: any) {
    console.error('Error in generate-spin-content:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

async function handleProposalContentGeneration(request: GenerateRequest): Promise<Response> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const { 
    spinType, 
    tone, 
    companyName, 
    industry, 
    companySize, 
    existingContent,
    contextData 
  } = request;

  console.log('Generating SPIN content:', { spinType, tone, companyName });

  // Build context for AI
  let contextPrompt = `Company: ${companyName}`;
  if (industry) contextPrompt += `\nIndustry: ${industry}`;
  if (companySize) contextPrompt += `\nSize: ${companySize}`;
  
  if (contextData?.riskAssessment) {
    contextPrompt += `\nRisk Assessment Data: ${contextData.riskAssessment}`;
  }
  
  if (contextData?.emailHistory) {
    contextPrompt += `\nEmail History: ${contextData.emailHistory}`;
  }
  
  if (contextData?.crmTags && contextData.crmTags.length > 0) {
    contextPrompt += `\nCRM Tags: ${contextData.crmTags.join(', ')}`;
  }

  // Define tone instructions
  const toneInstructions = {
    concise: 'Write in a brief, direct, and to-the-point style. Keep sentences short and focus on key facts.',
    persuasive: 'Write in a compelling, influential style that emphasizes benefits and urgency. Use emotional appeals and strong language.',
    consultative: 'Write in a professional, advisory tone that positions you as a trusted expert. Use collaborative language and focus on partnership.'
  };

  // Define SPIN-specific prompts
  const spinPrompts = {
    situation: `Write a SITUATION section for a SPIN sales methodology. Describe the current business situation and context for ${companyName}. Focus on their current state, business environment, and relevant background information. This should be factual and descriptive.`,
    problem: `Write a PROBLEM section for a SPIN sales methodology. Identify specific challenges, pain points, and difficulties that ${companyName} is currently facing. Focus on operational issues, inefficiencies, or gaps in their current processes.`,
    implication: `Write an IMPLICATION section for a SPIN sales methodology. Explain the consequences and negative impacts if ${companyName} doesn't address their current problems. Focus on costs, risks, missed opportunities, and future complications.`,
    needPayoff: `Write a NEED-PAYOFF section for a SPIN sales methodology. Describe the benefits, value, and positive outcomes that ${companyName} would gain from solving their problems. Focus on ROI, improvements, and competitive advantages.`
  };

  let systemPrompt = `You are an expert SPIN sales consultant helping to create compelling proposal content. ${spinPrompts[spinType]}

${toneInstructions[tone]}

Context about the company:
${contextPrompt}

${existingContent ? `\nExisting content to improve or rewrite:\n${existingContent}` : ''}

Requirements:
- Write 2-4 sentences that are specific to this company
- Use the ${tone} tone throughout
- Make it relevant to HR services and business automation
- Be specific and avoid generic statements
- Focus on measurable impacts where possible`;

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
        { role: 'user', content: `Generate ${spinType.toUpperCase()} content for ${companyName}` }
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedContent = data.choices[0].message.content.trim();

  console.log('Generated content:', generatedContent);

  return new Response(JSON.stringify({ 
    content: generatedContent,
    spinType,
    tone 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleLegacySpinGeneration(request: SpinGenerationRequest): Promise<Response> {
  // Get OpenAI API key from existing integration
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Fetch OpenAI API key from integrations
  const { data: openAIIntegration, error: integrationError } = await supabase
    .from('integrations')
    .select('credentials')
    .eq('provider_id', (
      await supabase
        .from('integration_providers')
        .select('id')
        .eq('name', 'openai')
        .single()
    ).data?.id)
    .eq('status', 'active')
    .single();

  if (integrationError || !openAIIntegration?.credentials?.api_key) {
    throw new Error('OpenAI integration not found or API key not configured');
  }

  const openAIApiKey = openAIIntegration.credentials.api_key;
  const { companyId, riskData } = request;

  console.log(`Generating SPIN content for company: ${companyId}`);

  // Get company information
  const { data: company, error: companyError } = await supabase
    .from('company_settings')
    .select('company_name, industry_type, number_of_employees')
    .eq('id', companyId)
    .single();

  if (companyError || !company) {
    throw new Error('Company not found');
  }

  // Generate SPIN content using OpenAI
  const spinContent = await generateSpinWithOpenAI(company, riskData, openAIApiKey);

  // Trigger PropGEN workflow update
  const workflowResult = await supabase.functions.invoke('propgen-integration-handler', {
    body: {
      triggerType: 'spin_content_generated',
      companyId,
      triggerData: {
        spinContent,
        generatedAt: new Date().toISOString()
      }
    }
  });

  return new Response(JSON.stringify({ 
    success: true, 
    spinContent,
    workflowResult: workflowResult.data 
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateSpinWithOpenAI(company: any, riskData: any, apiKey: string) {
  const prompt = `Generate SPIN Selling conversation framework content for a workplace violence prevention consultation. 

Company Details:
- Name: ${company.company_name}
- Industry: ${company.industry_type || 'Unknown'}
- Size: ${company.number_of_employees || 'Unknown'} employees

Risk Assessment Results:
- Risk Score: ${riskData.risk_score}/100
- Risk Level: ${riskData.risk_level}
- Key Findings: ${JSON.stringify(riskData.responses || {})}

Create SPIN framework content with:
1. SITUATION Questions (3-4 questions to understand current workplace safety situation)
2. PROBLEM Questions (3-4 questions to identify pain points and challenges)
3. IMPLICATION Questions (3-4 questions to explore consequences of current situation)
4. NEED-PAYOFF Questions (3-4 questions to build value for our solution)

Format as JSON with structure:
{
  "situation": ["question1", "question2", ...],
  "problem": ["question1", "question2", ...],
  "implication": ["question1", "question2", ...],
  "needPayoff": ["question1", "question2", ...]
}

Make questions specific to workplace violence prevention and tailored to the company's risk profile.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert in SPIN Selling methodology and workplace violence prevention consulting. Generate targeted SPIN questions that help sales reps understand client needs and build value for workplace violence prevention solutions.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse OpenAI response as JSON:', content);
    // Return structured fallback
    return {
      situation: [
        "What workplace safety measures do you currently have in place?",
        "How do you currently handle employee conflicts or tensions?",
        "What training programs exist for violence prevention?"
      ],
      problem: [
        "What challenges have you faced with workplace incidents?",
        "Are there any areas where employees feel unsafe?",
        "How difficult is it to maintain consistent safety protocols?"
      ],
      implication: [
        "What could happen if a serious incident occurred?",
        "How would workplace violence impact your operations?",
        "What are the potential legal and financial consequences?"
      ],
      needPayoff: [
        "How valuable would it be to have a comprehensive prevention program?",
        "What would peace of mind regarding workplace safety be worth?",
        "How would improved safety culture benefit your organization?"
      ]
    };
  }
}

serve(handler);