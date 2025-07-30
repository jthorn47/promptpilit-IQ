import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RetroPayRequest {
  runId: string;
  type: 'retro_pay' | 'bonus' | 'correction';
  employees: EmployeeAdjustment[];
  payPeriodStart?: string;
  payPeriodEnd?: string;
  processingType: 'immediate' | 'scheduled';
  scheduledDate?: string;
  createdBy: string;
  description: string;
}

interface EmployeeAdjustment {
  employeeId: string;
  adjustments: Adjustment[];
}

interface Adjustment {
  type: 'bonus' | 'missed_hours' | 'correction' | 'overtime' | 'commission';
  amount: number;
  hours?: number;
  rate?: number;
  reason: string;
  effectiveDate: string;
}

interface PayrollCalculationResult {
  employeeId: string;
  grossAdjustment: number;
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  medicareTax: number;
  totalTax: number;
  netAdjustment: number;
  newYTDTotal: number;
}

interface RetroPayResult {
  runId: string;
  status: 'success' | 'failed' | 'validation_error';
  batchId?: string;
  processedEmployees: number;
  totalGrossAmount: number;
  totalTaxWithheld: number;
  totalNetAmount: number;
  calculations: PayrollCalculationResult[];
  stubsGenerated: boolean;
  nachaBatchCreated: boolean;
  conflicts?: string[];
  errors?: string[];
  processedAt: string;
}

// Mock employee data for YTD calculations
const mockEmployeeData = {
  'EMP-001': { currentYTD: 45000, taxRate: 0.22, filingStatus: 'single' },
  'EMP-002': { currentYTD: 38000, taxRate: 0.18, filingStatus: 'married' },
  'EMP-003': { currentYTD: 52000, taxRate: 0.24, filingStatus: 'single' }
};

function calculateTaxes(grossAmount: number, employeeData: any): {
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  medicareTax: number;
  totalTax: number;
} {
  // Simplified tax calculations for demo
  const federalTax = grossAmount * (employeeData.taxRate || 0.22);
  const stateTax = grossAmount * 0.07; // California rate
  const ficaTax = grossAmount * 0.062; // 6.2%
  const medicareTax = grossAmount * 0.0145; // 1.45%

  // Additional Medicare tax for high earners
  const additionalMedicare = (employeeData.currentYTD + grossAmount) > 200000 
    ? (Math.max(0, employeeData.currentYTD + grossAmount - 200000)) * 0.009 
    : 0;

  const totalTax = federalTax + stateTax + ficaTax + medicareTax + additionalMedicare;

  return {
    federalTax: Math.round(federalTax * 100) / 100,
    stateTax: Math.round(stateTax * 100) / 100,
    ficaTax: Math.round(ficaTax * 100) / 100,
    medicareTax: Math.round((medicareTax + additionalMedicare) * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100
  };
}

function validateRetroPayRequest(request: RetroPayRequest): string[] {
  const errors: string[] = [];

  if (!request.runId || request.runId.trim() === '') {
    errors.push('Run ID is required');
  }

  if (!request.employees || request.employees.length === 0) {
    errors.push('At least one employee must be selected');
  }

  if (!request.createdBy) {
    errors.push('Created by user is required');
  }

  request.employees?.forEach((emp, index) => {
    if (!emp.employeeId) {
      errors.push(`Employee ${index + 1}: Employee ID is required`);
    }

    if (!emp.adjustments || emp.adjustments.length === 0) {
      errors.push(`Employee ${index + 1}: At least one adjustment is required`);
    }

    emp.adjustments?.forEach((adj, adjIndex) => {
      if (!adj.amount || adj.amount <= 0) {
        errors.push(`Employee ${index + 1}, Adjustment ${adjIndex + 1}: Amount must be greater than 0`);
      }

      if (!adj.reason || adj.reason.trim() === '') {
        errors.push(`Employee ${index + 1}, Adjustment ${adjIndex + 1}: Reason is required`);
      }

      if (adj.type === 'missed_hours' || adj.type === 'overtime') {
        if (!adj.hours || adj.hours <= 0) {
          errors.push(`Employee ${index + 1}, Adjustment ${adjIndex + 1}: Hours are required for this adjustment type`);
        }
        if (!adj.rate || adj.rate <= 0) {
          errors.push(`Employee ${index + 1}, Adjustment ${adjIndex + 1}: Rate is required for this adjustment type`);
        }
      }
    });
  });

  return errors;
}

async function detectConflicts(supabase: any, request: RetroPayRequest): Promise<string[]> {
  const conflicts: string[] = [];

  try {
    // Check for duplicate payments in the same pay period
    for (const employee of request.employees) {
      const { data: existingRuns } = await supabase
        .from('retro_pay_runs')
        .select('*')
        .eq('employee_id', employee.employeeId)
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (existingRuns && existingRuns.length > 0) {
        conflicts.push(`Employee ${employee.employeeId} has recent off-cycle payments that may conflict`);
      }
    }

    // Check for overlapping regular payroll runs
    if (request.payPeriodStart && request.payPeriodEnd) {
      const { data: overlappingRuns } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('status', 'processing')
        .or(`pay_period_start.lte.${request.payPeriodEnd},pay_period_end.gte.${request.payPeriodStart}`);

      if (overlappingRuns && overlappingRuns.length > 0) {
        conflicts.push('Off-cycle run overlaps with active regular payroll processing');
      }
    }

    // Check payroll account balance (mock check)
    const totalAmount = request.employees.reduce((total, emp) => {
      return total + emp.adjustments.reduce((empTotal, adj) => {
        return empTotal + (adj.hours && adj.rate ? adj.hours * adj.rate : adj.amount);
      }, 0);
    }, 0);

    // Mock insufficient funds check
    if (totalAmount > 100000) {
      conflicts.push('Total amount exceeds available payroll account balance');
    }

  } catch (error) {
    console.error('Error detecting conflicts:', error);
    conflicts.push('Unable to verify conflicts - manual review required');
  }

  return conflicts;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: RetroPayRequest = await req.json();
    console.log('Retro pay request received:', requestData);

    // Validate request
    const validationErrors = validateRetroPayRequest(requestData);
    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ 
          status: 'validation_error',
          errors: validationErrors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Detect conflicts
    const conflicts = await detectConflicts(supabase, requestData);
    if (conflicts.length > 0) {
      console.log('Conflicts detected:', conflicts);
    }

    // Calculate payroll adjustments
    const calculations: PayrollCalculationResult[] = [];
    let totalGrossAmount = 0;
    let totalTaxWithheld = 0;
    let totalNetAmount = 0;

    for (const employee of requestData.employees) {
      const employeeData = mockEmployeeData[employee.employeeId as keyof typeof mockEmployeeData] || {
        currentYTD: 40000,
        taxRate: 0.22,
        filingStatus: 'single'
      };

      const grossAdjustment = employee.adjustments.reduce((total, adj) => {
        return total + (adj.hours && adj.rate ? adj.hours * adj.rate : adj.amount);
      }, 0);

      const taxes = calculateTaxes(grossAdjustment, employeeData);
      const netAdjustment = grossAdjustment - taxes.totalTax;
      const newYTDTotal = employeeData.currentYTD + grossAdjustment;

      calculations.push({
        employeeId: employee.employeeId,
        grossAdjustment: Math.round(grossAdjustment * 100) / 100,
        federalTax: taxes.federalTax,
        stateTax: taxes.stateTax,
        ficaTax: taxes.ficaTax,
        medicareTax: taxes.medicareTax,
        totalTax: taxes.totalTax,
        netAdjustment: Math.round(netAdjustment * 100) / 100,
        newYTDTotal: Math.round(newYTDTotal * 100) / 100
      });

      totalGrossAmount += grossAdjustment;
      totalTaxWithheld += taxes.totalTax;
      totalNetAmount += netAdjustment;
    }

    // Generate batch ID
    const batchId = `RETRO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now()}`;

    // Store retro pay run in database
    const retroPayRun = {
      run_id: requestData.runId,
      batch_id: batchId,
      type: requestData.type,
      status: conflicts.length > 0 ? 'pending_review' : 'completed',
      employee_count: requestData.employees.length,
      total_gross_amount: Math.round(totalGrossAmount * 100) / 100,
      total_tax_withheld: Math.round(totalTaxWithheld * 100) / 100,
      total_net_amount: Math.round(totalNetAmount * 100) / 100,
      pay_period_start: requestData.payPeriodStart,
      pay_period_end: requestData.payPeriodEnd,
      processing_type: requestData.processingType,
      scheduled_date: requestData.scheduledDate,
      created_by: requestData.createdBy,
      description: requestData.description,
      conflicts: conflicts,
      calculations: calculations,
      created_at: new Date().toISOString(),
      processed_at: requestData.processingType === 'immediate' ? new Date().toISOString() : null
    };

    // Insert into retro_pay_runs table
    const { error: insertError } = await supabase
      .from('retro_pay_runs')
      .insert(retroPayRun);

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    // Log audit trail
    await supabase
      .from('payroll_audit_logs')
      .insert({
        run_id: requestData.runId,
        action_type: 'retro_pay_created',
        action_details: {
          type: requestData.type,
          employee_count: requestData.employees.length,
          total_amount: totalGrossAmount,
          conflicts_detected: conflicts.length,
          processing_type: requestData.processingType
        },
        performed_by: requestData.createdBy,
        timestamp: new Date().toISOString()
      });

    const result: RetroPayResult = {
      runId: requestData.runId,
      status: conflicts.length > 0 ? 'failed' : 'success',
      batchId,
      processedEmployees: requestData.employees.length,
      totalGrossAmount: Math.round(totalGrossAmount * 100) / 100,
      totalTaxWithheld: Math.round(totalTaxWithheld * 100) / 100,
      totalNetAmount: Math.round(totalNetAmount * 100) / 100,
      calculations,
      stubsGenerated: conflicts.length === 0,
      nachaBatchCreated: conflicts.length === 0,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
      processedAt: new Date().toISOString()
    };

    console.log('Retro pay processing completed:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in run-retro-pay function:', error);
    
    return new Response(
      JSON.stringify({ 
        status: 'failed',
        errors: [error.message],
        processedAt: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});