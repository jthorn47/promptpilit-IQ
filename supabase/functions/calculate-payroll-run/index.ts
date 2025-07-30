import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayrollCalculationRequest {
  payGroupId: string;
  payPeriodId: string;
  preview: boolean;
}

interface EmployeePayrollData {
  employee_id: string;
  employee_name: string;
  employee_email?: string;
  regular_hours: number;
  overtime_hours: number;
  regular_rate: number;
  overtime_rate: number;
  bonuses: number;
  deductions: number;
  gross_pay: number;
  taxes: number;
  net_pay: number;
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

    const request: PayrollCalculationRequest = await req.json();
    console.log('Calculating payroll for request:', request);

    // First validate payroll readiness for the company
    const { data: readinessCheck, error: readinessError } = await supabase
      .rpc('validate_payroll_readiness', { p_company_id: request.payGroupId });

    if (readinessError) {
      console.error('Error checking payroll readiness:', readinessError);
      throw new Error('Failed to validate payroll readiness');
    }

    if (!readinessCheck[0]?.is_ready) {
      const issues = readinessCheck[0]?.issues || [];
      console.error('Payroll not ready:', issues);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Payroll processing cannot proceed due to missing required data',
        issues: issues,
        details: {
          missing_job_titles: readinessCheck[0]?.missing_job_title_count || 0,
          missing_workers_comp: readinessCheck[0]?.missing_workers_comp_count || 0,
          missing_divisions: readinessCheck[0]?.missing_division_count || 0
        }
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Payroll readiness check passed');

    // Get payroll period details
    const { data: period, error: periodError } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('id', request.payPeriodId)
      .single();

    if (periodError || !period) {
      throw new Error('Payroll period not found');
    }

    // Get employees in pay group
    const { data: employees, error: employeesError } = await supabase
      .from('pay_group_employee_assignments')
      .select('*')
      .eq('pay_group_id', request.payGroupId)
      .eq('is_active', true);

    if (employeesError) {
      throw new Error('Failed to fetch employees');
    }

    const employeePayrollData: EmployeePayrollData[] = [];
    let totalGrossWages = 0;
    let totalDeductions = 0;
    let totalTaxes = 0;
    let totalNetPay = 0;
    let warnings: string[] = [];

    // Calculate payroll for each employee
    for (const employee of employees || []) {
      console.log(`Calculating payroll for employee: ${employee.employee_name}`);

      // Get timecard entries for this employee and pay period
      const { data: timecards, error: timecardsError } = await supabase
        .from('timecard_entries')
        .select('*')
        .eq('employee_id', employee.employee_id)
        .eq('pay_period_id', request.payPeriodId);

      if (timecardsError) {
        console.error('Error fetching timecards:', timecardsError);
        warnings.push(`Failed to fetch timecard data for ${employee.employee_name}`);
        continue;
      }

      // Calculate totals from timecard entries
      const totalRegularHours = timecards?.reduce((sum, tc) => sum + (tc.regular_hours || 0), 0) || 0;
      const totalOvertimeHours = timecards?.reduce((sum, tc) => sum + (tc.overtime_hours || 0), 0) || 0;

      // Mock rates - in real app, these would come from employee records
      const regularRate = 25.00; // $25/hour
      const overtimeRate = regularRate * 1.5; // Time and a half

      const regularPay = totalRegularHours * regularRate;
      const overtimePay = totalOvertimeHours * overtimeRate;
      const bonuses = 0; // Would be calculated from bonuses table
      const grossPay = regularPay + overtimePay + bonuses;

      // Calculate taxes (simplified - real app would use tax tables)
      const federalTaxRate = 0.12;
      const stateTaxRate = 0.05;
      const ficaRate = 0.062;
      const medicareRate = 0.0145;
      
      const taxes = grossPay * (federalTaxRate + stateTaxRate + ficaRate + medicareRate);
      const deductions = 0; // Would be calculated from deductions table
      const netPay = grossPay - taxes - deductions;

      // Add warnings for missing data
      if (totalRegularHours === 0 && totalOvertimeHours === 0) {
        warnings.push(`No timecard entries found for ${employee.employee_name}`);
      }

      const employeeData: EmployeePayrollData = {
        employee_id: employee.employee_id,
        employee_name: employee.employee_name,
        employee_email: employee.employee_email,
        regular_hours: totalRegularHours,
        overtime_hours: totalOvertimeHours,
        regular_rate: regularRate,
        overtime_rate: overtimeRate,
        bonuses,
        deductions,
        gross_pay: grossPay,
        taxes,
        net_pay: netPay
      };

      employeePayrollData.push(employeeData);

      // Add to totals
      totalGrossWages += grossPay;
      totalDeductions += deductions;
      totalTaxes += taxes;
      totalNetPay += netPay;
    }

    const result = {
      success: true,
      preview: request.preview,
      payroll_period: period,
      employee_count: employeePayrollData.length,
      employee_data: employeePayrollData,
      totals: {
        total_gross_wages: totalGrossWages,
        total_deductions: totalDeductions,
        total_taxes: totalTaxes,
        total_net_pay: totalNetPay
      },
      warnings,
      ach_batch_info: {
        estimated_file_size: `${Math.ceil(employeePayrollData.length * 0.1)}KB`,
        processing_date: period.check_date
      }
    };

    // If not preview, create actual payroll records
    if (!request.preview) {
      console.log('Creating payroll run records...');
      
      // Create payroll run record
      const { data: payrollRun, error: runError } = await supabase
        .from('payroll_runs')
        .insert({
          company_id: period.company_id,
          pay_period_start: period.start_date,
          pay_period_end: period.end_date,
          pay_date: period.check_date,
          total_employees: employeePayrollData.length,
          total_gross_pay: totalGrossWages,
          total_net_pay: totalNetPay,
          status: 'processed'
        })
        .select()
        .single();

      if (runError) {
        console.error('Error creating payroll run:', runError);
        throw new Error('Failed to create payroll run');
      }

      // Update payroll period status
      await supabase
        .from('payroll_periods')
        .update({ status: 'processed' })
        .eq('id', request.payPeriodId);

      result.payroll_run_id = payrollRun.id;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in calculate-payroll-run function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});