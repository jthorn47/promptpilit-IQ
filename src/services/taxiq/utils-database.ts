// TaxIQ Database Utility Functions - Dynamic Tax System 
// This file contains database-driven tax utilities that don't rely on hardcoded Supabase types

/**
 * Get tax rate from database using dynamic queries
 */
export async function getTaxRateDynamic(taxYear: number, rateType: string): Promise<number> {
  try {
    // Use fetch to call edge function since new tables aren't in types yet
    const response = await fetch(`https://xfamotequcavggiqndfj.supabase.co/functions/v1/taxiq-validation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw`
      },
      body: JSON.stringify({
        action: 'get_tax_rate',
        taxYear,
        rateType
      })
    });

    if (!response.ok) {
      console.error(`Error fetching tax rate ${rateType} for year ${taxYear}`);
      return 0;
    }

    const result = await response.json();
    return Number(result.rate_value || 0);
  } catch (error) {
    console.error(`Error fetching tax rate ${rateType} for year ${taxYear}:`, error);
    return 0;
  }
}

/**
 * Get wage base from database using dynamic queries
 */
export async function getWageBaseDynamic(taxYear: number, rateType: string): Promise<number> {
  try {
    const response = await fetch(`https://xfamotequcavggiqndfj.supabase.co/functions/v1/taxiq-validation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw`
      },
      body: JSON.stringify({
        action: 'get_wage_base',
        taxYear,
        rateType
      })
    });

    if (!response.ok) {
      // Return fallback values based on year
      if (taxYear === 2025) {
        return rateType === 'fica_social_security' ? 176100 : 168600;
      }
      return rateType === 'fica_social_security' ? 168600 : 153164;
    }

    const result = await response.json();
    return Number(result.wage_base || 0);
  } catch (error) {
    console.error(`Error fetching wage base ${rateType} for year ${taxYear}:`, error);
    // Return fallback values based on year
    if (taxYear === 2025) {
      return rateType === 'fica_social_security' ? 176100 : 168600;
    }
    return rateType === 'fica_social_security' ? 168600 : 153164;
  }
}

/**
 * Get federal tax brackets from database using dynamic queries
 */
export async function getFederalTaxBracketsDynamic(taxYear: number, filingStatus: string) {
  try {
    const response = await fetch(`https://xfamotequcavggiqndfj.supabase.co/functions/v1/taxiq-validation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw`
      },
      body: JSON.stringify({
        action: 'get_federal_brackets',
        taxYear,
        filingStatus
      })
    });

    if (!response.ok) {
      console.error(`Error fetching federal tax brackets for ${filingStatus} in ${taxYear}`);
      return [];
    }

    const result = await response.json();
    return result.brackets || [];
  } catch (error) {
    console.error(`Error fetching federal tax brackets for ${filingStatus} in ${taxYear}:`, error);
    return [];
  }
}

/**
 * Get state tax brackets from database using dynamic queries
 */
export async function getStateTaxBracketsDynamic(taxYear: number, state: string, filingStatus: string) {
  try {
    const response = await fetch(`https://xfamotequcavggiqndfj.supabase.co/functions/v1/taxiq-validation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw`
      },
      body: JSON.stringify({
        action: 'get_state_brackets',
        taxYear,
        state,
        filingStatus
      })
    });

    if (!response.ok) {
      console.error(`Error fetching state tax brackets for ${state} ${filingStatus} in ${taxYear}`);
      return [];
    }

    const result = await response.json();
    return result.brackets || [];
  } catch (error) {
    console.error(`Error fetching state tax brackets for ${state} ${filingStatus} in ${taxYear}:`, error);
    return [];
  }
}