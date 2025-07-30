import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface TriggerDetectionRequest {
  employeeId: string;
  triggerType: 'quiz_failure' | 'scenario_failure' | 'long_pause' | 'missed_refresh';
  context: {
    trainingModuleId?: string;
    sceneId?: string;
    assignmentId?: string;
    sessionId?: string;
    currentProgress?: number;
    detectedTopics?: string[];
    failureCount?: number;
    pauseDuration?: number;
    performanceData?: any;
  };
  learnerProfile?: {
    roleTitle: string;
    industry: string;
    skillLevel: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      employeeId,
      triggerType,
      context,
      learnerProfile
    }: TriggerDetectionRequest = await req.json();

    console.log(`Processing micro-learning trigger: ${triggerType} for employee ${employeeId}`);

    // 1. Record the trigger event
    const { data: triggerEvent, error: triggerError } = await supabase
      .from('learning_trigger_events')
      .insert({
        employee_id: employeeId,
        training_module_id: context.trainingModuleId,
        scene_id: context.sceneId,
        assignment_id: context.assignmentId,
        trigger_type: triggerType,
        trigger_context: context,
        detected_topics: context.detectedTopics || [],
        session_id: context.sessionId,
        current_progress: context.currentProgress || 0,
        performance_before: context.performanceData || {}
      })
      .select()
      .single();

    if (triggerError) {
      throw triggerError;
    }

    // 2. Find relevant micro-content based on trigger type and context
    const microContent = await findRelevantMicroContent(
      triggerType,
      context.detectedTopics || [],
      learnerProfile
    );

    if (microContent.length === 0) {
      console.log('No relevant micro-content found for trigger');
      return new Response(JSON.stringify({
        success: true,
        triggerEventId: triggerEvent.id,
        interventions: [],
        message: 'Trigger recorded but no relevant content available'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Rank and select the best content (top 3)
    const selectedContent = await rankAndSelectContent(microContent, context, triggerType);

    // 4. Create interventions for selected content
    const interventions = [];
    for (const content of selectedContent) {
      const { data: intervention, error: interventionError } = await supabase
        .from('micro_learning_interventions')
        .insert({
          trigger_event_id: triggerEvent.id,
          micro_content_id: content.id,
          delivery_method: determineDeliveryMethod(triggerType, content.content_type)
        })
        .select(`
          *,
          micro_content_library:micro_content_id (*)
        `)
        .single();

      if (!interventionError) {
        interventions.push(intervention);
      }
    }

    // 5. Update trigger event with served content
    await supabase
      .from('learning_trigger_events')
      .update({
        micro_content_served: selectedContent.map(c => c.id)
      })
      .eq('id', triggerEvent.id);

    console.log(`Created ${interventions.length} micro-learning interventions`);

    return new Response(JSON.stringify({
      success: true,
      triggerEventId: triggerEvent.id,
      interventions: interventions,
      recommendationText: generateRecommendationText(triggerType, selectedContent, context)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in micro-learning-trigger-processor:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function findRelevantMicroContent(
  triggerType: string,
  detectedTopics: string[],
  learnerProfile?: any
): Promise<any[]> {
  let query = supabase
    .from('micro_content_library')
    .select('*')
    .eq('is_active', true)
    .contains('trigger_contexts', [triggerType]);

  // Filter by topics if available
  if (detectedTopics.length > 0) {
    query = query.overlaps('topic_tags', detectedTopics);
  }

  // Filter by role if available
  if (learnerProfile?.roleTitle) {
    query = query.or(`target_roles.cs.{${learnerProfile.roleTitle}},target_roles.cs.{}`);
  }

  const { data, error } = await query.order('effectiveness_score', { ascending: false });
  
  if (error) {
    console.error('Error finding micro-content:', error);
    return [];
  }

  return data || [];
}

async function rankAndSelectContent(
  content: any[],
  context: any,
  triggerType: string
): Promise<any[]> {
  // Score content based on relevance
  const scoredContent = content.map(item => ({
    ...item,
    relevanceScore: calculateRelevanceScore(item, context, triggerType)
  }));

  // Sort by relevance score and select top 3
  scoredContent.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return scoredContent.slice(0, 3);
}

function calculateRelevanceScore(content: any, context: any, triggerType: string): number {
  let score = content.effectiveness_score || 0;

  // Boost score for exact topic matches
  if (context.detectedTopics) {
    const topicMatches = content.topic_tags.filter((tag: string) => 
      context.detectedTopics.includes(tag)
    ).length;
    score += topicMatches * 20;
  }

  // Boost score for trigger context match
  if (content.trigger_contexts.includes(triggerType)) {
    score += 30;
  }

  // Prefer shorter content for immediate interventions
  if (triggerType === 'long_pause' && content.estimated_duration_seconds <= 60) {
    score += 15;
  }

  // Prefer comprehensive content for repeated failures
  if (triggerType === 'quiz_failure' && context.failureCount >= 2) {
    score += 10;
  }

  return score;
}

function determineDeliveryMethod(triggerType: string, contentType: string): string {
  // Quick interventions use modal
  if (triggerType === 'long_pause' || triggerType === 'quiz_failure') {
    return 'modal';
  }

  // Scenario failures get inline content
  if (triggerType === 'scenario_failure') {
    return 'inline';
  }

  // Training refresh gets sidebar
  if (triggerType === 'missed_refresh') {
    return 'sidebar';
  }

  return 'modal';
}

function generateRecommendationText(
  triggerType: string,
  selectedContent: any[],
  context: any
): string {
  if (selectedContent.length === 0) {
    return "Keep going! You're making progress.";
  }

  const mainContent = selectedContent[0];
  const duration = Math.round(mainContent.estimated_duration_seconds / 60);

  switch (triggerType) {
    case 'quiz_failure':
      return `You're struggling with ${context.detectedTopics?.[0] || 'this topic'}. Here's a ${duration}-minute refresher that has helped other learners.`;
    
    case 'scenario_failure':
      return `Let's review the key concepts. Here's a quick ${duration}-minute guide used by others in similar situations.`;
    
    case 'long_pause':
      return `Taking a moment to think? Here's a ${duration}-minute refresher to help you stay on track.`;
    
    case 'missed_refresh':
      return `Time for a quick refresher! Here's essential content to help you stay current.`;
    
    default:
      return `Here's some helpful content to support your learning journey.`;
  }
}