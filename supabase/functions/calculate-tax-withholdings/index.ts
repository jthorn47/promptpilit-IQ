import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Symmetry Tax Engine Integration
interface STECalculationRequest {
  employee: {
    employeeId: string;
    firstName: string;
    lastName: string;
    address: {
      line1: string;
      city: string;
      state: string;
      zipCode: string;
    };
    workLocation?: {
      state: string;
      city?: string;
      zipCode?: string;
    };
  };
  taxInfo: {
    filingStatus: string;
    federalAllowances: number;
    stateAllowances?: number;
    additionalFederalWithholding: number;
    additionalStateWithholding: number;
    isExemptFederal: boolean;
    isExemptState: boolean;
    step2Checkbox: boolean;
    dependentsAmount: number;
    otherIncome: number;
    deductions: number;
  };
  payInfo: {
    grossWages: number;
    payFrequency: string;
    payDate: string;
    payPeriodStart: string;
    payPeriodEnd: string;
    ytdGrossWages: number;
    ytdFederalWithheld: number;
    ytdStateWithheld: number;
    ytdSocialSecurityWages: number;
    ytdMedicareWages: number;
  };
}

interface STECalculationResponse {
  success: boolean;
  result?: {
    federalIncomeTax: number;
    stateIncomeTax: number;
    localIncomeTax: number;
    socialSecurityEmployee: number;
    medicareEmployee: number;
    medicareAdditional: number;
    stateDisabilityInsurance: number;
    totalEmployeeWithholdings: number;
    netPay: number;
  };
  error?: string;
  calculationId: string;
  timestamp: string;
}

async function callSymmetryTaxEngine(request: STECalculationRequest): Promise<STECalculationResponse> {
  const steApiKey = Deno.env.get('SYMMETRY_API_KEY');
  const steEnvironment = Deno.env.get('SYMMETRY_ENVIRONMENT') || 'sandbox';
  const steCompanyId = Deno.env.get('SYMMETRY_COMPANY_ID');
  
  if (!steApiKey || !steCompanyId) {
    console.log('Symmetry Tax Engine not configured, falling back to internal calculation');
    return {
      success: false,
      error: 'Symmetry Tax Engine not configured',
      calculationId: `fallback_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  const apiUrl = steEnvironment === 'production' 
    ? 'https://api.symmetry.com' 
    : 'https://sandbox-api.symmetry.com';

  try {
    const response = await fetch(`${apiUrl}/api/v1/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${steApiKey}`,
        'X-Company-Id': steCompanyId,
        'X-STE-Version': '2024.1',
        'User-Agent': 'EaseBase-Payroll/1.0'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`STE API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      result: {
        federalIncomeTax: result.federalIncomeTax || 0,
        stateIncomeTax: result.stateIncomeTax || 0,
        localIncomeTax: result.localIncomeTax || 0,
        socialSecurityEmployee: result.socialSecurityEmployee || 0,
        medicareEmployee: result.medicareEmployee || 0,
        medicareAdditional: result.medicareAdditional || 0,
        stateDisabilityInsurance: result.stateDisabilityInsurance || 0,
        totalEmployeeWithholdings: result.totalEmployeeWithholdings || 0,
        netPay: result.netPay || 0
      },
      calculationId: result.calculationId || `ste_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Symmetry Tax Engine API call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'STE API call failed',
      calculationId: `error_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }
}

interface TaxCalculationRequest {
  employeeId: string;
  grossPay: number;
  payPeriod: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  ytdGrossPay: number;
  ytdFederalWithheld: number;
  ytdStateWithheld: number;
  ytdSocialSecurity: number;
  ytdMedicare: number;
}

interface TaxProfile {
  filing_status: string;
  federal_allowances: number;
  additional_federal_withholding: number;
  state_filing_status: string;
  state_allowances: number;
  additional_state_withholding: number;
  state_code: string;
  is_exempt_federal: boolean;
  is_exempt_state: boolean;
  w4_step2_checkbox: boolean;
  w4_dependents_amount: number;
  w4_other_income: number;
  w4_deductions: number;
}

interface TaxBracket {
  bracket_min: number;
  bracket_max: number | null;
  tax_rate: number;
  base_tax: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { employeeId, grossPay, payPeriod, ytdGrossPay, ytdFederalWithheld, ytdStateWithheld, ytdSocialSecurity, ytdMedicare }: TaxCalculationRequest = await req.json();

    console.log(`Calculating tax withholdings for employee ${employeeId}, gross pay: $${grossPay}`);

    // Get employee tax profile and details
    const [taxProfileResult, employeeResult] = await Promise.all([
      supabase
        .from('employee_tax_profiles')
        .select('*')
        .eq('employee_id', employeeId)
        .single(),
      supabase
        .from('employees')
        .select('first_name, last_name, address, work_location')
        .eq('id', employeeId)
        .single()
    ]);

    const { data: taxProfile, error: profileError } = taxProfileResult;
    const { data: employee, error: employeeError } = employeeResult;

    if (profileError || !taxProfile) {
      console.error('Tax profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'Employee tax profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (employeeError || !employee) {
      console.error('Employee not found:', employeeError);
      return new Response(
        JSON.stringify({ error: 'Employee not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try Symmetry Tax Engine first if configured
    const steRequest: STECalculationRequest = {
      employee: {
        employeeId,
        firstName: employee.first_name || '',
        lastName: employee.last_name || '',
        address: {
          line1: employee.address?.line1 || '',
          city: employee.address?.city || '',
          state: employee.address?.state || taxProfile.state_code,
          zipCode: employee.address?.zipCode || ''
        },
        workLocation: employee.work_location ? {
          state: employee.work_location.state,
          city: employee.work_location.city,
          zipCode: employee.work_location.zipCode
        } : undefined
      },
      taxInfo: {
        filingStatus: taxProfile.filing_status,
        federalAllowances: taxProfile.federal_allowances || 0,
        stateAllowances: taxProfile.state_allowances || 0,
        additionalFederalWithholding: taxProfile.additional_federal_withholding || 0,
        additionalStateWithholding: taxProfile.additional_state_withholding || 0,
        isExemptFederal: taxProfile.is_exempt_federal || false,
        isExemptState: taxProfile.is_exempt_state || false,
        step2Checkbox: taxProfile.w4_step2_checkbox || false,
        dependentsAmount: taxProfile.w4_dependents_amount || 0,
        otherIncome: taxProfile.w4_other_income || 0,
        deductions: taxProfile.w4_deductions || 0
      },
      payInfo: {
        grossWages: grossPay,
        payFrequency: payPeriod.charAt(0).toUpperCase() + payPeriod.slice(1),
        payDate: new Date().toISOString().split('T')[0],
        payPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payPeriodEnd: new Date().toISOString().split('T')[0],
        ytdGrossWages: ytdGrossPay,
        ytdFederalWithheld: ytdFederalWithheld,
        ytdStateWithheld: ytdStateWithheld,
        ytdSocialSecurityWages: ytdSocialSecurity,
        ytdMedicareWages: ytdMedicare
      }
    };

    // Call Symmetry Tax Engine
    const steResponse = await callSymmetryTaxEngine(steRequest);
    
    if (steResponse.success && steResponse.result) {
      console.log('Using Symmetry Tax Engine calculation:', steResponse.calculationId);
      
      // Log the calculation for audit trail
      await supabase
        .from('tax_calculation_audit')
        .insert({
          employee_id: employeeId,
          calculation_id: steResponse.calculationId,
          engine_used: 'symmetry',
          gross_pay: grossPay,
          pay_period: payPeriod,
          result: steResponse.result,
          calculated_at: new Date().toISOString()
        });

      return new Response(
        JSON.stringify({
          ...steResponse.result,
          calculation_details: {
            engine: 'symmetry',
            calculationId: steResponse.calculationId,
            timestamp: steResponse.timestamp,
            payPeriod,
            grossPay
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Symmetry Tax Engine unavailable, using fallback calculation');

    // Calculate annualized income based on pay period
    const payPeriodsPerYear = {
      weekly: 52,
      biweekly: 26,
      semimonthly: 24,
      monthly: 12
    };

    const annualizedIncome = grossPay * payPeriodsPerYear[payPeriod];
    const adjustedAnnualIncome = Math.max(0, annualizedIncome + taxProfile.w4_other_income - taxProfile.w4_deductions - taxProfile.w4_dependents_amount);

    // Calculate federal income tax withholding
    let federalWithholding = 0;
    if (!taxProfile.is_exempt_federal) {
      federalWithholding = await calculateFederalWithholding(
        supabase,
        adjustedAnnualIncome,
        taxProfile.filing_status,
        taxProfile.w4_step2_checkbox,
        payPeriodsPerYear[payPeriod]
      );
      federalWithholding += taxProfile.additional_federal_withholding;
    }

    // Calculate state income tax withholding
    let stateWithholding = 0;
    if (!taxProfile.is_exempt_state && taxProfile.state_code !== 'NONE') {
      stateWithholding = await calculateStateWithholding(
        supabase,
        adjustedAnnualIncome,
        taxProfile.state_code,
        taxProfile.state_filing_status || taxProfile.filing_status
      );
      stateWithholding = stateWithholding / payPeriodsPerYear[payPeriod];
      stateWithholding += taxProfile.additional_state_withholding;
    }

    // Calculate FICA taxes
    const socialSecurityRate = 0.062;
    const medicareRate = 0.0145;
    const additionalMedicareRate = 0.009;
    const socialSecurityWageBase = 160200; // 2024 limit
    const additionalMedicareThreshold = 200000;

    // Social Security (6.2% up to wage base)
    const socialSecurityWithholding = Math.min(
      grossPay * socialSecurityRate,
      Math.max(0, (socialSecurityWageBase - ytdSocialSecurity) * socialSecurityRate)
    );

    // Medicare (1.45% on all wages)
    const medicareWithholding = grossPay * medicareRate;

    // Additional Medicare (0.9% on wages over $200k annually)
    let additionalMedicareWithholding = 0;
    if ((ytdGrossPay + grossPay) > additionalMedicareThreshold) {
      const excessWages = Math.max(0, (ytdGrossPay + grossPay) - additionalMedicareThreshold);
      additionalMedicareWithholding = Math.min(excessWages, grossPay) * additionalMedicareRate;
    }

    // Calculate state-specific taxes (SDI, etc.)
    let stateDisabilityInsurance = 0;
    if (taxProfile.state_code === 'CA') {
      const sdiRate = 0.009; // 0.9% for CA SDI
      const sdiWageBase = 153164; // 2024 CA SDI wage base
      stateDisabilityInsurance = Math.min(
        grossPay * sdiRate,
        Math.max(0, sdiWageBase - ytdGrossPay) * sdiRate
      );
    }

    const totalWithholdings = federalWithholding + stateWithholding + socialSecurityWithholding + 
                            medicareWithholding + additionalMedicareWithholding + stateDisabilityInsurance;

    const result = {
      federal_income_tax: Math.round(federalWithholding * 100) / 100,
      state_income_tax: Math.round(stateWithholding * 100) / 100,
      social_security_employee: Math.round(socialSecurityWithholding * 100) / 100,
      medicare_employee: Math.round(medicareWithholding * 100) / 100,
      medicare_additional: Math.round(additionalMedicareWithholding * 100) / 100,
      state_disability_insurance: Math.round(stateDisabilityInsurance * 100) / 100,
      total_withholdings: Math.round(totalWithholdings * 100) / 100,
      calculation_details: {
        annualizedIncome,
        adjustedAnnualIncome,
        payPeriod,
        taxProfile: taxProfile.filing_status,
        calculatedAt: new Date().toISOString()
      }
    };

    console.log('Tax calculation completed:', result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating tax withholdings:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function calculateFederalWithholding(
  supabase: any,
  adjustedAnnualIncome: number,
  filingStatus: string,
  step2Checkbox: boolean,
  payPeriodsPerYear: number
): Promise<number> {
  // Get federal tax brackets for 2024
  const { data: brackets, error } = await supabase
    .from('federal_tax_brackets')
    .select('*')
    .eq('tax_year', 2024)
    .eq('filing_status', filingStatus)
    .order('bracket_min', { ascending: true });

  if (error || !brackets) {
    console.error('Error fetching federal tax brackets:', error);
    return 0;
  }

  // Calculate annual tax using marginal brackets
  let annualTax = 0;
  let remainingIncome = adjustedAnnualIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const bracketMax = bracket.bracket_max || Infinity;
    const taxableInThisBracket = Math.min(remainingIncome, bracketMax - bracket.bracket_min);
    
    if (taxableInThisBracket > 0) {
      annualTax += taxableInThisBracket * bracket.tax_rate;
      remainingIncome -= taxableInThisBracket;
    }
  }

  // Add base tax for the bracket
  const applicableBracket = brackets.find(b => 
    adjustedAnnualIncome > b.bracket_min && (b.bracket_max === null || adjustedAnnualIncome <= b.bracket_max)
  );
  if (applicableBracket) {
    annualTax += applicableBracket.base_tax;
  }

  // Apply Step 2 checkbox adjustment (multiple jobs or spouse works)
  if (step2Checkbox) {
    annualTax = annualTax / 2;
  }

  // Convert to per-payperiod withholding
  return annualTax / payPeriodsPerYear;
}

async function calculateStateWithholding(
  supabase: any,
  adjustedAnnualIncome: number,
  stateCode: string,
  filingStatus: string
): Promise<number> {
  // Get state tax brackets
  const { data: brackets, error } = await supabase
    .from('state_tax_brackets')
    .select('*')
    .eq('state_code', stateCode)
    .eq('tax_year', 2024)
    .eq('filing_status', filingStatus)
    .order('bracket_min', { ascending: true });

  if (error || !brackets || brackets.length === 0) {
    console.log(`No state tax brackets found for ${stateCode}`);
    return 0;
  }

  const firstBracket = brackets[0];
  const taxableIncome = Math.max(0, adjustedAnnualIncome - firstBracket.standard_deduction - firstBracket.personal_exemption);

  // Calculate annual state tax using marginal brackets
  let annualStateTax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const bracketMax = bracket.bracket_max || Infinity;
    const taxableInThisBracket = Math.min(remainingIncome, bracketMax - bracket.bracket_min);
    
    if (taxableInThisBracket > 0) {
      annualStateTax += taxableInThisBracket * bracket.tax_rate;
      remainingIncome -= taxableInThisBracket;
    }
  }

  // Add base tax for the bracket
  const applicableBracket = brackets.find(b => 
    taxableIncome > b.bracket_min && (b.bracket_max === null || taxableIncome <= b.bracket_max)
  );
  if (applicableBracket) {
    annualStateTax += applicableBracket.base_tax;
  }

  return annualStateTax;
}