import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayrollPeriodCalculationRequest {
  payroll_period_id: string;
  force_recalculate?: boolean;
}

interface PayrollCalculationResult {
  employee_id: string;
  instructor_name: string;
  regular_hours: number;
  overtime_hours: number;
  regular_rate: number;
  overtime_rate: number;
  gross_pay: number;
  federal_withholding: number;
  state_withholding: number;
  fica_withholding: number;
  medicare_withholding: number;
  total_withholdings: number;
  net_pay: number;
  calculation_details: {
    period_id: string;
    calculated_at: string;
    engine_used: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { payroll_period_id, force_recalculate = false }: PayrollPeriodCalculationRequest = await req.json();

    console.log(`Starting payroll calculation for period: ${payroll_period_id}`);

    // Get the payroll period details
    const { data: period, error: periodError } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('id', payroll_period_id)
      .single();

    if (periodError || !period) {
      throw new Error(`Payroll period not found: ${periodError?.message}`);
    }

    console.log(`Processing period: ${period.period_name} (${period.start_date} to ${period.end_date})`);

    // Get all employees in this payroll period
    const { data: employees, error: employeesError } = await supabase
      .from('payroll_employees')
      .select(`
        id,
        instructor_name,
        hourly_rate,
        employment_type,
        tax_withholding_info,
        company_id
      `)
      .eq('payroll_period_id', payroll_period_id)
      .eq('is_active', true);

    if (employeesError) {
      throw new Error(`Failed to fetch employees: ${employeesError.message}`);
    }

    if (!employees || employees.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No active employees found for this period',
        calculations: [],
        summary: {
          total_employees: 0,
          total_gross_pay: 0,
          total_net_pay: 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`Found ${employees.length} employees to process`);

    const calculations: PayrollCalculationResult[] = [];
    let totalGrossPay = 0;
    let totalNetPay = 0;

    // Process each employee
    for (const employee of employees) {
      try {
        console.log(`Processing employee: ${employee.instructor_name}`);

        // Get time entries for this employee in this period
        const { data: timeEntries, error: timeError } = await supabase
          .from('payroll_time_entries')
          .select('*')
          .eq('payroll_employee_id', employee.id)
          .gte('date', period.start_date)
          .lte('date', period.end_date);

        if (timeError) {
          console.error(`Error fetching time entries for ${employee.instructor_name}:`, timeError);
          continue;
        }

        // Calculate total hours
        const totalHours = (timeEntries || []).reduce((sum, entry) => sum + (entry.hours_worked || 0), 0);
        const regularHours = Math.min(totalHours, 40); // California overtime after 40 hours
        const overtimeHours = Math.max(0, totalHours - 40);

        const hourlyRate = employee.hourly_rate || 25.00; // Default F45 instructor rate
        const overtimeRate = hourlyRate * 1.5; // California overtime rate

        const regularPay = regularHours * hourlyRate;
        const overtimePay = overtimeHours * overtimeRate;
        const grossPay = regularPay + overtimePay;

        // Calculate tax withholdings using the tax calculation service
        let taxWithholdings = {
          federal_income_tax: 0,
          state_income_tax: 0,
          social_security_employee: 0,
          medicare_employee: 0,
          medicare_additional: 0,
          state_disability_insurance: 0,
          total_withholdings: 0
        };

        try {
          const { data: taxCalc, error: taxError } = await supabase.functions.invoke('calculate-tax-withholdings', {
            body: {
              employeeId: employee.id,
              grossPay: grossPay,
              payPeriod: 'biweekly', // F45 standard
              ytdGrossPay: grossPay, // TODO: Calculate actual YTD
              ytdFederalWithheld: 0,
              ytdStateWithheld: 0,
              ytdSocialSecurity: 0,
              ytdMedicare: 0
            }
          });

          if (!taxError && taxCalc) {
            taxWithholdings = {
              federal_income_tax: taxCalc.federal_income_tax || 0,
              state_income_tax: taxCalc.state_income_tax || 0,
              social_security_employee: taxCalc.social_security_employee || 0,
              medicare_employee: taxCalc.medicare_employee || 0,
              medicare_additional: taxCalc.medicare_additional || 0,
              state_disability_insurance: taxCalc.state_disability_insurance || 0,
              total_withholdings: taxCalc.total_withholdings || 0
            };
          } else {
            console.warn(`Tax calculation failed for ${employee.instructor_name}, using fallback`);
            // Fallback calculation
            const totalTaxRate = 0.25; // 25% total tax estimate
            taxWithholdings.total_withholdings = grossPay * totalTaxRate;
          }
        } catch (error) {
          console.error(`Tax calculation error for ${employee.instructor_name}:`, error);
          // Use fallback
          const totalTaxRate = 0.25;
          taxWithholdings.total_withholdings = grossPay * totalTaxRate;
        }

        const netPay = grossPay - taxWithholdings.total_withholdings;

        const calculation: PayrollCalculationResult = {
          employee_id: employee.id,
          instructor_name: employee.instructor_name,
          regular_hours: regularHours,
          overtime_hours: overtimeHours,
          regular_rate: hourlyRate,
          overtime_rate: overtimeRate,
          gross_pay: Math.round(grossPay * 100) / 100,
          federal_withholding: Math.round(taxWithholdings.federal_income_tax * 100) / 100,
          state_withholding: Math.round(taxWithholdings.state_income_tax * 100) / 100,
          fica_withholding: Math.round(taxWithholdings.social_security_employee * 100) / 100,
          medicare_withholding: Math.round(taxWithholdings.medicare_employee * 100) / 100,
          total_withholdings: Math.round(taxWithholdings.total_withholdings * 100) / 100,
          net_pay: Math.round(netPay * 100) / 100,
          calculation_details: {
            period_id: payroll_period_id,
            calculated_at: new Date().toISOString(),
            engine_used: 'EaseBase-PayrollEngine'
          }
        };

        // Store the calculation result
        const { error: saveError } = await supabase
          .from('payroll_calculations')
          .upsert({
            payroll_period_id: payroll_period_id,
            payroll_employee_id: employee.id,
            regular_hours: calculation.regular_hours,
            overtime_hours: calculation.overtime_hours,
            gross_pay: calculation.gross_pay,
            federal_withholding: calculation.federal_withholding,
            state_withholding: calculation.state_withholding,
            fica_withholding: calculation.fica_withholding,
            medicare_withholding: calculation.medicare_withholding,
            total_withholdings: calculation.total_withholdings,
            net_pay: calculation.net_pay,
            calculation_metadata: calculation.calculation_details,
            calculated_at: new Date().toISOString()
          }, {
            onConflict: 'payroll_period_id,payroll_employee_id'
          });

        if (saveError) {
          console.error(`Error saving calculation for ${employee.instructor_name}:`, saveError);
        }

        calculations.push(calculation);
        totalGrossPay += calculation.gross_pay;
        totalNetPay += calculation.net_pay;

        console.log(`✅ Calculated ${employee.instructor_name}: $${calculation.gross_pay} gross, $${calculation.net_pay} net`);

      } catch (error) {
        console.error(`Error processing employee ${employee.instructor_name}:`, error);
        continue;
      }
    }

    // Update the payroll period status
    await supabase
      .from('payroll_periods')
      .update({
        status: 'calculated',
        total_gross_pay: totalGrossPay,
        total_net_pay: totalNetPay,
        calculated_at: new Date().toISOString()
      })
      .eq('id', payroll_period_id);

    // Log the calculation completion
    await supabase
      .from('payroll_audit_trail')
      .insert({
        payroll_period_id: payroll_period_id,
        action_type: 'calculation_completed',
        details: `Calculated payroll for ${calculations.length} employees`,
        metadata: {
          total_employees: calculations.length,
          total_gross_pay: totalGrossPay,
          total_net_pay: totalNetPay,
          calculation_engine: 'EaseBase-PayrollEngine'
        },
        performed_by: 'system'
      });

    console.log(`✅ Payroll calculation completed for period ${payroll_period_id}`);
    console.log(`📊 Summary: ${calculations.length} employees, $${totalGrossPay.toFixed(2)} gross, $${totalNetPay.toFixed(2)} net`);

    return new Response(JSON.stringify({
      success: true,
      message: `Payroll calculated successfully for ${calculations.length} employees`,
      calculations,
      summary: {
        total_employees: calculations.length,
        total_gross_pay: Math.round(totalGrossPay * 100) / 100,
        total_net_pay: Math.round(totalNetPay * 100) / 100,
        calculated_at: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Payroll calculation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Payroll calculation failed',
      details: error.toString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});