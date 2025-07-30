/**
 * Tax Payments Hook
 * Manages tax payments state and operations
 */

import { useState, useEffect } from 'react';
import { TaxPaymentService } from '../services/TaxPaymentService';
import type { UseTaxPaymentsReturn, TaxPayment, TaxPaymentResponse } from '../types';

export function useTaxPayments(companyId: string, filters?: {
  status?: string;
  agency?: string;
  startDate?: string;
  endDate?: string;
}): UseTaxPaymentsReturn {
  const [payments, setPayments] = useState<TaxPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      loadPayments();
    }
  }, [companyId, filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TaxPaymentService.getPayments(companyId, filters);
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tax payments');
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (data: Omit<TaxPayment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const created = await TaxPaymentService.createPayment(data);
      setPayments(prev => [created, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tax payment');
      throw err;
    }
  };

  const updatePayment = async (id: string, data: Partial<TaxPayment>) => {
    try {
      setError(null);
      const updated = await TaxPaymentService.updatePayment(id, data);
      setPayments(prev => prev.map(payment => 
        payment.id === id ? updated : payment
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tax payment');
      throw err;
    }
  };

  const processPayment = async (id: string): Promise<TaxPaymentResponse> => {
    try {
      setError(null);
      const response = await TaxPaymentService.processPayment(id);
      
      // Refresh the payment to get updated status
      const updated = await TaxPaymentService.getPayment(id);
      if (updated) {
        setPayments(prev => prev.map(payment => 
          payment.id === id ? updated : payment
        ));
      }
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process tax payment');
      throw err;
    }
  };

  const cancelPayment = async (id: string) => {
    try {
      setError(null);
      await TaxPaymentService.cancelPayment(id);
      
      // Update the payment status locally
      setPayments(prev => prev.map(payment => 
        payment.id === id ? { ...payment, status: 'cancelled' } : payment
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel tax payment');
      throw err;
    }
  };

  return {
    payments,
    loading,
    error,
    createPayment,
    updatePayment,
    processPayment,
    cancelPayment
  };
}