/**
 * Tax Filings Hook
 * Manages tax filings state and operations
 */

import { useState, useEffect } from 'react';
import { TaxFilingService } from '../services/TaxFilingService';
import type { UseTaxFilingsReturn, TaxFiling, TaxFilingResponse } from '../types';

export function useTaxFilings(companyId: string, filters?: {
  year?: number;
  quarter?: number;
  agency?: string;
  status?: string;
}): UseTaxFilingsReturn {
  const [filings, setFilings] = useState<TaxFiling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      loadFilings();
    }
  }, [companyId, filters]);

  const loadFilings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TaxFilingService.getFilings(companyId, filters);
      setFilings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tax filings');
    } finally {
      setLoading(false);
    }
  };

  const createFiling = async (data: Omit<TaxFiling, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const created = await TaxFilingService.createFiling(data);
      setFilings(prev => [created, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tax filing');
      throw err;
    }
  };

  const updateFiling = async (id: string, data: Partial<TaxFiling>) => {
    try {
      setError(null);
      const updated = await TaxFilingService.updateFiling(id, data);
      setFilings(prev => prev.map(filing => 
        filing.id === id ? updated : filing
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tax filing');
      throw err;
    }
  };

  const submitFiling = async (id: string): Promise<TaxFilingResponse> => {
    try {
      setError(null);
      const response = await TaxFilingService.submitFiling(id);
      
      // Refresh the filing to get updated status
      const updated = await TaxFilingService.getFiling(id);
      if (updated) {
        setFilings(prev => prev.map(filing => 
          filing.id === id ? updated : filing
        ));
      }
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit tax filing');
      throw err;
    }
  };

  const deleteFiling = async (id: string) => {
    try {
      setError(null);
      await TaxFilingService.deleteFiling(id);
      setFilings(prev => prev.filter(filing => filing.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tax filing');
      throw err;
    }
  };

  return {
    filings,
    loading,
    error,
    createFiling,
    updateFiling,
    submitFiling,
    deleteFiling
  };
}