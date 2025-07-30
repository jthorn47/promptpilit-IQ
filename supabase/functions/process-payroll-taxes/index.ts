import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============= TaxIQ Engine - Dynamic Tax System =============
class TaxEngine {
  constructor(private supabase: any, private taxYear: number) {}

  async getTaxRate(rateType: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('tax_rate_archives')
      .select('rate_value')
      .eq('tax_year', this.taxYear)
      .eq('rate_type', rateType)
      .single();
    
    if (error || !data) {
      console.error(`Error fetching tax rate ${rateType} for year ${this.taxYear}:`, error);
      return 0;
    }
    
    return Number(data.rate_value);
  }

  async getTaxBrackets(filingStatus: string, jurisdiction: 'federal' | 'state', state?: string) {
    if (jurisdiction === 'federal') {
      const { data, error } = await this.supabase
        .from('federal_tax_brackets')
        .select('min_income, max_income, rate, base_amount')
        .eq('year', this.taxYear)
        .eq('filing_status', filingStatus)
        .order('min_income');
      
      if (error || !data) {
        console.error(`Error fetching federal tax brackets for ${filingStatus} in ${this.taxYear}:`, error);
        return [];
      }
      
      return data.map((bracket: any) => ({
        upTo: bracket.max_income === 999999999 ? Infinity : bracket.max_income,
        rate: Number(bracket.rate),
        baseAmount: Number(bracket.base_amount)
      }));
    } else {
      const { data, error } = await this.supabase
        .from('state_tax_brackets')
        .select('min_income, max_income, rate, base_amount')
        .eq('year', this.taxYear)
        .eq('state', state || 'CA')
        .eq('filing_status', filingStatus)
        .order('min_income');
      
      if (error || !data) {
        console.error(`Error fetching state tax brackets for ${state} ${filingStatus} in ${this.taxYear}:`, error);
        return [];
      }
      
      return data.map((bracket: any) => ({
        upTo: bracket.max_income === 999999999 ? Infinity : bracket.max_income,
        rate: Number(bracket.rate),
        baseAmount: Number(bracket.base_amount)
      }));
    }
  }

  roundToCents(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  applyWageBaseCap(grossPay: number, wageBaseCap: number): number {
    return Math.min(grossPay, wageBaseCap);
  }

  calculateBracketTax(
    taxableIncome: number,
    brackets: Array<{ upTo: number; rate: number; baseAmount?: number }>
  ): number {
    let tax = 0;
    let previousThreshold = 0;

    for (const bracket of brackets) {
      if (taxableIncome <= previousThreshold) break;
      
      const taxableAtThisLevel = Math.min(taxableIncome, bracket.upTo) - previousThreshold;
      tax += taxableAtThisLevel * bracket.rate;
      previousThreshold = bracket.upTo;
      
      if (taxableIncome <= bracket.upTo) break;
    }

    return this.roundToCents(tax);
  }

  async calculateFICA(input: TaxInput): Promise<{
    socialSecurity: number;
    medicare: number;
    additionalMedicare: number;
  }> {
    const multiplier = input.payFrequency === 'weekly' ? 52 :
      input.payFrequency === 'biweekly' ? 26 :
      input.payFrequency === 'semi-monthly' ? 24 : 12;
    const annualGrossPay = input.grossPay * multiplier;
    
    const ssRate = await this.getTaxRate('fica_social_security');
    const ssWageBase = await this.getTaxRate('fica_social_security');
    const medicareRate = await this.getTaxRate('fica_medicare');
    const additionalMedicareRate = await this.getTaxRate('fica_medicare_additional');
    const additionalMedicareThreshold = await this.getTaxRate('fica_medicare_threshold');

    // Get wage base from archive table
    const { data: ssWageBaseData } = await this.supabase
      .from('tax_rate_archives')
      .select('wage_base')
      .eq('tax_year', this.taxYear)
      .eq('rate_type', 'fica_social_security')
      .single();
    
    const socialSecurityWageBase = ssWageBaseData?.wage_base || 176100; // 2025 default

    const grossPay = input.grossPay;

    // Social Security Tax (6.2% up to wage base)
    const socialSecurityWages = this.applyWageBaseCap(
      grossPay,
      socialSecurityWageBase / multiplier
    );
    
    const socialSecurity = this.roundToCents(socialSecurityWages * ssRate);

    // Medicare Tax (1.45% on all wages)
    const medicare = this.roundToCents(grossPay * medicareRate);

    // Additional Medicare Tax (0.9% on wages above threshold)
    let additionalMedicare = 0;
    if (annualGrossPay > additionalMedicareThreshold) {
      const excessWages = annualGrossPay - additionalMedicareThreshold;
      additionalMedicare = this.roundToCents((excessWages / multiplier) * additionalMedicareRate);
    }

    return {
      socialSecurity,
      medicare,
      additionalMedicare,
    };
  }

  async calculateFederalIncomeTax(input: TaxInput): Promise<number> {
    const multiplier = input.payFrequency === 'weekly' ? 52 :
      input.payFrequency === 'biweekly' ? 26 :
      input.payFrequency === 'semi-monthly' ? 24 : 12;
    
    const annualGrossPay = input.grossPay * multiplier;
    
    const standardDeductionRateType = `federal_standard_deduction_${input.federal.filingStatus}`;
    const standardDeduction = await this.getTaxRate(standardDeductionRateType);
    
    // Note: Dependent credit is not in tax_rate_archives yet, using 2025 value
    const dependentCredit = input.federal.dependents * 2000; // Updated for 2025
    
    const adjustedAnnualIncome = Math.max(0, annualGrossPay - standardDeduction - dependentCredit);
    
    const federalBrackets = await this.getTaxBrackets(input.federal.filingStatus, 'federal');
    const annualTax = this.calculateBracketTax(adjustedAnnualIncome, federalBrackets);
    const periodTax = annualTax / multiplier;
    
    return this.roundToCents(Math.max(0, periodTax + input.federal.extraWithholding));
  }

  async calculateCaliforniaStateTax(input: TaxInput, annualGrossPay: number): Promise<{ californiaStateTax: number }> {
    // Get CA allowance amount - using 2025 value since not in archives
    const allowanceAmount = 5363; // CA 2025 allowance amount
    const allowanceDeduction = input.california.allowances * allowanceAmount;
    const adjustedAnnualIncome = Math.max(0, annualGrossPay - allowanceDeduction);
    
    const caBrackets = await this.getTaxBrackets(input.federal.filingStatus, 'state', 'CA');
    const annualTax = this.calculateBracketTax(adjustedAnnualIncome, caBrackets);
    
    const multiplier = input.payFrequency === 'weekly' ? 52 :
      input.payFrequency === 'biweekly' ? 26 :
      input.payFrequency === 'semi-monthly' ? 24 : 12;
    
    const periodTax = annualTax / multiplier;
    
    return {
      californiaStateTax: this.roundToCents(Math.max(0, periodTax + input.california.extraWithholding))
    };
  }

  async calculateCaliforniaSDI(input: TaxInput): Promise<{ sdi: number }> {
    const sdiRate = await this.getTaxRate('ca_sdi');
    
    // Get SDI wage base from archive table
    const { data: sdiWageBaseData } = await this.supabase
      .from('tax_rate_archives')
      .select('wage_base')
      .eq('tax_year', this.taxYear)
      .eq('rate_type', 'ca_sdi')
      .single();
    
    const sdiWageBase = sdiWageBaseData?.wage_base || 168600; // 2025 default
    
    const sdiWages = this.applyWageBaseCap(input.grossPay, sdiWageBase);
    const sdi = this.roundToCents(sdiWages * sdiRate);
    
    return { sdi };
  }

  async calculateTaxes(input: TaxInput): Promise<TaxOutput> {
    const federalIncomeTax = await this.calculateFederalIncomeTax(input);
    const { socialSecurity, medicare, additionalMedicare } = await this.calculateFICA(input);
    
    const multiplier = input.payFrequency === 'weekly' ? 52 :
      input.payFrequency === 'biweekly' ? 26 :
      input.payFrequency === 'semi-monthly' ? 24 : 12;
    const annualGrossPay = input.grossPay * multiplier;
    
    const caResult = await this.calculateCaliforniaStateTax(input, annualGrossPay);
    const sdiResult = await this.calculateCaliforniaSDI(input);

    const totalTaxes =
      federalIncomeTax + socialSecurity + medicare + additionalMedicare + 
      caResult.californiaStateTax + sdiResult.sdi;

    const netPay = input.grossPay - totalTaxes;

    return {
      netPay,
      taxes: {
        federalIncomeTax,
        socialSecurity,
        medicare,
        additionalMedicare,
        californiaStateTax: caResult.californiaStateTax,
        sdi: sdiResult.sdi,
      },
    };
  }
}

// ============= TaxIQ Engine - Tax Calculation Types =============
interface TaxInput {
  grossPay: number;
  payFrequency: 'weekly' | 'biweekly' | 'semi-monthly' | 'monthly';
  year: number;
  federal: {
    filingStatus: 'single' | 'married' | 'head';
    step2Checkbox: boolean;
    dependents: number;
    extraWithholding: number;
  };
  california: {
    allowances: number;
    extraWithholding: number;
  };
}

interface TaxOutput {
  netPay: number;
  taxes: {
    federalIncomeTax: number;
    socialSecurity: number;
    medicare: number;
    additionalMedicare: number;
    californiaStateTax: number;
    sdi: number;
  };
}

// ============= Background Processing Interfaces =============
interface PayrollTaxJob {
  employee_id: string;
  pay_period_start: string;
  pay_period_end: string;
  pay_date: string;
  gross_wages: number;
  pay_frequency: 'weekly' | 'biweekly' | 'semi-monthly' | 'monthly';
  employee_location: string;
  payroll_run_id?: string;
  is_preview?: boolean;
}

interface TaxCalculationResult {
  employee_id: string;
  payroll_run_id?: string;
  federal_income_tax: number;
  social_security_employee: number;
  medicare_employee: number;
  medicare_additional: number;
  ca_state_tax: number;
  ca_sdi: number;
  social_security_employer: number;
  medicare_employer: number;
  calculation_metadata: {
    engine_version: string;
    rule_set_id: string;
    source: string;
    timestamp: string;
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

    const { jobs }: { jobs: PayrollTaxJob[] } = await req.json();
    console.log(`Processing ${jobs.length} payroll tax calculation jobs`);

    const results: TaxCalculationResult[] = [];

    for (const job of jobs) {
      console.log(`Processing tax calculation for employee ${job.employee_id}`);
      
      try {
        // Determine tax year from pay date
        const payDate = new Date(job.pay_date);
        const taxYear = payDate.getFullYear();
        
        console.log(`Using tax year ${taxYear} for pay date ${job.pay_date}`);
        
        // Initialize tax engine for the appropriate year
        const taxEngine = new TaxEngine(supabase, taxYear);

        // Get employee tax profile for W-4 information
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select(`
            id,
            first_name,
            last_name,
            employee_tax_profiles (
              filing_status,
              federal_allowances,
              state_allowances,
              extra_withholding,
              step_2_checkbox
            )
          `)
          .eq('id', job.employee_id)
          .single();

        if (employeeError || !employeeData) {
          throw new Error(`Employee not found: ${job.employee_id}`);
        }

        const taxProfile = employeeData.employee_tax_profiles?.[0];
        
        // Get YTD accumulator data
        const { data: ytdData, error: ytdError } = await supabase
          .from('payroll_ytd_accumulators')
          .select('*')
          .eq('employee_id', job.employee_id)
          .eq('tax_year', taxYear);

        if (ytdError) {
          console.error('Error fetching YTD data:', ytdError);
        }

        // Calculate current YTD totals
        const ytdTotals = ytdData?.reduce((acc, record) => {
          acc[record.tax_type] = {
            ytd_taxable_wages: record.ytd_taxable_wages || 0,
            ytd_withheld: record.ytd_withheld || 0
          };
          return acc;
        }, {} as Record<string, { ytd_taxable_wages: number; ytd_withheld: number }>);

        // Prepare tax calculation input
        const taxInput = {
          grossPay: job.gross_wages,
          payFrequency: job.pay_frequency,
          year: taxYear,
          federal: {
            filingStatus: (taxProfile?.filing_status as 'single' | 'married' | 'head') || 'single',
            step2Checkbox: taxProfile?.step_2_checkbox || false,
            dependents: taxProfile?.federal_allowances || 0,
            extraWithholding: taxProfile?.extra_withholding || 0,
          },
          california: {
            allowances: taxProfile?.state_allowances || 0,
            extraWithholding: 0,
          }
        };

        // Calculate taxes using dynamic TaxIQ engine
        const taxResult = await taxEngine.calculateTaxes(taxInput);

        // Calculate employer portions (match employee FICA)
        const employerSocialSecurity = taxResult.taxes.socialSecurity;
        const employerMedicare = taxResult.taxes.medicare;

        const calculationResult: TaxCalculationResult = {
          employee_id: job.employee_id,
          payroll_run_id: job.payroll_run_id,
          federal_income_tax: taxResult.taxes.federalIncomeTax,
          social_security_employee: taxResult.taxes.socialSecurity,
          medicare_employee: taxResult.taxes.medicare,
          medicare_additional: taxResult.taxes.additionalMedicare,
          ca_state_tax: taxResult.taxes.californiaStateTax,
          ca_sdi: taxResult.taxes.sdi,
          social_security_employer: employerSocialSecurity,
          medicare_employer: employerMedicare,
          calculation_metadata: {
            engine_version: '2.0.0',
            rule_set_id: `TAX_YEAR_${taxYear}`,
            source: taxYear === 2025 ? 'IRS_15T_2025_CA_FTB_2025' : 'IRS_15T_2024_CA_DE44_2024',
            timestamp: new Date().toISOString()
          }
        };

        // Store tax calculation result
        if (!job.is_preview) {
          const { error: insertError } = await supabase
            .from('tax_calculations')
            .insert({
              employee_id: job.employee_id,
              payroll_run_id: job.payroll_run_id,
              pay_period_start: job.pay_period_start,
              pay_period_end: job.pay_period_end,
              pay_date: job.pay_date,
              gross_wages: job.gross_wages,
              federal_income_tax: calculationResult.federal_income_tax,
              state_income_tax: calculationResult.ca_state_tax,
              social_security_employee: calculationResult.social_security_employee,
              medicare_employee: calculationResult.medicare_employee,
              medicare_additional: calculationResult.medicare_additional,
              state_disability_insurance: calculationResult.ca_sdi,
              social_security_employer: calculationResult.social_security_employer,
              medicare_employer: calculationResult.medicare_employer,
              calculation_details: calculationResult.calculation_metadata,
              engine_version: calculationResult.calculation_metadata.engine_version,
              rule_set_id: calculationResult.calculation_metadata.rule_set_id
            });

          if (insertError) {
            console.error('Error storing tax calculation:', insertError);
            throw insertError;
          }

          // Update YTD accumulators using dynamic wage base
          const socialSecurityWageBase = await taxEngine.getTaxRate('fica_social_security');
          const { data: ssWageBaseData } = await supabase
            .from('tax_rate_archives')
            .select('wage_base')
            .eq('tax_year', taxYear)
            .eq('rate_type', 'fica_social_security')
            .single();
          
          const currentSSWageBase = ssWageBaseData?.wage_base || (taxYear === 2025 ? 176100 : 168600);

          const newYtdTaxableWages = (ytdTotals?.federal_income_tax?.ytd_taxable_wages || 0) + job.gross_wages;
          const newYtdWithheld = (ytdTotals?.federal_income_tax?.ytd_withheld || 0) + calculationResult.federal_income_tax;

          const ytdUpdates = [
            {
              employee_id: job.employee_id,
              tax_type: 'federal_income_tax',
              tax_year: taxYear,
              ytd_taxable_wages: newYtdTaxableWages,
              ytd_withheld: newYtdWithheld,
              last_updated: new Date().toISOString()
            },
            {
              employee_id: job.employee_id,
              tax_type: 'ca_state_tax',
              tax_year: taxYear,
              ytd_taxable_wages: newYtdTaxableWages,
              ytd_withheld: (ytdTotals?.ca_state_tax?.ytd_withheld || 0) + calculationResult.ca_state_tax,
              last_updated: new Date().toISOString()
            },
            {
              employee_id: job.employee_id,
              tax_type: 'social_security',
              tax_year: taxYear,
              ytd_taxable_wages: Math.min(newYtdTaxableWages, currentSSWageBase),
              ytd_withheld: (ytdTotals?.social_security?.ytd_withheld || 0) + calculationResult.social_security_employee,
              last_updated: new Date().toISOString()
            }
          ];

          const { error: ytdError } = await supabase
            .from('payroll_ytd_accumulators')
            .upsert(ytdUpdates, { 
              onConflict: 'employee_id,tax_type,tax_year',
              ignoreDuplicates: false 
            });

          if (ytdError) {
            console.error('Error updating YTD accumulators:', ytdError);
          }
        }

        results.push(calculationResult);
        console.log(`Successfully processed tax calculation for employee ${job.employee_id} using ${taxYear} tax tables`);

      } catch (error) {
        console.error(`Error processing tax calculation for employee ${job.employee_id}:`, error);
        
        // Store error in failed jobs log
        await supabase
          .from('background_job_logs')
          .insert({
            job_type: 'payroll_tax_calculation',
            status: 'failed',
            job_data: job,
            error_message: error.message,
            processed_at: new Date().toISOString()
          });

        // Continue processing other jobs
        continue;
      }
    }

    // Log successful completion
    await supabase
      .from('background_job_logs')
      .insert({
        job_type: 'payroll_tax_calculation_batch',
        status: 'completed',
        job_data: { jobs_count: jobs.length, results_count: results.length },
        processed_at: new Date().toISOString()
      });

    return new Response(JSON.stringify({
      success: true,
      processed_count: results.length,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Payroll tax processing error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});