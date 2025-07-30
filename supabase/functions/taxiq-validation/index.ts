
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  test_type: 'tax_calculation' | 'ytd_accumulator' | 'audit_trail' | 'system_health';
  test_year: number;
  employee_id?: string;
  payroll_run_id?: string;
}

interface ValidationResult {
  test_type: string;
  status: 'pass' | 'fail' | 'warning';
  details: any;
  timestamp: string;
  duration_ms: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const request: ValidationRequest = await req.json();
    console.log(`Starting validation test: ${request.test_type} for year ${request.test_year}`);

    let result: ValidationResult;

    switch (request.test_type) {
      case 'tax_calculation':
        result = await validateTaxCalculation(supabase, request);
        break;
      case 'ytd_accumulator':
        result = await validateYTDAccumulators(supabase, request);
        break;
      case 'audit_trail':
        result = await validateAuditTrail(supabase, request);
        break;
      case 'system_health':
        result = await validateSystemHealth(supabase, request);
        break;
      default:
        throw new Error(`Unknown test type: ${request.test_type}`);
    }

    result.duration_ms = Date.now() - startTime;
    result.timestamp = new Date().toISOString();

    return new Response(JSON.stringify({
      success: true,
      validation_result: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Validation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function validateTaxCalculation(supabase: any, request: ValidationRequest): Promise<ValidationResult> {
  console.log('Validating tax calculation accuracy...');
  
  // Test 2024 vs 2025 calculations with known data
  const testPayroll = {
    gross_wages: 5000,
    pay_frequency: 'biweekly',
    employee_location: 'CA',
    federal_filing_status: 'single',
    federal_allowances: 0
  };

  // Get 2024 rates
  const { data: rates2024 } = await supabase
    .from('tax_rate_archives')
    .select('*')
    .eq('tax_year', 2024);

  // Get 2025 rates  
  const { data: rates2025 } = await supabase
    .from('tax_rate_archives')
    .select('*')
    .eq('tax_year', 2025);

  const issues = [];
  
  // Validate FICA Social Security rate changes
  const ss2024 = rates2024?.find(r => r.rate_type === 'fica_social_security');
  const ss2025 = rates2025?.find(r => r.rate_type === 'fica_social_security');
  
  if (!ss2024 || !ss2025) {
    issues.push('Missing FICA Social Security rates for comparison years');
  } else if (ss2024.rate_value !== 0.062 || ss2025.rate_value !== 0.062) {
    issues.push('FICA Social Security rate should be 6.2% for both years');
  }

  // Validate wage base increases
  if (ss2024 && ss2025 && ss2025.wage_base <= ss2024.wage_base) {
    issues.push('2025 Social Security wage base should be higher than 2024');
  }

  // Validate CA SDI rate increase
  const sdi2024 = rates2024?.find(r => r.rate_type === 'ca_sdi');
  const sdi2025 = rates2025?.find(r => r.rate_type === 'ca_sdi');
  
  if (sdi2024 && sdi2025 && sdi2025.rate_value <= sdi2024.rate_value) {
    issues.push('Expected CA SDI rate increase from 2024 to 2025');
  }

  return {
    test_type: 'tax_calculation',
    status: issues.length === 0 ? 'pass' : 'warning',
    details: {
      test_scenario: testPayroll,
      rates_2024_count: rates2024?.length || 0,
      rates_2025_count: rates2025?.length || 0,
      issues: issues,
      fica_ss_2024: ss2024?.rate_value,
      fica_ss_2025: ss2025?.rate_value,
      ca_sdi_2024: sdi2024?.rate_value,
      ca_sdi_2025: sdi2025?.rate_value
    },
    timestamp: '',
    duration_ms: 0
  };
}

async function validateYTDAccumulators(supabase: any, request: ValidationRequest): Promise<ValidationResult> {
  console.log('Validating YTD accumulator integrity...');
  
  const { data: employees } = await supabase
    .from('employees')
    .select('id')
    .eq('status', 'active')
    .limit(10);

  if (!employees || employees.length === 0) {
    return {
      test_type: 'ytd_accumulator',
      status: 'warning',
      details: { message: 'No active employees found for testing' },
      timestamp: '',
      duration_ms: 0
    };
  }

  // Check YTD accumulator table structure and data
  const { data: accumulators } = await supabase
    .from('payroll_ytd_accumulators')
    .select('*')
    .in('employee_id', employees.map(e => e.id))
    .limit(5);

  const issues = [];
  
  if (!accumulators || accumulators.length === 0) {
    issues.push('No YTD accumulator records found');
  }

  // Validate accumulator completeness
  for (const emp of employees.slice(0, 3)) {
    const empAccumulators = accumulators?.filter(a => a.employee_id === emp.id) || [];
    const requiredTypes = ['federal_income_tax', 'social_security', 'medicare', 'ca_state_tax', 'ca_sdi'];
    
    for (const taxType of requiredTypes) {
      if (!empAccumulators.find(a => a.tax_type === taxType)) {
        issues.push(`Missing ${taxType} accumulator for employee ${emp.id}`);
      }
    }
  }

  return {
    test_type: 'ytd_accumulator',
    status: issues.length === 0 ? 'pass' : 'fail',
    details: {
      employees_tested: employees.length,
      accumulator_records: accumulators?.length || 0,
      issues: issues
    },
    timestamp: '',
    duration_ms: 0
  };
}

async function validateAuditTrail(supabase: any, request: ValidationRequest): Promise<ValidationResult> {
  console.log('Validating audit trail completeness...');
  
  // Check recent tax calculations
  const { data: recentCalcs } = await supabase
    .from('tax_calculations')
    .select('*')
    .order('calculated_at', { ascending: false })
    .limit(10);

  const issues = [];
  
  if (!recentCalcs || recentCalcs.length === 0) {
    issues.push('No recent tax calculations found in audit trail');
  }

  // Validate audit trail fields
  for (const calc of recentCalcs || []) {
    if (!calc.employee_id) issues.push('Missing employee_id in audit record');
    if (!calc.payroll_run_id) issues.push('Missing payroll_run_id in audit record');
    if (!calc.tax_rule_version) issues.push('Missing tax_rule_version in audit record');
    if (calc.federal_income_tax === null) issues.push('Missing federal_income_tax calculation');
  }

  return {
    test_type: 'audit_trail',
    status: issues.length === 0 ? 'pass' : 'fail',
    details: {
      recent_calculations: recentCalcs?.length || 0,
      issues: issues.slice(0, 10) // Limit issue count
    },
    timestamp: '',
    duration_ms: 0
  };
}

async function validateSystemHealth(supabase: any, request: ValidationRequest): Promise<ValidationResult> {
  console.log('Validating overall system health...');
  
  const healthChecks = {
    tax_tables: false,
    wage_rules: false,
    employee_data: false,
    background_jobs: false
  };

  const issues = [];

  // Check tax tables
  const { data: taxBrackets } = await supabase
    .from('federal_tax_brackets')
    .select('count')
    .eq('year', request.test_year);
  
  healthChecks.tax_tables = taxBrackets && taxBrackets.length > 0;
  if (!healthChecks.tax_tables) issues.push(`No federal tax brackets found for ${request.test_year}`);

  // Check wage rules
  const { data: wageRules } = await supabase
    .from('wage_rules')
    .select('count')
    .eq('effective_year', request.test_year);
    
  healthChecks.wage_rules = wageRules && wageRules.length > 0;
  if (!healthChecks.wage_rules) issues.push(`No wage rules found for ${request.test_year}`);

  // Check employee data
  const { data: employees } = await supabase
    .from('employees')
    .select('count')
    .eq('status', 'active');
    
  healthChecks.employee_data = employees && employees.length > 0;
  if (!healthChecks.employee_data) issues.push('No active employees found');

  // Check background job health
  const { data: recentJobs } = await supabase
    .from('background_job_logs')
    .select('status')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(10);

  const failedJobs = recentJobs?.filter(j => j.status === 'failed').length || 0;
  healthChecks.background_jobs = failedJobs < 3;
  if (!healthChecks.background_jobs) issues.push(`${failedJobs} background jobs failed in last 24h`);

  const overallHealth = Object.values(healthChecks).every(check => check);

  return {
    test_type: 'system_health',
    status: overallHealth ? 'pass' : 'warning',
    details: {
      health_checks: healthChecks,
      issues: issues,
      test_year: request.test_year
    },
    timestamp: '',
    duration_ms: 0
  };
}
