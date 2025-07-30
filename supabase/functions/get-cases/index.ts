import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaseFilters {
  status?: string;
  type?: string;
  priority?: string;
  assigned_to?: string;
  assigned_team?: string;
  search?: string;
  date_range?: {
    start: string;
    end: string;
  };
  limit?: number;
  offset?: number;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { filters = {} }: { filters?: CaseFilters } = await req.json().catch(() => ({ filters: {} }));

    // Start building the query
    let query = supabaseClient
      .from('cases')
      .select(`
        *,
        company_settings:related_company_id(company_name)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    if (filters.assigned_team) {
      query = query.eq('assigned_team', filters.assigned_team);
    }

    // Search functionality
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);
    }

    // Date range filter
    if (filters.date_range) {
      query = query
        .gte('created_at', filters.date_range.start)
        .lte('created_at', filters.date_range.end);
    }

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    const { data: cases, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching cases:', queryError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch cases' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get case statistics
    const { data: statsData, error: statsError } = await supabaseClient
      .from('cases')
      .select('status, priority, actual_hours');

    const statistics = {
      total: cases?.length || 0,
      open: 0,
      in_progress: 0,
      waiting: 0,
      closed: 0,
      high_priority: 0,
      medium_priority: 0,
      low_priority: 0,
      total_hours: 0,
    };

    if (!statsError && statsData) {
      statistics.total = statsData.length;
      statistics.open = statsData.filter(c => c.status === 'open').length;
      statistics.in_progress = statsData.filter(c => c.status === 'in_progress').length;
      statistics.waiting = statsData.filter(c => c.status === 'waiting').length;
      statistics.closed = statsData.filter(c => c.status === 'closed').length;
      statistics.high_priority = statsData.filter(c => c.priority === 'high').length;
      statistics.medium_priority = statsData.filter(c => c.priority === 'medium').length;
      statistics.low_priority = statsData.filter(c => c.priority === 'low').length;
      statistics.total_hours = statsData.reduce((sum, c) => sum + (c.actual_hours || 0), 0);
    }

    return new Response(
      JSON.stringify({
        cases: cases || [],
        statistics,
        count: cases?.length || 0,
        filters: filters,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-cases function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});