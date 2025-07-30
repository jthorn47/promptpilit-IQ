// TaxIQ Test Suite - Fixed async/await issues

import { calculateTaxesDynamic } from './calculate';
import { TaxInput } from './types';

// Test data
const testInput: TaxInput = {
  grossPay: 5000,
  payFrequency: 'monthly',
  year: 2025,
  federal: {
    filingStatus: 'single',
    step2Checkbox: false,
    dependents: 0,
    extraWithholding: 0,
  },
  california: {
    allowances: 0,
    extraWithholding: 0,
  },
};

export async function runTaxTests() {
  console.log('Running TaxIQ tests...');
  
  try {
    const result = await calculateTaxesDynamic(testInput);
    console.log('Tax calculation result:', {
      netPay: result.netPay,
      taxes: result.taxes
    });
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Tax calculation test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}