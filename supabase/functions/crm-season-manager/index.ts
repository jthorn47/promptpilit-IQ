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

    const { action, companyId } = await req.json()

    console.log('CRM Season Manager:', { action, companyId })

    switch (action) {
      case 'process_season_end':
        await processSeasonEnd(supabaseClient, companyId)
        break
      
      case 'reset_scores':
        await resetScores(supabaseClient, companyId)
        break
      
      case 'archive_season':
        await archiveSeason(supabaseClient, companyId)
        break
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('CRM Season Manager error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function processSeasonEnd(supabase: any, companyId?: string) {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const seasonName = lastMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  console.log(`Processing season end for ${seasonName}`)

  // Get monthly leaderboard data
  let query = supabase
    .from('crm_leaderboard_scores')
    .select('*')
    .eq('time_period', 'month')
    .gte('period_start', lastMonth.toISOString().split('T')[0])
    .order('score_value', { ascending: false })

  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { data: monthlyScores } = await query

  if (!monthlyScores || monthlyScores.length === 0) {
    console.log('No monthly scores found to archive')
    return
  }

  // Group by score type and determine winners
  const groupedScores = monthlyScores.reduce((acc: any, score: any) => {
    if (!acc[score.score_type]) acc[score.score_type] = []
    acc[score.score_type].push(score)
    return acc
  }, {})

  // Create season winners
  const seasonWinners = []

  for (const [category, scores] of Object.entries(groupedScores)) {
    const sortedScores = (scores as any[]).sort((a, b) => b.score_value - a.score_value)
    
    for (let i = 0; i < Math.min(3, sortedScores.length); i++) {
      const score = sortedScores[i]
      const rank = i + 1
      let medal = null
      
      if (rank === 1) medal = 'gold'
      else if (rank === 2) medal = 'silver'
      else if (rank === 3) medal = 'bronze'

      seasonWinners.push({
        season_name: seasonName,
        season_period: seasonName,
        user_id: score.user_id,
        company_id: score.company_id,
        category,
        score_value: score.score_value,
        rank,
        medal
      })
    }
  }

  // Insert season winners
  if (seasonWinners.length > 0) {
    const { error } = await supabase
      .from('crm_season_winners')
      .insert(seasonWinners)

    if (error) {
      console.error('Error inserting season winners:', error)
    } else {
      console.log(`Archived ${seasonWinners.length} season winners`)
    }
  }

  // Reset monthly scores
  await resetMonthlyScores(supabase, companyId)
}

async function resetScores(supabase: any, companyId?: string) {
  console.log('Resetting all scores for company:', companyId)

  let query = supabase
    .from('crm_leaderboard_scores')
    .delete()

  if (companyId) {
    query = query.eq('company_id', companyId)
  } else {
    query = query.neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
  }

  const { error } = await query

  if (error) {
    console.error('Error resetting scores:', error)
    throw error
  }

  console.log('Successfully reset all scores')
}

async function resetMonthlyScores(supabase: any, companyId?: string) {
  console.log('Resetting monthly scores for company:', companyId)

  // Delete only monthly and weekly scores, keep all_time
  let query = supabase
    .from('crm_leaderboard_scores')
    .delete()
    .in('time_period', ['week', 'month'])

  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { error } = await query

  if (error) {
    console.error('Error resetting monthly scores:', error)
    throw error
  }

  console.log('Successfully reset monthly and weekly scores')
}

async function archiveSeason(supabase: any, companyId?: string) {
  // This could be used to manually archive a specific season
  // For now, it's handled by process_season_end
  console.log('Manual season archive not implemented yet')
}
