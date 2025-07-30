import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaxCalculationRequest {
  employeeId: string;
  grossPay: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  workLocations: WorkLocation[];
  residenceState: string;
  filingStatus: string;
  allowances: number;
  additionalWithholding?: number;
}

interface WorkLocation {
  state: string;
  percentage: number;
  days: number;
}

interface StateTaxRule {
  state: string;
  taxRate: number;
  standardDeduction: number;
  brackets: TaxBracket[];
  hasReciprocity?: string[];
  nexusThreshold: number;
}

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  base: number;
}

interface TaxCalculationResult {
  employeeId: string;
  totalTaxWithheld: number;
  stateTaxBreakdown: StateTaxBreakdown[];
  federalTax: number;
  ficaTax: number;
  medicareTax: number;
  totalDeductions: number;
  netPay: number;
  calculationDate: string;
}

interface StateTaxBreakdown {
  state: string;
  allocatedIncome: number;
  taxableIncome: number;
  taxWithheld: number;
  taxRate: number;
  reciprocityApplied: boolean;
}

// Mock state tax rules (in production, these would come from database)
const STATE_TAX_RULES: Record<string, StateTaxRule> = {
  'CA': {
    state: 'CA',
    taxRate: 13.3,
    standardDeduction: 5202,
    nexusThreshold: 50000,
    hasReciprocity: [],
    brackets: [
      { min: 0, max: 10099, rate: 0.01, base: 0 },
      { min: 10100, max: 23942, rate: 0.02, base: 101 },
      { min: 23943, max: 37788, rate: 0.04, base: 378 },
      { min: 37789, max: 52455, rate: 0.06, base: 932 },
      { min: 52456, max: 66295, rate: 0.08, base: 1812 },
      { min: 66296, max: 338639, rate: 0.093, base: 2919 },
      { min: 338640, max: 406364, rate: 0.103, base: 28246 },
      { min: 406365, max: 677278, rate: 0.113, base: 35222 },
      { min: 677279, max: Infinity, rate: 0.133, base: 65835 }
    ]
  },
  'NY': {
    state: 'NY',
    taxRate: 10.9,
    standardDeduction: 8000,
    nexusThreshold: 50000,
    hasReciprocity: ['NJ', 'CT'],
    brackets: [
      { min: 0, max: 8500, rate: 0.04, base: 0 },
      { min: 8501, max: 11700, rate: 0.045, base: 340 },
      { min: 11701, max: 13900, rate: 0.0525, base: 484 },
      { min: 13901, max: 80650, rate: 0.055, base: 600 },
      { min: 80651, max: 215400, rate: 0.06, base: 4271 },
      { min: 215401, max: 1077550, rate: 0.0685, base: 12356 },
      { min: 1077551, max: Infinity, rate: 0.109, base: 71426 }
    ]
  },
  'TX': {
    state: 'TX',
    taxRate: 0,
    standardDeduction: 0,
    nexusThreshold: 0,
    hasReciprocity: [],
    brackets: []
  },
  'FL': {
    state: 'FL',
    taxRate: 0,
    standardDeduction: 0,
    nexusThreshold: 0,
    hasReciprocity: [],
    brackets: []
  },
  'WA': {
    state: 'WA',
    taxRate: 0,
    standardDeduction: 0,
    nexusThreshold: 0,
    hasReciprocity: [],
    brackets: []
  }
};

const FEDERAL_TAX_BRACKETS = [
  { min: 0, max: 11000, rate: 0.10, base: 0 },
  { min: 11001, max: 44725, rate: 0.12, base: 1100 },
  { min: 44726, max: 95375, rate: 0.22, base: 5147 },
  { min: 95376, max: 182050, rate: 0.24, base: 16290 },
  { min: 182051, max: 231250, rate: 0.32, base: 37104 },
  { min: 231251, max: 578125, rate: 0.35, base: 52832 },
  { min: 578126, max: Infinity, rate: 0.37, base: 174238 }
];

function calculateProgressiveTax(income: number, brackets: TaxBracket[]): number {
  if (brackets.length === 0) return 0;
  
  for (const bracket of brackets) {
    if (income >= bracket.min && income <= bracket.max) {
      return bracket.base + ((income - bracket.min) * bracket.rate);
    }
  }
  
  // If income exceeds all brackets, use the highest bracket
  const highestBracket = brackets[brackets.length - 1];
  return highestBracket.base + ((income - highestBracket.min) * highestBracket.rate);
}

function calculateStateTax(
  allocatedIncome: number, 
  state: string, 
  residenceState: string,
  filingStatus: string,
  allowances: number
): StateTaxBreakdown {
  const stateRule = STATE_TAX_RULES[state];
  const residenceRule = STATE_TAX_RULES[residenceState];
  
  if (!stateRule) {
    return {
      state,
      allocatedIncome,
      taxableIncome: 0,
      taxWithheld: 0,
      taxRate: 0,
      reciprocityApplied: false
    };
  }

  // Check for reciprocity agreement
  const hasReciprocity = stateRule.hasReciprocity?.includes(residenceState) || false;
  
  if (hasReciprocity && state !== residenceState) {
    return {
      state,
      allocatedIncome,
      taxableIncome: 0,
      taxWithheld: 0,
      taxRate: 0,
      reciprocityApplied: true
    };
  }

  // Calculate taxable income after standard deduction and allowances
  const allowanceAmount = allowances * 4650; // Standard allowance amount
  const taxableIncome = Math.max(0, allocatedIncome - stateRule.standardDeduction - allowanceAmount);
  
  // Calculate tax using progressive brackets
  const taxOwed = calculateProgressiveTax(taxableIncome, stateRule.brackets);
  
  return {
    state,
    allocatedIncome,
    taxableIncome,
    taxWithheld: Math.round(taxOwed * 100) / 100,
    taxRate: stateRule.taxRate,
    reciprocityApplied: false
  };
}

function calculateFederalTax(grossPay: number, filingStatus: string, allowances: number): number {
  const standardDeduction = filingStatus === 'married' ? 27700 : 13850;
  const allowanceAmount = allowances * 4650;
  const taxableIncome = Math.max(0, grossPay - standardDeduction - allowanceAmount);
  
  return calculateProgressiveTax(taxableIncome, FEDERAL_TAX_BRACKETS);
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

    const requestData: TaxCalculationRequest = await req.json();
    console.log('Tax calculation request received:', requestData);

    // Validate required fields
    if (!requestData.employeeId || !requestData.grossPay || !requestData.workLocations) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate work location percentages
    const totalPercentage = requestData.workLocations.reduce((sum, loc) => sum + loc.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return new Response(
        JSON.stringify({ error: 'Work location percentages must total 100%' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate state taxes for each work location
    const stateTaxBreakdown: StateTaxBreakdown[] = [];
    let totalStateTax = 0;

    for (const location of requestData.workLocations) {
      const allocatedIncome = (requestData.grossPay * location.percentage) / 100;
      
      const stateTax = calculateStateTax(
        allocatedIncome,
        location.state,
        requestData.residenceState,
        requestData.filingStatus || 'single',
        requestData.allowances || 0
      );
      
      stateTaxBreakdown.push(stateTax);
      totalStateTax += stateTax.taxWithheld;
    }

    // Calculate federal taxes
    const federalTax = calculateFederalTax(
      requestData.grossPay,
      requestData.filingStatus || 'single',
      requestData.allowances || 0
    );

    // Calculate FICA and Medicare
    const ficaTax = requestData.grossPay * 0.062; // 6.2% Social Security
    const medicareTax = requestData.grossPay * 0.0145; // 1.45% Medicare
    
    // Add additional Medicare tax for high earners (0.9% on income over $200,000)
    const additionalMedicareTax = requestData.grossPay > 200000 
      ? (requestData.grossPay - 200000) * 0.009 
      : 0;

    const totalMedicareTax = medicareTax + additionalMedicareTax;

    // Calculate totals
    const totalTaxWithheld = totalStateTax + (requestData.additionalWithholding || 0);
    const totalDeductions = federalTax + totalTaxWithheld + ficaTax + totalMedicareTax;
    const netPay = requestData.grossPay - totalDeductions;

    const result: TaxCalculationResult = {
      employeeId: requestData.employeeId,
      totalTaxWithheld,
      stateTaxBreakdown,
      federalTax: Math.round(federalTax * 100) / 100,
      ficaTax: Math.round(ficaTax * 100) / 100,
      medicareTax: Math.round(totalMedicareTax * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      netPay: Math.round(netPay * 100) / 100,
      calculationDate: new Date().toISOString()
    };

    // Log the calculation for audit trail
    await supabase
      .from('payroll_audit_logs')
      .insert({
        employee_id: requestData.employeeId,
        action_type: 'multi_state_tax_calculation',
        action_details: {
          request: requestData,
          result: result,
          calculation_method: 'automated',
          states_involved: requestData.workLocations.map(loc => loc.state)
        },
        performed_by: null, // System calculation
        timestamp: new Date().toISOString()
      });

    console.log('Tax calculation completed:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in calculate-multi-state-tax function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});