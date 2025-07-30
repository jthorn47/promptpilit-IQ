import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TaxJurisdictionValidationRequest {
  employee_id: string;
  primary_work_jurisdiction?: string;
  remote_work_jurisdiction?: string;
  residency_jurisdiction?: string;
  dual_tax_scenario?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
  compliance_status: 'compliant' | 'warning' | 'non_compliant';
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

    const { employee_id, primary_work_jurisdiction, remote_work_jurisdiction, residency_jurisdiction, dual_tax_scenario } = await req.json() as TaxJurisdictionValidationRequest;

    console.log('Validating tax jurisdiction for employee:', employee_id);

    const result: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      suggestions: [],
      compliance_status: 'compliant'
    };

    // Validate primary work jurisdiction
    if (!primary_work_jurisdiction) {
      result.errors.push('Primary work jurisdiction is required for tax compliance');
      result.isValid = false;
    } else {
      const isValidJurisdiction = await validateJurisdictionCode(primary_work_jurisdiction);
      if (!isValidJurisdiction) {
        result.errors.push(`Invalid or unsupported jurisdiction code: ${primary_work_jurisdiction}`);
        result.isValid = false;
      }
    }

    // Validate remote work jurisdiction if specified
    if (remote_work_jurisdiction) {
      const isValidRemoteJurisdiction = await validateJurisdictionCode(remote_work_jurisdiction);
      if (!isValidRemoteJurisdiction) {
        result.warnings.push(`Remote work jurisdiction ${remote_work_jurisdiction} may not be fully supported`);
      }

      // Check for potential dual tax obligations
      if (remote_work_jurisdiction !== primary_work_jurisdiction) {
        const reciprocityExists = await checkReciprocityAgreement(primary_work_jurisdiction, remote_work_jurisdiction);
        if (!reciprocityExists) {
          result.warnings.push(`No reciprocity agreement found between ${primary_work_jurisdiction} and ${remote_work_jurisdiction}. Employee may be subject to dual taxation.`);
          result.suggestions.push('Consider enabling dual tax scenario for this employee');
        }
      }
    }

    // Validate residency jurisdiction
    if (residency_jurisdiction && residency_jurisdiction !== primary_work_jurisdiction) {
      const residencyValid = await validateJurisdictionCode(residency_jurisdiction);
      if (!residencyValid) {
        result.warnings.push(`Residency jurisdiction ${residency_jurisdiction} may require manual tax setup`);
      }
    }

    // Check for international tax implications
    const jurisdictions = [primary_work_jurisdiction, remote_work_jurisdiction, residency_jurisdiction].filter(Boolean);
    const uniqueCountries = await getCountriesFromJurisdictions(jurisdictions);
    
    if (uniqueCountries.length > 1) {
      result.warnings.push('International tax obligations detected. Consider consulting with tax specialist.');
      result.suggestions.push('Review tax treaty benefits and international withholding requirements');
      
      // Check if dual tax scenario is configured
      if (!dual_tax_scenario) {
        result.suggestions.push('Enable dual tax scenario to properly handle international tax obligations');
      }
    }

    // Validate state-specific requirements
    if (primary_work_jurisdiction) {
      const stateRequirements = await getStateSpecificRequirements(primary_work_jurisdiction);
      if (stateRequirements.length > 0) {
        result.suggestions.push(...stateRequirements);
      }
    }

    // Check for missing tax setup
    const { data: employeeTaxData } = await supabase
      .from('employees')
      .select('tax_profile')
      .eq('id', employee_id)
      .single();

    if (!employeeTaxData?.tax_profile) {
      result.errors.push('Employee tax profile is incomplete');
      result.isValid = false;
    }

    // Determine overall compliance status
    if (result.errors.length > 0) {
      result.compliance_status = 'non_compliant';
    } else if (result.warnings.length > 0) {
      result.compliance_status = 'warning';
    } else {
      result.compliance_status = 'compliant';
    }

    console.log('Validation completed:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error validating tax jurisdiction:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        isValid: false,
        compliance_status: 'non_compliant'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function validateJurisdictionCode(jurisdictionCode: string): Promise<boolean> {
  // US States
  const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ];

  // Canadian Provinces
  const canadianProvinces = [
    'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK', 'NT', 'NU', 'YT'
  ];

  // Countries
  const countries = [
    'US', 'CA', 'UK', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'IE', 'DK', 'SE', 'NO', 'FI', 'IS', 'LU', 'PT', 'GR', 'CY', 'MT', 'SI', 'SK', 'CZ', 'HU', 'PL', 'EE', 'LV', 'LT', 'BG', 'RO', 'HR', 'JP', 'KR', 'SG', 'HK', 'NZ', 'MX', 'BR', 'AR', 'CL', 'IN', 'CN'
  ];

  return usStates.includes(jurisdictionCode) || 
         canadianProvinces.includes(jurisdictionCode) || 
         countries.includes(jurisdictionCode);
}

async function checkReciprocityAgreement(jurisdiction1: string, jurisdiction2: string): Promise<boolean> {
  // Simplified reciprocity checking
  // In production, this would query a comprehensive database of reciprocity agreements
  
  const reciprocityMap: Record<string, string[]> = {
    // Some common US state reciprocity agreements
    'PA': ['IN', 'MD', 'NJ', 'OH', 'VA', 'WV'],
    'MD': ['PA', 'VA', 'WV', 'DC'],
    'VA': ['KY', 'MD', 'PA', 'WV', 'DC'],
    'OH': ['IN', 'KY', 'MI', 'PA', 'WV'],
    'IN': ['KY', 'MI', 'OH', 'PA', 'WI'],
    'KY': ['IL', 'IN', 'MI', 'OH', 'VA', 'WV', 'WI'],
    // Add more as needed
  };

  return reciprocityMap[jurisdiction1]?.includes(jurisdiction2) || 
         reciprocityMap[jurisdiction2]?.includes(jurisdiction1) || 
         false;
}

async function getCountriesFromJurisdictions(jurisdictions: string[]): Promise<string[]> {
  const countries = new Set<string>();
  
  for (const jurisdiction of jurisdictions) {
    if (['US', 'CA', 'UK', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'IE', 'DK', 'SE', 'NO', 'FI'].includes(jurisdiction)) {
      countries.add(jurisdiction);
    } else if (['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'].includes(jurisdiction)) {
      countries.add('US');
    } else if (['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'PE', 'QC', 'SK', 'NT', 'NU', 'YT'].includes(jurisdiction)) {
      countries.add('CA');
    }
  }
  
  return Array.from(countries);
}

async function getStateSpecificRequirements(jurisdiction: string): Promise<string[]> {
  const requirements: string[] = [];
  
  // State-specific tax requirements
  switch (jurisdiction) {
    case 'CA':
      requirements.push('California requires SDI (State Disability Insurance) withholding');
      requirements.push('Consider Employment Training Tax (ETT) for employers');
      break;
    case 'NY':
      requirements.push('New York requires SDI withholding');
      requirements.push('Check for local tax obligations (NYC, Yonkers)');
      break;
    case 'PA':
      requirements.push('Pennsylvania has local earned income tax requirements');
      break;
    case 'OH':
      requirements.push('Ohio has local income tax obligations for many municipalities');
      break;
    case 'NJ':
      requirements.push('New Jersey requires SDI/TDI withholding');
      break;
    // Add more state-specific requirements
  }
  
  return requirements;
}