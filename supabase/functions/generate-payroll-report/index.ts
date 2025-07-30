import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  reportId: string;
  companyId: string;
  filters: {
    startDate: string;
    endDate: string;
    department?: string;
    employee?: string;
    payGroup?: string;
  };
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

    const { reportId, companyId, filters }: ReportRequest = await req.json();

    console.log(`Generating payroll report: ${reportId} for company: ${companyId}`);

    let reportData: any = {};

    switch (reportId) {
      case 'payroll-register':
        reportData = await generatePayrollRegister(supabase, companyId, filters);
        break;
      case 'employee-pay-statement':
        reportData = await generateEmployeePayStatement(supabase, companyId, filters);
        break;
      case 'payroll-summary':
        reportData = await generatePayrollSummary(supabase, companyId, filters);
        break;
      case 'tax-liability':
        reportData = await generateTaxLiability(supabase, companyId, filters);
        break;
      case 'deduction-summary':
        reportData = await generateDeductionSummary(supabase, companyId, filters);
        break;
      case 'overtime-report':
        reportData = await generateOvertimeReport(supabase, companyId, filters);
        break;
      case 'audit-trail':
        reportData = await generateAuditTrail(supabase, companyId, filters);
        break;
      default:
        reportData = await generateGenericReport(supabase, companyId, filters, reportId);
    }

    // Store report in database for history
    const { data: savedReport, error: saveError } = await supabase
      .from('payroll_reports')
      .insert({
        company_id: companyId,
        report_type: reportId,
        report_data: reportData,
        filters: filters,
        status: 'completed',
        created_by: req.headers.get('user-id') || null
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving report:', saveError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reportId: savedReport?.id,
        data: reportData,
        metadata: {
          generatedAt: new Date().toISOString(),
          recordCount: reportData.records?.length || 0,
          filters: filters
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error generating payroll report:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function generatePayrollRegister(supabase: any, companyId: string, filters: any) {
  const { data: payrollData, error } = await supabase
    .from('pay_stubs')
    .select(`
      *,
      employees(id, employee_number, first_name, last_name, department),
      payroll_periods(start_date, end_date, period_type)
    `)
    .eq('company_id', companyId)
    .gte('pay_date', filters.startDate)
    .lte('pay_date', filters.endDate)
    .order('pay_date', { ascending: false });

  if (error) throw error;

  const summary = {
    totalEmployees: new Set(payrollData.map((p: any) => p.employee_id)).size,
    totalGrossPay: payrollData.reduce((sum: number, p: any) => sum + (p.gross_pay || 0), 0),
    totalNetPay: payrollData.reduce((sum: number, p: any) => sum + (p.net_pay || 0), 0),
    totalTaxes: payrollData.reduce((sum: number, p: any) => sum + (p.total_taxes || 0), 0),
    totalDeductions: payrollData.reduce((sum: number, p: any) => sum + (p.total_deductions || 0), 0),
  };

  return {
    reportType: 'Payroll Register',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    summary,
    records: payrollData,
    generatedAt: new Date().toISOString()
  };
}

async function generateEmployeePayStatement(supabase: any, companyId: string, filters: any) {
  const { data: payStubs, error } = await supabase
    .from('pay_stubs')
    .select(`
      *,
      employees(id, employee_number, first_name, last_name, department, hire_date)
    `)
    .eq('company_id', companyId)
    .gte('pay_date', filters.startDate)
    .lte('pay_date', filters.endDate)
    .order('pay_date', { ascending: false });

  if (error) throw error;

  return {
    reportType: 'Employee Pay Statements',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    records: payStubs,
    generatedAt: new Date().toISOString()
  };
}

async function generatePayrollSummary(supabase: any, companyId: string, filters: any) {
  const { data: summaryData, error } = await supabase
    .from('pay_stubs')
    .select('*')
    .eq('company_id', companyId)
    .gte('pay_date', filters.startDate)
    .lte('pay_date', filters.endDate);

  if (error) throw error;

  const summary = {
    totalEmployees: new Set(summaryData.map((p: any) => p.employee_id)).size,
    totalGrossPay: summaryData.reduce((sum: number, p: any) => sum + (p.gross_pay || 0), 0),
    totalNetPay: summaryData.reduce((sum: number, p: any) => sum + (p.net_pay || 0), 0),
    totalTaxes: summaryData.reduce((sum: number, p: any) => sum + (p.total_taxes || 0), 0),
    totalDeductions: summaryData.reduce((sum: number, p: any) => sum + (p.total_deductions || 0), 0),
    averageGrossPay: summaryData.length > 0 ? summaryData.reduce((sum: number, p: any) => sum + (p.gross_pay || 0), 0) / summaryData.length : 0,
  };

  return {
    reportType: 'Payroll Summary',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    summary,
    generatedAt: new Date().toISOString()
  };
}

async function generateTaxLiability(supabase: any, companyId: string, filters: any) {
  const { data: taxData, error } = await supabase
    .from('pay_stubs')
    .select('*')
    .eq('company_id', companyId)
    .gte('pay_date', filters.startDate)
    .lte('pay_date', filters.endDate);

  if (error) throw error;

  const taxSummary = {
    federalIncomeTax: taxData.reduce((sum: number, p: any) => sum + (p.federal_income_tax || 0), 0),
    stateIncomeTax: taxData.reduce((sum: number, p: any) => sum + (p.state_income_tax || 0), 0),
    socialSecurityTax: taxData.reduce((sum: number, p: any) => sum + (p.social_security_tax || 0), 0),
    medicareTax: taxData.reduce((sum: number, p: any) => sum + (p.medicare_tax || 0), 0),
    unemploymentTax: taxData.reduce((sum: number, p: any) => sum + (p.unemployment_tax || 0), 0),
    totalTaxLiability: taxData.reduce((sum: number, p: any) => sum + (p.total_taxes || 0), 0),
  };

  return {
    reportType: 'Tax Liability Report',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    summary: taxSummary,
    records: taxData,
    generatedAt: new Date().toISOString()
  };
}

async function generateDeductionSummary(supabase: any, companyId: string, filters: any) {
  const { data: deductionData, error } = await supabase
    .from('pay_stubs')
    .select('*')
    .eq('company_id', companyId)
    .gte('pay_date', filters.startDate)
    .lte('pay_date', filters.endDate);

  if (error) throw error;

  const deductionSummary = {
    totalPreTaxDeductions: deductionData.reduce((sum: number, p: any) => sum + (p.pre_tax_deductions || 0), 0),
    totalPostTaxDeductions: deductionData.reduce((sum: number, p: any) => sum + (p.post_tax_deductions || 0), 0),
    totalDeductions: deductionData.reduce((sum: number, p: any) => sum + (p.total_deductions || 0), 0),
  };

  return {
    reportType: 'Deduction Summary',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    summary: deductionSummary,
    records: deductionData,
    generatedAt: new Date().toISOString()
  };
}

async function generateOvertimeReport(supabase: any, companyId: string, filters: any) {
  const { data: overtimeData, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      employees(id, employee_number, first_name, last_name, department)
    `)
    .eq('company_id', companyId)
    .gte('work_date', filters.startDate)
    .lte('work_date', filters.endDate)
    .gt('overtime_hours', 0)
    .order('work_date', { ascending: false });

  if (error) throw error;

  const summary = {
    totalOvertimeHours: overtimeData.reduce((sum: number, t: any) => sum + (t.overtime_hours || 0), 0),
    totalOvertimePay: overtimeData.reduce((sum: number, t: any) => sum + (t.overtime_pay || 0), 0),
    employeesWithOvertime: new Set(overtimeData.map((t: any) => t.employee_id)).size,
  };

  return {
    reportType: 'Overtime Report',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    summary,
    records: overtimeData,
    generatedAt: new Date().toISOString()
  };
}

async function generateAuditTrail(supabase: any, companyId: string, filters: any) {
  const { data: auditData, error } = await supabase
    .from('payroll_audit_trail')
    .select('*')
    .eq('company_id', companyId)
    .gte('created_at', filters.startDate)
    .lte('created_at', filters.endDate)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    reportType: 'Audit Trail Report',
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    records: auditData,
    generatedAt: new Date().toISOString()
  };
}

async function generateGenericReport(supabase: any, companyId: string, filters: any, reportId: string) {
  return {
    reportType: `Generic Report: ${reportId}`,
    dateRange: `${filters.startDate} to ${filters.endDate}`,
    message: 'This report type is not yet implemented with specific data queries.',
    filters,
    generatedAt: new Date().toISOString()
  };
}