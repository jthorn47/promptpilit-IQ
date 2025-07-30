import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

interface AdaptiveLearningRequest {
  employeeId: string;
  roleTitle: string;
  industry: string;
  orgSize: 'small' | 'medium' | 'large' | 'enterprise';
  hrRiskScore?: number;
  riskAreas?: string[];
  additionalContext?: string;
}

interface LearningProfile {
  priority_areas: string[];
  focus_topics: string[];
  recommended_modules: string[];
  scenario_types: string[];
  coaching_style: string;
  context_prompts: string[];
  role_specific_examples: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      employeeId,
      roleTitle,
      industry,
      orgSize,
      hrRiskScore,
      riskAreas = [],
      additionalContext = ''
    }: AdaptiveLearningRequest = await req.json();

    console.log(`Generating adaptive learning journey for ${roleTitle} in ${industry}`);

    // 1. Find matching role profile or use AI to generate one
    let learningProfile = await findMatchingProfile(roleTitle, industry, orgSize);
    
    if (!learningProfile && openAIApiKey) {
      learningProfile = await generateProfileWithAI(roleTitle, industry, orgSize, hrRiskScore, riskAreas);
    }

    if (!learningProfile) {
      // Fallback to default profile
      learningProfile = getDefaultProfile(roleTitle);
    }

    // 2. Adapt the profile based on HR risk assessment
    const adaptedProfile = adaptProfileForRisk(learningProfile, hrRiskScore, riskAreas);

    // 3. Generate personalized CoachGPT rules
    const coachGPTRules = generateCoachGPTRules(adaptedProfile, roleTitle, industry, orgSize);

    // 4. Create or update the adaptive learning journey
    const { data: journey, error: journeyError } = await supabase
      .from('adaptive_learning_journeys')
      .upsert({
        employee_id: employeeId,
        role_title: roleTitle,
        industry: industry,
        org_size_category: orgSize,
        hr_risk_score: hrRiskScore,
        risk_areas: riskAreas,
        suggested_modules: adaptedProfile.recommended_modules,
        priority_scenarios: adaptedProfile.scenario_types,
        coachgpt_personality: adaptedProfile.coaching_style,
        context_rules: coachGPTRules,
        adaptation_triggers: {
          risk_threshold: 70,
          performance_threshold: 0.6,
          adaptation_frequency: 'weekly'
        }
      })
      .select()
      .single();

    if (journeyError) {
      throw journeyError;
    }

    console.log(`Successfully created adaptive learning journey for employee ${employeeId}`);

    return new Response(JSON.stringify({
      success: true,
      journey,
      profile: adaptedProfile,
      coachgpt_rules: coachGPTRules
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in adaptive-learning-generator:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function findMatchingProfile(roleTitle: string, industry: string, orgSize: string): Promise<LearningProfile | null> {
  // Try exact match first
  let { data } = await supabase
    .from('role_learning_profiles')
    .select('*')
    .eq('role_title', roleTitle)
    .eq('industry', industry)
    .eq('org_size_category', orgSize)
    .eq('is_active', true)
    .limit(1);

  if (data && data.length > 0) {
    return data[0];
  }

  // Try role + industry match
  ({ data } = await supabase
    .from('role_learning_profiles')
    .select('*')
    .eq('role_title', roleTitle)
    .eq('industry', industry)
    .eq('is_active', true)
    .limit(1));

  if (data && data.length > 0) {
    return data[0];
  }

  // Try role match only
  ({ data } = await supabase
    .from('role_learning_profiles')
    .select('*')
    .eq('role_title', roleTitle)
    .eq('is_active', true)
    .limit(1));

  if (data && data.length > 0) {
    return data[0];
  }

  return null;
}

async function generateProfileWithAI(
  roleTitle: string, 
  industry: string, 
  orgSize: string,
  hrRiskScore?: number,
  riskAreas: string[] = []
): Promise<LearningProfile> {
  const prompt = `Generate a learning profile for a ${roleTitle} in the ${industry} industry at a ${orgSize} organization.
  ${hrRiskScore ? `HR Risk Score: ${hrRiskScore}/100` : ''}
  ${riskAreas.length > 0 ? `Identified Risk Areas: ${riskAreas.join(', ')}` : ''}

  Consider the specific pressures and priorities this role faces. Focus on practical, job-relevant training.

  Return a JSON object with:
  - priority_areas: Array of 3-5 key learning priorities
  - focus_topics: Array of specific topics they need to master
  - recommended_modules: Array of training module names
  - scenario_types: Array of scenario types for practice
  - coaching_style: 'supportive', 'direct', or 'analytical'
  - context_prompts: Array of coaching context instructions
  - role_specific_examples: Array of relevant scenario examples

  Be specific to the role and industry. Consider compliance, safety, leadership, and operational needs.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert in organizational learning and development. Generate role-specific learning profiles that are practical and job-relevant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    // Fallback if AI response isn't valid JSON
    return getDefaultProfile(roleTitle);
  }
}

function getDefaultProfile(roleTitle: string): LearningProfile {
  const lowerRole = roleTitle.toLowerCase();
  
  if (lowerRole.includes('hr') || lowerRole.includes('human resource')) {
    return {
      priority_areas: ['compliance', 'documentation', 'employee_relations'],
      focus_topics: ['employment_law', 'documentation', 'conflict_resolution'],
      recommended_modules: ['compliance_fundamentals', 'hr_documentation'],
      scenario_types: ['documentation', 'employee_inquiry'],
      coaching_style: 'supportive',
      context_prompts: ['Focus on compliance scenarios', 'Emphasize documentation'],
      role_specific_examples: ['FMLA request handling', 'Performance documentation']
    };
  }
  
  if (lowerRole.includes('safety') || lowerRole.includes('security')) {
    return {
      priority_areas: ['safety_compliance', 'incident_management', 'risk_assessment'],
      focus_topics: ['safety_protocols', 'incident_reporting', 'hazard_recognition'],
      recommended_modules: ['safety_fundamentals', 'incident_management'],
      scenario_types: ['incident_response', 'hazard_assessment'],
      coaching_style: 'direct',
      context_prompts: ['Focus on safety scenarios', 'Emphasize immediate response'],
      role_specific_examples: ['Workplace accident response', 'Safety training delivery']
    };
  }
  
  if (lowerRole.includes('manager') || lowerRole.includes('supervisor')) {
    return {
      priority_areas: ['leadership', 'performance_management', 'communication'],
      focus_topics: ['coaching', 'feedback', 'team_dynamics'],
      recommended_modules: ['supervisory_skills', 'performance_management'],
      scenario_types: ['coaching', 'performance_feedback'],
      coaching_style: 'analytical',
      context_prompts: ['Focus on leadership scenarios', 'Emphasize team management'],
      role_specific_examples: ['Coaching underperformer', 'Managing team conflict']
    };
  }
  
  // Default general profile
  return {
    priority_areas: ['communication', 'professionalism', 'compliance'],
    focus_topics: ['workplace_conduct', 'communication', 'basic_compliance'],
    recommended_modules: ['workplace_fundamentals', 'communication_skills'],
    scenario_types: ['communication', 'workplace_conduct'],
    coaching_style: 'supportive',
    context_prompts: ['Focus on workplace fundamentals'],
    role_specific_examples: ['Professional communication', 'Workplace etiquette']
  };
}

function adaptProfileForRisk(
  profile: LearningProfile, 
  hrRiskScore?: number, 
  riskAreas: string[] = []
): LearningProfile {
  const adapted = { ...profile };
  
  // High risk score - prioritize compliance and safety
  if (hrRiskScore && hrRiskScore > 70) {
    adapted.priority_areas = ['compliance', 'safety', ...adapted.priority_areas.filter(a => a !== 'compliance' && a !== 'safety')];
    adapted.coaching_style = 'direct';
  }
  
  // Add risk-specific topics
  if (riskAreas.includes('harassment')) {
    adapted.focus_topics = ['harassment_prevention', ...adapted.focus_topics];
    adapted.scenario_types = ['harassment_prevention', ...adapted.scenario_types];
  }
  
  if (riskAreas.includes('safety')) {
    adapted.focus_topics = ['workplace_safety', 'incident_reporting', ...adapted.focus_topics];
    adapted.scenario_types = ['safety_incident', ...adapted.scenario_types];
  }
  
  if (riskAreas.includes('documentation')) {
    adapted.focus_topics = ['documentation_standards', ...adapted.focus_topics];
    adapted.scenario_types = ['documentation', ...adapted.scenario_types];
  }
  
  return adapted;
}

function generateCoachGPTRules(
  profile: LearningProfile,
  roleTitle: string,
  industry: string,
  orgSize: string
) {
  return {
    personality: profile.coaching_style,
    context_settings: {
      role_focus: roleTitle,
      industry_context: industry,
      org_size: orgSize,
      priority_areas: profile.priority_areas
    },
    response_guidelines: [
      `Tailor responses for ${roleTitle} role`,
      `Consider ${industry} industry context`,
      `Use ${profile.coaching_style} coaching approach`,
      'Provide practical, job-relevant examples',
      'Reference role-specific scenarios when appropriate'
    ],
    example_scenarios: profile.role_specific_examples,
    escalation_triggers: [
      'Questions outside role competency',
      'Complex legal or safety issues',
      'Requests for specific policy interpretation'
    ]
  };
}