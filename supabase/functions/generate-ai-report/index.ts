import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to get OpenAI API key from integrations
async function getOpenAIApiKey() {
  console.log('🔍 Checking Integration Hub for OpenAI API key...');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // First get the OpenAI provider
    const { data: provider, error: providerError } = await supabase
      .from('integration_providers')
      .select('id')
      .eq('name', 'openai')
      .single();

    if (providerError || !provider) {
      console.log('📝 OpenAI provider not found in Integration Hub');
      return null;
    }

    // Then get the active integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('credentials')
      .eq('provider_id', provider.id)
      .eq('status', 'active')
      .single();

    if (integrationError || !integration?.credentials?.api_key) {
      console.log('📝 No active OpenAI integration found');
      return null;
    }

    console.log('✅ Found OpenAI API key in Integration Hub');
    return integration.credentials.api_key;
  } catch (error) {
    console.error('❌ Error checking Integration Hub:', error);
    return null;
  }
}

// Helper function to generate session ID
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Helper function to detect if user wants to create a report
function isReportRequest(prompt) {
  const reportKeywords = [
    'create a report', 'generate a report', 'build a report', 'new report',
    'custom report', 'detailed report', 'comprehensive report', 'full report'
  ];
  return reportKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
}

// Helper function to get conversation context
async function getConversationContext(supabase, sessionId, userId) {
  const { data: conversation } = await supabase
    .from('report_conversations')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .order('conversation_step', { ascending: true });
    
  return conversation || [];
}

// Helper function to save conversation step
async function saveConversationStep(supabase, sessionId, userId, reportId, step, question, answer, contextData) {
  const { data, error } = await supabase
    .from('report_conversations')
    .insert({
      session_id: sessionId,
      user_id: userId,
      report_id: reportId,
      conversation_step: step,
      question: question,
      answer: answer,
      context_data: contextData
    });
    
  if (error) {
    console.error('Error saving conversation step:', error);
  }
  return data;
}

// Helper function to create admin notification
async function notifyAdmins(supabase, reportId, title, message) {
  // Get all super admin users
  const { data: admins } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'super_admin');
    
  if (admins && admins.length > 0) {
    for (const admin of admins) {
      await supabase
        .from('report_notifications')
        .insert({
          report_id: reportId,
          notification_type: 'new_report',
          recipient_id: admin.user_id,
          title: title,
          message: message
        });
    }
  }
}

// Report building questions flow
const REPORT_QUESTIONS = [
  {
    step: 1,
    question: "What type of report would you like to create? (e.g., Employee Analytics, Payroll Summary, Benefits Analysis, Custom)",
    type: "text"
  },
  {
    step: 2,
    question: "What is the main purpose or goal of this report?",
    type: "text"
  },
  {
    step: 3,
    question: "Which data sources should be included? (e.g., Employee data, Payroll data, Time tracking, Benefits)",
    type: "text"
  },
  {
    step: 4,
    question: "What time period should this report cover? (e.g., Last 30 days, Last quarter, Year to date)",
    type: "text"
  },
  {
    step: 5,
    question: "Who is the intended audience for this report? (e.g., Executives, HR team, Department managers)",
    type: "text"
  },
  {
    step: 6,
    question: "Are there any specific metrics or KPIs you want highlighted?",
    type: "text"
  }
];

serve(async (req) => {
  console.log('🚀 Report IQ request received');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, sessionId: providedSessionId, conversationStep, background = false } = await req.json();
    
    if (!prompt?.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: 'No prompt provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('🔍 Processing prompt:', prompt, 'Background:', background);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user ID and email from JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Decode JWT to get user info
    const token = authHeader.replace('Bearer ', '');
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    const userId = payload.sub;
    const userEmail = payload.email;

    console.log('👤 User ID:', userId, 'Email:', userEmail);

    // If background processing is requested, create job and return immediately
    if (background) {
      console.log('🔄 Creating background job...');
      
      const { data: job, error: jobError } = await supabase
        .from('ai_report_jobs')
        .insert({
          user_id: userId,
          user_email: userEmail,
          prompt: prompt.trim(),
          status: 'pending',
          session_id: providedSessionId,
          conversation_data: conversationStep ? { step: conversationStep } : {}
        })
        .select()
        .single();

      if (jobError) {
        console.error('❌ Error creating job:', jobError);
        throw new Error('Failed to create background job');
      }

      console.log('✅ Background job created:', job.id);

      // Start background processing without waiting
      EdgeRuntime.waitUntil(processReportInBackground(job.id, supabase));

      return new Response(JSON.stringify({
        success: true,
        jobId: job.id,
        message: 'Your report is being generated in the background. You will receive a notification when it\'s ready!'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Continue with existing synchronous processing for non-background requests
    // ... rest of existing logic remains the same ...

    // Get API key
    let openAIApiKey = await getOpenAIApiKey();
    if (!openAIApiKey) {
      openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    }
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API key not found. Please configure OpenAI in the Integration Hub or add OPENAI_API_KEY to environment secrets.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Determine session ID
    const sessionId = providedSessionId || generateSessionId();

    // Check if this is a report creation request
    if (isReportRequest(prompt) || conversationStep) {
      console.log('📊 Initiating report creation flow...');
      
      // Get existing conversation context
      const conversation = await getConversationContext(supabase, sessionId, userId);
      const currentStep = conversationStep || (conversation.length > 0 ? conversation.length + 1 : 1);
      
      // If this is the first step, save the initial request
      if (currentStep === 1 && !conversationStep) {
        await saveConversationStep(supabase, sessionId, userId, null, 0, 'Initial request', prompt, {});
      }
      
      // Save the current answer if we're in a conversation
      if (conversationStep && conversationStep > 1) {
        const previousQuestion = REPORT_QUESTIONS.find(q => q.step === conversationStep - 1);
        if (previousQuestion) {
          await saveConversationStep(supabase, sessionId, userId, null, conversationStep - 1, previousQuestion.question, prompt, {});
        }
      }
      
      // Check if we have all answers
      if (currentStep <= REPORT_QUESTIONS.length) {
        const currentQuestion = REPORT_QUESTIONS.find(q => q.step === currentStep);
        
        return new Response(JSON.stringify({
          success: true,
          isQuestion: true,
          question: currentQuestion.question,
          step: currentStep,
          totalSteps: REPORT_QUESTIONS.length,
          sessionId: sessionId,
          message: `Question ${currentStep} of ${REPORT_QUESTIONS.length}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // All questions answered, generate the report
        console.log('📝 Generating comprehensive report...');
        
        const fullConversation = await getConversationContext(supabase, sessionId, userId);
        
        // Build context from all answers
        let reportContext = 'REPORT REQUIREMENTS:\n';
        fullConversation.forEach(step => {
          if (step.question && step.answer) {
            reportContext += `${step.question}\nAnswer: ${step.answer}\n\n`;
          }
        });
        
        // Generate the full report
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: `You are Report IQ, an expert business analyst. Generate a comprehensive, professional business report based on the user's requirements. 
                Include:
                - Executive Summary
                - Report Objectives  
                - Key Findings & Metrics
                - Detailed Analysis
                - Data Insights
                - Recommendations
                - Conclusion
                
                Format in clean markdown with proper sections and professional language.` 
              },
              { role: 'user', content: reportContext }
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const aiData = await response.json();
        const reportContent = aiData.choices[0].message.content;
        
        return new Response(JSON.stringify({
          success: true,
          report: reportContent,
          message: "✅ Your comprehensive report has been generated!",
          isComplete: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle simple conversational questions (existing logic)
    const promptLower = prompt.toLowerCase();
    let contextData = '';

    try {
      // Simple employee query
      if (promptLower.includes('employee') || promptLower.includes('staff') || 
          promptLower.includes('team') || promptLower.includes('headcount')) {
        const { data: employees } = await supabase
          .from('employees')
          .select('id, first_name, last_name, status, department')
          .limit(100);
          
        if (employees) {
          const activeCount = employees.filter(e => e.status === 'active').length;
          contextData += `Employee Data: ${activeCount} active employees out of ${employees.length} total. `;
        }
      }

      // Simple payroll query
      if (promptLower.includes('payroll') || promptLower.includes('pay')) {
        const { data: payStubs } = await supabase
          .from('pay_stubs')
          .select('id, gross_pay, net_pay, pay_date')
          .limit(50);
          
        if (payStubs) {
          const totalGross = payStubs.reduce((sum, stub) => sum + (parseFloat(stub.gross_pay) || 0), 0);
          contextData += `Payroll Data: ${payStubs.length} pay stubs, total gross pay: $${totalGross.toFixed(2)}. `;
        }
      }
    } catch (error) {
      console.error('Data query error:', error);
      contextData = 'Unable to retrieve specific data from database. ';
    }

    // Determine response style
    const isSimpleQuestion = promptLower.includes('how many') || 
                            promptLower.includes('what is') || 
                            promptLower.includes('do we have') ||
                            promptLower.includes('show me') ||
                            promptLower.length < 50;

    const systemPrompt = isSimpleQuestion 
      ? `You are Report IQ, a conversational AI assistant. Respond naturally and conversationally to questions about business data. 
         Keep responses brief, friendly, and direct. Use "you" when addressing the user.
         Example: "You currently have 25 active employees" instead of formal report language.
         If you don't have specific data, acknowledge it conversationally.
         
         If someone asks about creating a report, let them know they can say "create a report" to start the guided report builder.`
      : `You are Report IQ, an AI assistant for business analytics. Provide helpful information and analysis.
         If someone wants to create a comprehensive report, suggest they say "create a report" to use the guided report builder.`;

    const enhancedPrompt = `${prompt}

Available Context: ${contextData}

Please provide a helpful response based on this request.`;

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
        temperature: 0.7,
        max_tokens: isSimpleQuestion ? 150 : 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({
      success: true,
      report: generatedResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error in generate-ai-report function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Background processing function
async function processReportInBackground(jobId: string, supabase: any) {
  console.log('🔄 Starting background processing for job:', jobId);
  
  try {
    // Update job status to processing
    await supabase
      .from('ai_report_jobs')
      .update({ status: 'processing' })
      .eq('id', jobId);

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('ai_report_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error('Job not found');
    }

    console.log('📋 Processing job for user:', job.user_email);

    // Get API key
    let openAIApiKey = await getOpenAIApiKey();
    if (!openAIApiKey) {
      openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    }
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Generate report using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are Report IQ, an expert business analyst. Generate a comprehensive, professional business report based on the user's request. 
            Include:
            - Executive Summary
            - Key Findings & Metrics
            - Detailed Analysis
            - Data Insights
            - Recommendations
            - Conclusion
            
            Format in clean markdown with proper sections and professional language.` 
          },
          { role: 'user', content: job.prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const reportContent = aiData.choices[0].message.content;

    console.log('✅ Report generated successfully');

    // Update job with completed report
    await supabase
      .from('ai_report_jobs')
      .update({ 
        status: 'completed',
        report_content: reportContent
      })
      .eq('id', jobId);

    console.log('📧 Sending email notification...');

    // Send email notification
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-report-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: JSON.stringify({
        to: job.user_email,
        reportId: jobId,
        prompt: job.prompt
      }),
    });

    if (!emailResponse.ok) {
      console.error('❌ Failed to send email notification');
    } else {
      console.log('✅ Email notification sent successfully');
    }

  } catch (error) {
    console.error('❌ Background processing failed:', error);
    
    // Update job with error status
    await supabase
      .from('ai_report_jobs')
      .update({ 
        status: 'failed',
        error_message: error.message
      })
      .eq('id', jobId);
  }
}