import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { company_id, date_range } = await req.json();

    console.log('Generating service timeline for company:', company_id);

    // Fetch cases
    let casesQuery = supabaseClient
      .from('cases')
      .select('*')
      .eq('client_id', company_id)
      .order('created_at', { ascending: false });

    if (date_range) {
      casesQuery = casesQuery
        .gte('created_at', date_range.start)
        .lte('created_at', date_range.end);
    }

    const { data: cases, error: casesError } = await casesQuery;
    if (casesError) throw casesError;

    // Fetch service logs
    let serviceLogsQuery = supabaseClient
      .from('hroiq_service_logs')
      .select('*')
      .eq('company_id', company_id)
      .order('service_date', { ascending: false });

    if (date_range) {
      serviceLogsQuery = serviceLogsQuery
        .gte('service_date', date_range.start)
        .lte('service_date', date_range.end);
    }

    const { data: serviceLogs, error: serviceLogsError } = await serviceLogsQuery;
    if (serviceLogsError) throw serviceLogsError;

    // Fetch time entries
    let timeEntriesQuery = supabaseClient
      .from('unified_time_entries')
      .select('*')
      .eq('company_id', company_id)
      .order('work_date', { ascending: false });

    if (date_range) {
      timeEntriesQuery = timeEntriesQuery
        .gte('work_date', date_range.start)
        .lte('work_date', date_range.end);
    }

    const { data: timeEntries, error: timeEntriesError } = await timeEntriesQuery;
    if (timeEntriesError) throw timeEntriesError;

    // Merge and format timeline events
    const events: any[] = [];

    // Process cases
    cases?.forEach(case_ => {
      events.push({
        id: `case-${case_.id}`,
        type: 'case',
        date: case_.created_at,
        title: `Case Created: ${case_.title}`,
        description: case_.description || '',
        status: case_.status,
        case_id: case_.id,
        category: case_.type,
        hours: case_.actual_hours || 0,
        metadata: {
          priority: case_.priority,
          assigned_to: case_.assigned_to,
          retainer_id: case_.retainer_id
        }
      });

      if (case_.closed_at) {
        events.push({
          id: `case-closed-${case_.id}`,
          type: 'case',
          date: case_.closed_at,
          title: `Case Closed: ${case_.title}`,
          description: `Case resolved after ${case_.actual_hours || 0} hours`,
          status: 'closed',
          case_id: case_.id,
          category: case_.type,
          hours: case_.actual_hours || 0
        });
      }
    });

    // Process service logs
    serviceLogs?.forEach(log => {
      events.push({
        id: `service-${log.id}`,
        type: 'service_log',
        date: log.service_date,
        title: `${log.service_type}: ${log.service_category}`,
        description: log.description || '',
        hours: log.hours_logged || 0,
        consultant_name: log.consultant_name,
        service_log_id: log.id,
        billable: log.billable,
        category: log.service_category,
        case_id: log.case_id,
        metadata: {
          deliverables: log.deliverables,
          internal_notes: log.internal_notes
        }
      });
    });

    // Process time entries (non-case related)
    timeEntries?.forEach(entry => {
      if (!entry.case_id) { // Only include non-case time entries
        events.push({
          id: `time-${entry.id}`,
          type: 'time_entry',
          date: entry.work_date,
          title: `Time Entry: ${entry.time_type}`,
          description: entry.description || '',
          hours: entry.hours_logged || 0,
          time_entry_id: entry.id,
          billable: entry.billable,
          category: entry.time_type,
          metadata: {
            logged_by: entry.logged_by,
            retainer_id: entry.retainer_id
          }
        });
      }
    });

    // Sort by date (newest first)
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate summary statistics
    const totalHours = events.reduce((sum, event) => sum + (event.hours || 0), 0);
    const billableHours = events.filter(e => e.billable !== false).reduce((sum, event) => sum + (event.hours || 0), 0);
    const caseCount = events.filter(e => e.type === 'case' && !e.title.includes('Closed')).length;
    const serviceCount = events.filter(e => e.type === 'service_log').length;

    const response = {
      success: true,
      data: {
        events,
        summary: {
          total_events: events.length,
          total_hours: totalHours,
          billable_hours: billableHours,
          case_count: caseCount,
          service_count: serviceCount,
          period: date_range || 'all_time'
        }
      }
    };

    console.log('Service timeline generated successfully:', response.data.summary);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error generating service timeline:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});