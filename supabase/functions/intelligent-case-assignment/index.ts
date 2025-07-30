import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsultantWorkload {
  consultant_id: string;
  active_cases: number;
  total_hours_this_month: number;
  capacity_percentage: number;
  skill_match_score: number;
  average_case_resolution_time: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { caseId, caseData } = await req.json();

    console.log('Processing intelligent case assignment for case:', caseId);

    const { type: caseType, priority, company_id, estimated_hours = 2 } = caseData;

    // Get retainer information to find assigned consultant
    const { data: retainer } = await supabaseClient
      .from('hroiq_client_retainers')
      .select('assigned_consultant_id, service_tier, priority_level')
      .eq('company_id', company_id)
      .single();

    // Get routing rules for this case type
    const { data: routingRules } = await supabaseClient
      .from('case_routing_rules')
      .select('*')
      .eq('company_id', company_id)
      .eq('case_type', caseType);

    // Get all available consultants
    const { data: consultants } = await supabaseClient
      .from('user_roles')
      .select(`
        user_id,
        users(email)
      `)
      .eq('role', 'hroiq_consultant');

    if (!consultants || consultants.length === 0) {
      throw new Error('No consultants available for assignment');
    }

    // Calculate workload for each consultant
    const consultantWorkloads: ConsultantWorkload[] = [];
    
    for (const consultant of consultants) {
      // Get active cases
      const { data: activeCases } = await supabaseClient
        .from('cases')
        .select('id, estimated_hours')
        .eq('assigned_consultant_id', consultant.user_id)
        .in('status', ['open', 'in_progress']);

      // Get time entries for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: timeEntries } = await supabaseClient
        .from('unified_time_entries')
        .select('hours_logged')
        .eq('logged_by', consultant.user_id)
        .gte('work_date', startOfMonth.toISOString().split('T')[0]);

      const totalHours = timeEntries?.reduce((sum, entry) => sum + entry.hours_logged, 0) || 0;
      const activeHours = activeCases?.reduce((sum, case_) => sum + (case_.estimated_hours || 0), 0) || 0;
      
      // Calculate capacity (assuming 40 hours/week, 160 hours/month max)
      const capacityPercentage = (totalHours + activeHours) / 160 * 100;
      
      // Skill match score (simplified - would be more complex in real implementation)
      let skillMatchScore = 70; // Base score
      
      // Priority consultants for high-value clients
      if (retainer?.assigned_consultant_id === consultant.user_id) {
        skillMatchScore += 30;
      }
      
      // Case type specialization (mock data)
      if (caseType === 'compliance' && consultant.user_id.endsWith('1')) {
        skillMatchScore += 20;
      } else if (caseType === 'policy' && consultant.user_id.endsWith('2')) {
        skillMatchScore += 20;
      }

      consultantWorkloads.push({
        consultant_id: consultant.user_id,
        active_cases: activeCases?.length || 0,
        total_hours_this_month: totalHours,
        capacity_percentage: capacityPercentage,
        skill_match_score: skillMatchScore,
        average_case_resolution_time: 3.5 // Mock data
      });
    }

    // Score and rank consultants
    const scoredConsultants = consultantWorkloads.map(workload => {
      let score = 0;
      
      // Skill match (40% weight)
      score += workload.skill_match_score * 0.4;
      
      // Capacity availability (30% weight) - higher score for lower capacity
      const capacityScore = Math.max(0, 100 - workload.capacity_percentage);
      score += capacityScore * 0.3;
      
      // Workload balance (20% weight) - prefer consultants with fewer active cases
      const workloadScore = Math.max(0, 100 - (workload.active_cases * 20));
      score += workloadScore * 0.2;
      
      // Performance (10% weight) - faster resolution is better
      const performanceScore = Math.max(0, 100 - (workload.average_case_resolution_time * 10));
      score += performanceScore * 0.1;

      return {
        ...workload,
        final_score: score
      };
    });

    // Sort by score and get the best match
    scoredConsultants.sort((a, b) => b.final_score - a.final_score);
    const bestMatch = scoredConsultants[0];

    if (!bestMatch) {
      throw new Error('Unable to determine best consultant assignment');
    }

    // Assign the case
    const { error: updateError } = await supabaseClient
      .from('cases')
      .update({
        assigned_consultant_id: bestMatch.consultant_id,
        retainer_id: retainer?.id,
        client_priority: priority,
        status: 'assigned'
      })
      .eq('id', caseId);

    if (updateError) {
      throw updateError;
    }

    // Get consultant details for response
    const assignedConsultant = consultants.find(c => c.user_id === bestMatch.consultant_id);

    const assignment = {
      case_id: caseId,
      consultant_id: bestMatch.consultant_id,
      consultant_email: assignedConsultant?.users?.email,
      consultant_name: assignedConsultant?.users?.email?.split('@')[0] || 'Unknown',
      confidence_score: Math.round(bestMatch.final_score),
      reasoning: `Assigned based on ${bestMatch.skill_match_score}% skill match, ${Math.round(100 - bestMatch.capacity_percentage)}% capacity available, and ${bestMatch.active_cases} active cases`,
      workload_factors: {
        current_capacity: bestMatch.capacity_percentage,
        active_cases: bestMatch.active_cases,
        hours_this_month: bestMatch.total_hours_this_month
      }
    };

    console.log('Case assigned successfully:', assignment);

    return new Response(
      JSON.stringify({ success: true, assignment }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in intelligent case assignment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});