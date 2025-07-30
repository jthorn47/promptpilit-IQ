import { TaxInput, TaxOutput } from "./types";
import { calculateFederalIncomeTax } from "./fit";
import { calculateFICA } from "./fica";
import { calculateCaliforniaStateTax, calculateCaliforniaSDI } from "./ca-tax";
import { getTaxRate } from "./utils";

export async function calculateTaxes(input: TaxInput): Promise<TaxOutput> {
  // Note: This function now uses dynamic tax year selection
  // For new implementations, use the edge function which handles year-based rules automatically
  console.warn('calculateTaxes: Consider using the process-payroll-taxes edge function for dynamic tax year support');
  
  const federalIncomeTax = calculateFederalIncomeTax(input);
  const { socialSecurity, medicare, additionalMedicare } = calculateFICA(input);
  
  // Calculate annual gross pay for CA state tax calculation
  const multiplier = input.payFrequency === 'weekly' ? 52 :
    input.payFrequency === 'biweekly' ? 26 :
    input.payFrequency === 'semi-monthly' ? 24 : 12;
  const annualGrossPay = input.grossPay * multiplier;
  
  const caResult = calculateCaliforniaStateTax(input, annualGrossPay);
  const sdiResult = calculateCaliforniaSDI(input);

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

// Enhanced function for dynamic tax year calculations (recommended)
export async function calculateTaxesDynamic(input: TaxInput): Promise<TaxOutput> {
  // This function uses database-driven tax rules based on the input year
  const taxYear = input.year || new Date().getFullYear();
  
  try {
    // Call the edge function for accurate, year-based calculations
    const response = await fetch(`https://xfamotequcavggiqndfj.supabase.co/functions/v1/process-payroll-taxes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw`
      },
      body: JSON.stringify({
        jobs: [{
          employee_id: 'preview',
          pay_period_start: new Date().toISOString().split('T')[0],
          pay_period_end: new Date().toISOString().split('T')[0],
          pay_date: new Date().toISOString().split('T')[0],
          gross_wages: input.grossPay,
          pay_frequency: input.payFrequency,
          employee_location: 'CA',
          is_preview: true
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Edge function call failed');
    }

    const result = await response.json();
    const calculation = result.results?.[0];

    if (!calculation) {
      throw new Error('No calculation result returned');
    }

    return {
      netPay: input.grossPay - (
        calculation.federal_income_tax +
        calculation.social_security_employee +
        calculation.medicare_employee +
        calculation.medicare_additional +
        calculation.ca_state_tax +
        calculation.ca_sdi
      ),
      taxes: {
        federalIncomeTax: calculation.federal_income_tax,
        socialSecurity: calculation.social_security_employee,
        medicare: calculation.medicare_employee,
        additionalMedicare: calculation.medicare_additional,
        californiaStateTax: calculation.ca_state_tax,
        sdi: calculation.ca_sdi,
      },
    };
  } catch (error) {
    console.error('Dynamic tax calculation failed, falling back to legacy method:', error);
    // Fallback to legacy calculation
    return calculateTaxes(input);
  }
}

// Legacy function for backwards compatibility
export async function calculateGrossToNet(input: TaxInput): Promise<TaxOutput> {
  return await calculateTaxes(input);
}