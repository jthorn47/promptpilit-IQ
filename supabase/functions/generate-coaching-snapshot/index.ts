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

    // Fetch user's recent performance data
    const [dealsResult, activitiesResult, proposalsResult, emailsResult] = await Promise.all([
      supabase.from('deals').select('*').eq('assigned_to', user_id).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('activities').select('*').eq('assigned_to', user_id).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('proposal_tracking').select('*').eq('user_id', user_id).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('email_logs').select('*').eq('user_id', user_id).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    const deals = dealsResult.data || [];
    const activities = activitiesResult.data || [];
    const proposals = proposalsResult.data || [];
    const emails = emailsResult.data || [];

    // Calculate key metrics
    const emailsSent = emails.filter(e => e.status === 'sent').length;
    const emailsOpened = emails.filter(e => e.opened_at).length;
    const emailsReplied = emails.filter(e => e.replied_at).length;
    const emailResponseRate = emailsSent > 0 ? Math.round((emailsReplied / emailsSent) * 100) : 0;
    const avgResponseTime = emails.filter(e => e.replied_at && e.sent_at)
      .map(e => new Date(e.replied_at).getTime() - new Date(e.sent_at).getTime())
      .reduce((avg, time, _, arr) => avg + time / arr.length, 0) / (1000 * 60 * 60); // hours

    const wonDeals = deals.filter(d => d.status === 'won').length;
    const lostDeals = deals.filter(d => d.status === 'lost').length;
    const winRate = (wonDeals + lostDeals) > 0 ? Math.round((wonDeals / (wonDeals + lostDeals)) * 100) : 0;
    
    const proposalsViewed = proposals.filter(p => p.last_viewed_at).length;
    const proposalViewRate = proposals.length > 0 ? Math.round((proposalsViewed / proposals.length) * 100) : 0;

    // Prepare context for GPT analysis
    const context = {
      metrics: {
        emailsSent,
        emailResponseRate,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        winRate,
        proposalViewRate,
        activeDeals: deals.filter(d => d.status === 'open').length,
        dealValue: deals.filter(d => d.status === 'open').reduce((sum, d) => sum + (d.value || 0), 0)
      },
      recentActivity: {
        dealsCreated: deals.length,
        activitiesLogged: activities.length,
        proposalsSent: proposals.length
      },
      timeframe: "last 30 days"
    };

    console.log('User metrics for coaching snapshot:', context);

    // Generate AI coaching snapshot
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
            content: `You are an AI sales coach providing personalized insights. Generate a coaching snapshot in JSON format with these exact fields:
            - top_strength: {title, description, metric, confidence (0-100)}
            - biggest_risk: {title, description, metric, urgency ("low"|"medium"|"high")}
            - ai_tip: {title, recommendation, impact, priority ("low"|"medium"|"high")}
            
            Be specific, actionable, and encouraging. Focus on data-driven insights. Keep titles punchy and descriptions concise.`
          },
          {
            role: 'user',
            content: `Analyze these sales performance metrics and provide coaching insights: ${JSON.stringify(context)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
    });

    const gptData = await gptResponse.json();
    
    if (!gptData.choices?.[0]?.message?.content) {
      throw new Error('Invalid GPT response');
    }

    const aiInsights = JSON.parse(gptData.choices[0].message.content);

    // Combine with timestamp
    const snapshot = {
      ...aiInsights,
      generated_at: new Date().toISOString()
    };

    console.log('Generated coaching snapshot for user:', user_id);

    return new Response(JSON.stringify(snapshot), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-coaching-snapshot:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});