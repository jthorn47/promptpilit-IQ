// TaxIQ Utility Functions - Dynamic Tax System (Database-Driven)
// This file provides backwards compatibility while migrating to database-driven tax rules

import { 
  getTaxRateDynamic, 
  getWageBaseDynamic, 
  getFederalTaxBracketsDynamic, 
  getStateTaxBracketsDynamic 
} from './utils-database';
import { 
  roundToCents, 
  applyWageBaseCap, 
  calculateBracketTax,
  TAX_YEAR_2024 
} from './utils-legacy';

// Re-export utility functions
export { roundToCents, applyWageBaseCap, calculateBracketTax, TAX_YEAR_2024 };

/**
 * Get tax rate from database by year and type
 */
export async function getTaxRate(taxYear: number, rateType: string): Promise<number> {
  return getTaxRateDynamic(taxYear, rateType);
}

/**
 * Get wage base from database by year and type
 */
export async function getWageBase(taxYear: number, rateType: string): Promise<number> {
  return getWageBaseDynamic(taxYear, rateType);
}

/**
 * Get federal tax brackets from database
 */
export async function getFederalTaxBrackets(taxYear: number, filingStatus: string) {
  return getFederalTaxBracketsDynamic(taxYear, filingStatus);
}

/**
 * Get state tax brackets from database
 */
export async function getStateTaxBrackets(taxYear: number, state: string, filingStatus: string) {
  return getStateTaxBracketsDynamic(taxYear, state, filingStatus);
}