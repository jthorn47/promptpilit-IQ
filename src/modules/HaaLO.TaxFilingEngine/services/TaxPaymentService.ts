/**
 * Tax Payment Service
 * Manages tax payments, scheduling, and processing
 */

import { supabase } from '@/integrations/supabase/client';
import type { TaxPayment, TaxPaymentResponse } from '../types';

export class TaxPaymentService {
  /**
   * Get tax payments for a company
   */
  static async getPayments(companyId: string, filters?: {
    status?: string;
    agency?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TaxPayment[]> {
    let query = supabase
      .from('tax_payments')
      .select('*')
      .eq('company_id', companyId)
      .order('due_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.agency) {
      query = query.eq('agency', filters.agency);
    }
    if (filters?.startDate) {
      query = query.gte('due_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('due_date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tax payments:', error);
      throw new Error('Failed to fetch tax payments');
    }

    return data.map(this.mapDatabaseToPayment);
  }

  /**
   * Get single tax payment
   */
  static async getPayment(id: string): Promise<TaxPayment | null> {
    const { data, error } = await supabase
      .from('tax_payments')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching tax payment:', error);
      throw new Error('Failed to fetch tax payment');
    }

    return data ? this.mapDatabaseToPayment(data) : null;
  }

  /**
   * Create new tax payment
   */
  static async createPayment(payment: Omit<TaxPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaxPayment> {
    const { data, error } = await supabase
      .from('tax_payments')
      .insert({
        company_id: payment.companyId,
        filing_id: payment.filingId,
        payment_type: payment.paymentType,
        agency: payment.agency,
        jurisdiction: payment.jurisdiction,
        payment_amount: payment.paymentAmount,
        payment_method: payment.paymentMethod,
        due_date: payment.dueDate,
        scheduled_date: payment.scheduledDate,
        status: payment.status,
        bank_account_id: payment.bankAccountId,
        created_by: payment.createdBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tax payment:', error);
      throw new Error('Failed to create tax payment');
    }

    return this.mapDatabaseToPayment(data);
  }

  /**
   * Update tax payment
   */
  static async updatePayment(id: string, updates: Partial<TaxPayment>): Promise<TaxPayment> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.paymentAmount !== undefined) updateData.payment_amount = updates.paymentAmount;
    if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
    if (updates.scheduledDate !== undefined) updateData.scheduled_date = updates.scheduledDate;
    if (updates.paymentDate !== undefined) updateData.payment_date = updates.paymentDate;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.confirmationNumber !== undefined) updateData.confirmation_number = updates.confirmationNumber;
    if (updates.traceNumber !== undefined) updateData.trace_number = updates.traceNumber;
    if (updates.paymentResponse !== undefined) updateData.payment_response = updates.paymentResponse;

    const { data, error } = await supabase
      .from('tax_payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tax payment:', error);
      throw new Error('Failed to update tax payment');
    }

    return this.mapDatabaseToPayment(data);
  }

  /**
   * Process tax payment
   */
  static async processPayment(id: string): Promise<TaxPaymentResponse> {
    try {
      // Get the payment details
      const payment = await this.getPayment(id);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update status to pending
      await this.updatePayment(id, {
        status: 'pending'
      });

      // Process payment through appropriate gateway
      const response = await this.callPaymentAPI(payment);

      // Update payment with response
      await this.updatePayment(id, {
        status: response.success ? 'completed' : 'failed',
        paymentDate: response.success ? new Date().toISOString() : undefined,
        confirmationNumber: response.confirmationNumber,
        traceNumber: response.traceNumber,
        paymentResponse: response
      });

      return response;
    } catch (error) {
      console.error('Error processing tax payment:', error);
      
      // Update status to failed
      await this.updatePayment(id, {
        status: 'failed'
      });

      throw new Error('Failed to process tax payment');
    }
  }

  /**
   * Schedule recurring payments for a company
   */
  static async scheduleRecurringPayments(
    companyId: string,
    config: {
      paymentType: string;
      agency: string;
      frequency: 'monthly' | 'quarterly' | 'semi-weekly';
      amount?: number;
      startDate: string;
      endDate: string;
    }
  ): Promise<TaxPayment[]> {
    const payments: TaxPayment[] = [];
    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);

    // Calculate payment dates based on frequency
    const paymentDates = this.calculatePaymentDates(config.frequency, startDate, endDate);

    for (const date of paymentDates) {
      const payment = await this.createPayment({
        companyId,
        paymentType: config.paymentType,
        agency: config.agency,
        jurisdiction: config.agency === 'IRS' ? 'federal' : 'state',
        paymentAmount: config.amount || 0,
        paymentMethod: 'ach',
        dueDate: date.toISOString().split('T')[0],
        scheduledDate: date.toISOString().split('T')[0],
        status: 'scheduled'
      });
      payments.push(payment);
    }

    return payments;
  }

  /**
   * Cancel tax payment
   */
  static async cancelPayment(id: string): Promise<void> {
    const payment = await this.getPayment(id);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'completed') {
      throw new Error('Cannot cancel completed payment');
    }

    await this.updatePayment(id, {
      status: 'cancelled'
    });
  }

  /**
   * Get payment summary for a period
   */
  static async getPaymentSummary(
    companyId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalScheduled: number;
    totalCompleted: number;
    totalPending: number;
    totalFailed: number;
    byAgency: Record<string, number>;
  }> {
    const payments = await this.getPayments(companyId, { startDate, endDate });

    const summary = {
      totalScheduled: 0,
      totalCompleted: 0,
      totalPending: 0,
      totalFailed: 0,
      byAgency: {} as Record<string, number>
    };

    payments.forEach(payment => {
      switch (payment.status) {
        case 'scheduled':
          summary.totalScheduled += payment.paymentAmount;
          break;
        case 'completed':
          summary.totalCompleted += payment.paymentAmount;
          break;
        case 'pending':
          summary.totalPending += payment.paymentAmount;
          break;
        case 'failed':
          summary.totalFailed += payment.paymentAmount;
          break;
      }

      summary.byAgency[payment.agency] = (summary.byAgency[payment.agency] || 0) + payment.paymentAmount;
    });

    return summary;
  }

  /**
   * Calculate payment dates based on frequency
   */
  private static calculatePaymentDates(
    frequency: 'monthly' | 'quarterly' | 'semi-weekly',
    startDate: Date,
    endDate: Date
  ): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      dates.push(new Date(current));

      switch (frequency) {
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'quarterly':
          current.setMonth(current.getMonth() + 3);
          break;
        case 'semi-weekly':
          current.setDate(current.getDate() + 14);
          break;
      }
    }

    return dates;
  }

  /**
   * Call payment processing API (placeholder implementation)
   */
  private static async callPaymentAPI(payment: TaxPayment): Promise<TaxPaymentResponse> {
    // This would integrate with actual payment processor
    // For now, return a mock successful response
    return {
      success: true,
      confirmationNumber: `PAY-${Date.now()}`,
      traceNumber: `TRC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'completed',
      processedAt: new Date().toISOString()
    };
  }

  /**
   * Map database row to TaxPayment object
   */
  private static mapDatabaseToPayment(data: any): TaxPayment {
    return {
      id: data.id,
      companyId: data.company_id,
      filingId: data.filing_id,
      paymentType: data.payment_type,
      agency: data.agency,
      jurisdiction: data.jurisdiction,
      paymentAmount: data.payment_amount || 0,
      paymentMethod: data.payment_method,
      dueDate: data.due_date,
      scheduledDate: data.scheduled_date,
      paymentDate: data.payment_date,
      status: data.status,
      bankAccountId: data.bank_account_id,
      confirmationNumber: data.confirmation_number,
      traceNumber: data.trace_number,
      paymentResponse: data.payment_response,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    };
  }
}