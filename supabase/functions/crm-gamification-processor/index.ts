import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, userId, activityType, activityData, companyId } = await req.json()

    console.log('CRM Gamification Processor:', { action, userId, activityType })

    switch (action) {
      case 'process_activity':
        await processActivity(supabaseClient, { userId, activityType, activityData, companyId })
        break
      
      case 'recalculate_leaderboards':
        await recalculateLeaderboards(supabaseClient, companyId)
        break
      
      case 'check_achievements':
        await checkAchievements(supabaseClient, userId, companyId)
        break
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('CRM Gamification Processor error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function processActivity(
  supabase: any, 
  { userId, activityType, activityData, companyId }: any
) {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get scoring weights
  const { data: settings } = await supabase
    .from('crm_gamification_settings')
    .select('scoring_weights')
    .eq('company_id', companyId)
    .single()

  const weights = settings?.scoring_weights || {
    spin_completion: 100,
    proposal_sent: 150,
    proposal_signed: 500,
    opportunity_created: 50,
    task_completed: 25,
    deal_closed: 1000,
    ai_usage: 10
  }

  // Calculate points based on activity
  let points = 1
  let scoreType = 'activity_score'

  switch (activityType) {
    case 'spin_completion':
      points = weights.spin_completion
      scoreType = 'spin_completion'
      break
    case 'proposal_sent':
      points = weights.proposal_sent
      scoreType = 'proposals_sent'
      break
    case 'proposal_signed':
      points = weights.proposal_signed
      scoreType = 'proposals_signed'
      break
    case 'opportunity_created':
      points = weights.opportunity_created
      scoreType = 'opportunities_created'
      break
    case 'task_completed':
      points = weights.task_completed
      scoreType = 'tasks_completed'
      break
    case 'deal_closed':
      points = activityData?.value || weights.deal_closed
      scoreType = 'pipeline_value'
      break
    case 'ai_usage':
      points = weights.ai_usage
      break
  }

  // Update scores for different time periods
  const periods = [
    { period: 'week', start: weekStart },
    { period: 'month', start: monthStart },
    { period: 'all_time', start: new Date('2020-01-01') }
  ]

  for (const { period, start } of periods) {
    // Update specific score type
    if (scoreType !== 'activity_score') {
      await supabase
        .from('crm_leaderboard_scores')
        .upsert({
          user_id: userId,
          company_id: companyId,
          score_type: scoreType,
          time_period: period,
          period_start: start.toISOString().split('T')[0],
          period_end: period === 'all_time' ? null : now.toISOString().split('T')[0],
          score_value: points,
          metadata: activityData || {}
        })
    }

    // Update activity score (weighted total)
    await supabase
      .from('crm_leaderboard_scores')
      .upsert({
        user_id: userId,
        company_id: companyId,
        score_type: 'activity_score',
        time_period: period,
        period_start: start.toISOString().split('T')[0],
        period_end: period === 'all_time' ? null : now.toISOString().split('T')[0],
        score_value: points,
        metadata: { activity_type: activityType, weight: points }
      })
  }

  console.log(`Processed ${activityType} for user ${userId}: +${points} points`)
}

async function recalculateLeaderboards(supabase: any, companyId?: string) {
  console.log('Recalculating leaderboards for company:', companyId)
  
  // This would typically aggregate from crm_activity_log
  // For now, we'll just ensure existing data is properly ranked
  
  const { data: scores } = await supabase
    .from('crm_leaderboard_scores')
    .select('*')
    .eq('company_id', companyId || null)
    .order('score_value', { ascending: false })

  console.log(`Recalculated ${scores?.length || 0} leaderboard entries`)
}

async function checkAchievements(supabase: any, userId: string, companyId?: string) {
  console.log('Checking achievements for user:', userId)

  // Get user's current achievements
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  const earnedIds = userAchievements?.map((ua: any) => ua.achievement_id) || []

  // Get all CRM achievements
  const { data: achievements } = await supabase
    .from('achievement_definitions')
    .select('*')
    .eq('achievement_type', 'milestone')
    .eq('is_active', true)

  if (!achievements) return

  // Check each achievement criteria
  for (const achievement of achievements) {
    if (earnedIds.includes(achievement.id)) continue

    const criteria = achievement.criteria
    let shouldAward = false

    try {
      switch (criteria.type) {
        case 'spin_completions':
          const { count: spinCount } = await supabase
            .from('crm_activity_log')
            .select('*', { count: 'exact', head: true })
            .eq('performed_by', userId)
            .eq('activity_type', 'spin_completed')
          
          shouldAward = (spinCount || 0) >= criteria.target
          break

        case 'weekly_tasks':
          const weekStart = new Date()
          weekStart.setDate(weekStart.getDate() - 7)
          
          const { count: taskCount } = await supabase
            .from('crm_activity_log')
            .select('*', { count: 'exact', head: true })
            .eq('performed_by', userId)
            .eq('activity_type', 'task_completed')
            .gte('created_at', weekStart.toISOString())
          
          shouldAward = (taskCount || 0) >= criteria.target
          break

        case 'pipeline_value':
          const { data: pipelineData } = await supabase
            .from('crm_leaderboard_scores')
            .select('score_value')
            .eq('user_id', userId)
            .eq('score_type', 'pipeline_value')
            .eq('time_period', 'all_time')
            .single()
          
          shouldAward = (pipelineData?.score_value || 0) >= criteria.target
          break
      }

      if (shouldAward) {
        // Award the achievement
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            progress: 100
          })

        // Update user points
        if (achievement.points) {
          await supabase
            .from('user_points')
            .upsert({
              user_id: userId,
              total_points: supabase.sql`COALESCE(total_points, 0) + ${achievement.points}`,
              achievements_count: supabase.sql`COALESCE(achievements_count, 0) + 1`
            })
        }

        console.log(`Awarded achievement "${achievement.name}" to user ${userId}`)
      }
    } catch (error) {
      console.error(`Error checking achievement ${achievement.name}:`, error)
    }
  }
}