import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlueprintRequest {
  section: string;
  companyName: string;
  contactName: string;
  industry: string;
  companySize: string;
  riskLevel: string;
  riskScore: number;
  assessmentResponses: any;
  aiReport: any;
  companyEmail: string;
}

const sectionPrompts: Record<string, string> = {
  'current-state': `
    You are a SPIN selling expert conducting a SITUATION assessment for an HR Blueprint. 
    
    Generate a focused 1-2 paragraph SITUATION analysis (max 4-5 bullet points) that covers:
    - Current HR structure and key processes
    - Existing payroll and compliance approach
    - Primary administrative challenges
    
    Company: {companyName}, Contact: {contactName}, Industry: {industry}, Size: {companySize}
    
    Write in a consultative tone. Keep it concise and focused.
  `,
  
  'gaps-risks': `
    You are a SPIN selling expert identifying specific PROBLEMS for an HR Blueprint.
    
    Generate a focused 1-2 paragraph PROBLEM analysis (max 4-5 bullet points) that identifies:
    - Top 2-3 compliance gaps or vulnerabilities
    - Key operational inefficiencies
    - Critical resource allocation issues
    
    Company: {companyName}, Contact: {contactName}, Industry: {industry}, Size: {companySize}
    
    Present specific problems concisely. Focus on the most critical issues only.
  `,
  
  'impact-inaction': `
    You are a SPIN selling expert exploring IMPLICATIONS of problems.
    
    Generate a focused 1-2 paragraph IMPLICATION analysis (max 4-5 bullet points) that explores:
    - Key financial risks of current inefficiencies
    - Primary compliance and legal exposure
    - Impact on growth and competitive position
    
    Company: {companyName}, Contact: {contactName}, Industry: {industry}, Size: {companySize}
    
    Focus on the most significant consequences. Keep it compelling but concise.
  `,
  
  'path-forward': `
    You are a SPIN selling expert presenting NEED-PAYOFF benefits.
    
    Generate a focused 1-2 paragraph NEED-PAYOFF analysis (max 4-5 bullet points) that emphasizes:
    - Top 2-3 benefits of solving their problems
    - Key efficiency gains and time savings
    - Primary value proposition and ROI
    
    Company: {companyName}, Contact: {contactName}, Industry: {industry}, Size: {companySize}
    
    Position the main benefits concisely. Focus on highest-impact outcomes.
  `,
  
  'custom-solution': `
    You are a SPIN selling expert presenting a tailored SOLUTION.
    
    Generate a focused 2 paragraph SOLUTION description (max 5-6 bullet points) that details:
    - Key platform capabilities addressing their problems
    - Essential HR support services
    - Core compliance and automation features
    
    Company: {companyName}, Contact: {contactName}, Industry: {industry}, Size: {companySize}
    
    Present the solution components concisely. Focus on features that directly solve their main problems.
  `,
  
  'investment-analysis': `
    You are a SPIN selling expert providing INVESTMENT JUSTIFICATION.
    
    Generate a focused 1-2 paragraph INVESTMENT analysis (max 4-5 bullet points) that covers:
    - ROI estimate and payback timeframe
    - Cost vs. current hidden costs comparison
    - Risk mitigation value
    
    Company: {companyName}, Contact: {contactName}, Industry: {industry}, Size: {companySize}
    
    Make the financial case concisely. Focus on clear value and ROI.
  `,
  
  'chat-assistant': `
    You are an expert HR consultant and sales specialist helping a sales rep create compelling content for an HR Blueprint proposal.
    
    The sales rep is asking for your help with content creation. Provide professional, actionable, and sales-focused responses that can be directly used in client proposals.
    
    Context: This is for an HR Blueprint proposal for {companyName} (Contact: {contactName}).
    
    Be helpful, professional, and focus on creating content that will resonate with the client and help close the sale.
  `
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { 
      section, 
      prompt,
      companyName, 
      contactName, 
      industry = 'Professional Services', 
      companySize = 'Small Business',
      riskLevel,
      riskScore,
      assessmentResponses,
      aiReport,
      companyEmail
    }: BlueprintRequest & { prompt?: string } = await req.json();

    // Check if assessment exists for this company (skip for chat assistant mode)
    const hasValidAssessment = riskScore && riskScore > 0 && assessmentResponses && Object.keys(assessmentResponses).length > 0;
    
    if (!hasValidAssessment && section !== 'chat-assistant') {
      return new Response(JSON.stringify({ 
        error: 'HR Assessment Required',
        message: 'A completed HR risk assessment is required to generate accurate AI content. Please ensure the client has completed their assessment first.',
        requiresAssessment: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const promptTemplate = sectionPrompts[section];
    if (!promptTemplate) {
      throw new Error(`Invalid section: ${section}`);
    }

    // Prepare assessment context for AI
    const assessmentContext = `
Assessment Data Context:
- Risk Level: ${riskLevel || 'Not specified'}
- Risk Score: ${riskScore || 'Not available'}/100
- Company Email: ${companyEmail || 'Not provided'}
- Assessment Responses: ${assessmentResponses ? JSON.stringify(assessmentResponses).substring(0, 500) + '...' : 'Not available'}
- AI Report Summary: ${aiReport ? JSON.stringify(aiReport).substring(0, 300) + '...' : 'Not available'}

Use this assessment data to inform your SPIN analysis and make it specific to their actual situation.
`;

    // Replace placeholders in the prompt and add assessment context
    let finalPrompt;
    if (section === 'chat-assistant' && prompt) {
      // For chat assistant mode, use the provided prompt directly
      finalPrompt = prompt;
    } else {
      // For regular sections, use template and add assessment context
      finalPrompt = promptTemplate
        .replace(/{companyName}/g, companyName)
        .replace(/{contactName}/g, contactName)
        .replace(/{industry}/g, industry)
        .replace(/{companySize}/g, companySize) + '\n\n' + assessmentContext;
    }

    console.log(`Generating content for section: ${section}, company: ${companyName}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert HR consultant and SPIN selling specialist. Create professional, compelling, and actionable content for HR Blueprint proposals. Focus on business value and specific outcomes.' 
          },
          { role: 'user', content: finalPrompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log(`Successfully generated content for section: ${section}`);

    return new Response(JSON.stringify({ 
      section,
      content: generatedContent,
      companyName,
      contactName 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-hr-blueprint function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});