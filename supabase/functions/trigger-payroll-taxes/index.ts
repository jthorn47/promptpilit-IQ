
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayrollRunTrigger {
  payroll_run_id: string;
  company_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  is_preview?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const trigger: PayrollRunTrigger = await req.json();
    console.log(`Triggering payroll tax calculations for run ${trigger.payroll_run_id}`);

    // Get all employees for this company with their pay information
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select(`
        id,
        company_id,
        pay_frequency,
        state,
        employee_pay_rates (
          rate_amount,
          rate_type,
          effective_date
        )
      `)
      .eq('company_id', trigger.company_id)
      .eq('status', 'active');

    if (employeesError) {
      throw new Error(`Failed to fetch employees: ${employeesError.message}`);
    }

    if (!employees || employees.length === 0) {
      console.log(`No active employees found for company ${trigger.company_id}`);
      return new Response(JSON.stringify({
        success: true,
        message: 'No active employees to process',
        processed_count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // For this implementation, we'll use a simplified gross wages calculation
    // In production, this would integrate with time tracking and complex pay calculations
    const taxJobs = employees.map(employee => {
      const payRate = employee.employee_pay_rates?.[0];
      const hourlyRate = payRate?.rate_amount || 0;
      
      // Simplified calculation - in production this would be more complex
      const hoursPerPeriod = employee.pay_frequency === 'weekly' ? 40 :
                           employee.pay_frequency === 'biweekly' ? 80 :
                           employee.pay_frequency === 'semi-monthly' ? 86.67 : 173.33;
      
      const grossWages = hourlyRate * hoursPerPeriod;

      return {
        employee_id: employee.id,
        pay_period_start: trigger.pay_period_start,
        pay_period_end: trigger.pay_period_end,
        pay_date: trigger.pay_date,
        gross_wages: grossWages,
        pay_frequency: employee.pay_frequency || 'biweekly',
        employee_location: employee.state || 'CA',
        payroll_run_id: trigger.payroll_run_id,
        is_preview: trigger.is_preview || false
      };
    });

    console.log(`Created ${taxJobs.length} tax calculation jobs`);

    // Call the tax processing function
    const { data: processingResult, error: processingError } = await supabase.functions.invoke(
      'process-payroll-taxes',
      {
        body: { jobs: taxJobs }
      }
    );

    if (processingError) {
      throw new Error(`Tax processing failed: ${processingError.message}`);
    }

    // Update payroll run status
    if (!trigger.is_preview) {
      const { error: updateError } = await supabase
        .from('payroll_runs')
        .update({
          tax_calculations_completed: true,
          tax_calculations_completed_at: new Date().toISOString()
        })
        .eq('id', trigger.payroll_run_id);

      if (updateError) {
        console.error('Error updating payroll run status:', updateError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      payroll_run_id: trigger.payroll_run_id,
      processed_count: processingResult?.processed_count || 0,
      message: `Successfully triggered tax calculations for ${employees.length} employees`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Payroll tax trigger error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
