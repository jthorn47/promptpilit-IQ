import type { Currency } from '../types';

// Common currencies
export const CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 }
};

export interface CurrencyFormatOptions {
  currency?: string;
  showSymbol?: boolean;
  showCode?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
}

export const formatCurrency = (
  amount: number,
  options: CurrencyFormatOptions = {}
): string => {
  const {
    currency = 'USD',
    showSymbol = true,
    showCode = false,
    minimumFractionDigits,
    maximumFractionDigits,
    locale = 'en-US'
  } = options;

  const currencyInfo = CURRENCIES[currency] || CURRENCIES.USD;
  
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: showSymbol ? currency : undefined,
      minimumFractionDigits: minimumFractionDigits ?? currencyInfo.decimals,
      maximumFractionDigits: maximumFractionDigits ?? currencyInfo.decimals
    });

    let formatted = formatter.format(amount);
    
    if (showCode && !showSymbol) {
      formatted += ` ${currency}`;
    }
    
    return formatted;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currencyInfo.symbol}${amount.toFixed(currencyInfo.decimals)}`;
  }
};

export const parseCurrencyString = (currencyString: string): number => {
  // Remove currency symbols, spaces, and non-numeric characters except decimal point and negative sign
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatCurrencyCompact = (amount: number, currency = 'USD'): string => {
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1000000) {
    return formatCurrency(amount / 1000000, { currency, maximumFractionDigits: 1 }) + 'M';
  }
  
  if (absAmount >= 1000) {
    return formatCurrency(amount / 1000, { currency, maximumFractionDigits: 1 }) + 'K';
  }
  
  return formatCurrency(amount, { currency });
};

export const calculateCurrencyConversion = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number => {
  // In a real implementation, you would fetch exchange rates from an API
  // This is a placeholder for the conversion logic
  return amount * exchangeRate;
};