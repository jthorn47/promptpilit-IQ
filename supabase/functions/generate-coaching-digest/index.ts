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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Fetch user's CRM data
    const [dealsResult, activitiesResult, proposalsResult] = await Promise.all([
      supabase.from('deals').select('*').eq('assigned_to', user_id),
      supabase.from('activities').select('*').eq('assigned_to', user_id).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('proposal_tracking').select('*').eq('user_id', user_id).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const deals = dealsResult.data || [];
    const activities = activitiesResult.data || [];
    const proposals = proposalsResult.data || [];

    // Calculate pipeline metrics
    const activeDeals = deals.filter(d => d.status === 'open').length;
    const totalValue = deals.filter(d => d.status === 'open').reduce((sum, d) => sum + (d.value || 0), 0);
    const wonThisWeek = deals.filter(d => 
      d.status === 'won' && 
      new Date(d.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    // Prepare context for GPT
    const context = {
      deals: deals.map(d => ({
        title: d.title,
        status: d.status,
        value: d.value,
        created_at: d.created_at,
        updated_at: d.updated_at,
        last_contact: d.last_contact_date
      })),
      activities: activities.map(a => ({
        type: a.activity_type,
        status: a.status,
        created_at: a.created_at
      })),
      proposals: proposals.map(p => ({
        status: p.status,
        last_viewed: p.last_viewed_at,
        created_at: p.created_at
      })),
      metrics: {
        activeDeals,
        totalValue,
        wonThisWeek,
        responseRate: Math.round((activities.filter(a => a.activity_type === 'email_reply').length / Math.max(activities.filter(a => a.activity_type === 'email_sent').length, 1)) * 100)
      }
    };

    // Generate AI insights
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are an AI sales coach analyzing CRM data. Generate personalized insights in JSON format with these sections:
            - attention_needed: Array of deals that need follow-up (deal_name, days_since_contact, priority, reason)
            - patterns: Array of behavioral insights (insight, impact, confidence percentage)
            - suggested_actions: Array of specific recommendations (action, deal_name if applicable, priority, expected_outcome)
            
            Focus on actionable insights based on real data patterns. Be specific and practical.`
          },
          {
            role: 'user',
            content: `Analyze this user's sales data and provide coaching insights: ${JSON.stringify(context)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    const gptData = await gptResponse.json();
    const aiInsights = JSON.parse(gptData.choices[0].message.content);

    // Combine metrics with AI insights
    const digest = {
      user_id,
      pipeline_summary: context.metrics,
      attention_needed: aiInsights.attention_needed || [],
      patterns: aiInsights.patterns || [],
      suggested_actions: aiInsights.suggested_actions || [],
      generated_at: new Date().toISOString()
    };

    console.log('Generated coaching digest for user:', user_id);

    return new Response(JSON.stringify(digest), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-coaching-digest:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});