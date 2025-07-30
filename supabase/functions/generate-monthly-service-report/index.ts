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

    const { companyId, reportMonth } = await req.json();

    console.log('Generating monthly service report for company:', companyId, 'month:', reportMonth);

    // Get the first day of the month
    const monthStart = new Date(reportMonth);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    // Get retainer information
    const { data: retainer, error: retainerError } = await supabaseClient
      .from('hroiq_client_retainers')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (retainerError) {
      console.error('Error fetching retainer:', retainerError);
      throw retainerError;
    }

    // Get unified time entries for the month
    const { data: timeEntries, error: timeError } = await supabaseClient
      .from('unified_time_entries')
      .select('*')
      .eq('company_id', companyId)
      .gte('work_date', monthStartStr)
      .lte('work_date', monthEndStr);

    if (timeError) {
      console.error('Error fetching time entries:', timeError);
      throw timeError;
    }

    // Get cases for the month
    const { data: cases, error: casesError } = await supabaseClient
      .from('cases')
      .select('*')
      .eq('related_company_id', companyId)
      .gte('created_at', monthStartStr)
      .lte('created_at', monthEndStr + 'T23:59:59.999Z');

    if (casesError) {
      console.error('Error fetching cases:', casesError);
      throw casesError;
    }

    // Calculate totals
    const totalHoursUsed = timeEntries?.reduce((sum, entry) => sum + (entry.hours_logged || 0), 0) || 0;
    const totalCasesOpened = cases?.length || 0;
    const totalCasesResolved = cases?.filter(c => c.status === 'closed').length || 0;

    // Calculate overage
    const monthlyLimit = retainer?.retainer_hours || 0;
    const overageHours = Math.max(0, totalHoursUsed - monthlyLimit);
    const overageRate = retainer?.overage_rate || 0;
    const overageAmount = overageHours * overageRate;

    // Build case breakdown
    const caseBreakdown = cases?.map(case_ => ({
      id: case_.id,
      title: case_.title,
      type: case_.type,
      status: case_.status,
      hours: timeEntries?.filter(t => t.case_id === case_.id).reduce((sum, t) => sum + t.hours_logged, 0) || 0,
      created_at: case_.created_at,
      closed_at: case_.closed_at
    })) || [];

    // Build deliverables (from time entries that aren't case-related)
    const deliverables = timeEntries?.filter(entry => !entry.case_id).map(entry => ({
      type: entry.time_type,
      description: entry.description,
      hours: entry.hours_logged,
      date: entry.work_date
    })) || [];

    // Service summary
    const serviceSummary = {
      total_hours: totalHoursUsed,
      case_hours: timeEntries?.filter(t => t.case_id).reduce((sum, t) => sum + t.hours_logged, 0) || 0,
      service_hours: timeEntries?.filter(t => !t.case_id).reduce((sum, t) => sum + t.hours_logged, 0) || 0,
      billable_hours: timeEntries?.filter(t => t.billable).reduce((sum, t) => sum + t.hours_logged, 0) || 0,
      retainer_utilization: monthlyLimit > 0 ? (totalHoursUsed / monthlyLimit * 100) : 0
    };

    // Create or update the monthly service report
    const reportData = {
      company_id: companyId,
      retainer_id: retainer.id,
      report_month: monthStartStr,
      total_hours_used: totalHoursUsed,
      total_cases_resolved: totalCasesResolved,
      total_cases_opened: totalCasesOpened,
      overage_hours: overageHours,
      overage_amount: overageAmount,
      service_summary: serviceSummary,
      case_breakdown: caseBreakdown,
      deliverables_completed: deliverables,
      risk_score_changes: {},
      generated_by: (await supabaseClient.auth.getUser()).data.user?.id,
      status: 'draft'
    };

    // Check if report already exists
    const { data: existingReport } = await supabaseClient
      .from('monthly_service_reports')
      .select('id')
      .eq('company_id', companyId)
      .eq('report_month', monthStartStr)
      .single();

    let report;
    if (existingReport) {
      // Update existing report
      const { data, error } = await supabaseClient
        .from('monthly_service_reports')
        .update(reportData)
        .eq('id', existingReport.id)
        .select()
        .single();

      if (error) throw error;
      report = data;
    } else {
      // Create new report
      const { data, error } = await supabaseClient
        .from('monthly_service_reports')
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;
      report = data;
    }

    console.log('Monthly service report generated successfully:', report.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        report,
        summary: {
          totalHours: totalHoursUsed,
          casesOpened: totalCasesOpened,
          casesResolved: totalCasesResolved,
          overageHours,
          overageAmount
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error generating monthly service report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});