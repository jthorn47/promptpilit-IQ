/**
 * Tax Filing Service
 * Manages tax filings, submissions, and e-filing
 */

import { supabase } from '@/integrations/supabase/client';
import type { TaxFiling, TaxFilingResponse, Form941Data, Form940Data } from '../types';

export class TaxFilingService {
  /**
   * Get tax filings for a company
   */
  static async getFilings(companyId: string, filters?: {
    year?: number;
    quarter?: number;
    agency?: string;
    status?: string;
  }): Promise<TaxFiling[]> {
    let query = supabase
      .from('tax_filings')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (filters?.year) {
      query = query.eq('tax_year', filters.year);
    }
    if (filters?.quarter) {
      query = query.eq('tax_quarter', filters.quarter);
    }
    if (filters?.agency) {
      query = query.eq('agency', filters.agency);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tax filings:', error);
      throw new Error('Failed to fetch tax filings');
    }

    return data.map(this.mapDatabaseToFiling);
  }

  /**
   * Get single tax filing
   */
  static async getFiling(id: string): Promise<TaxFiling | null> {
    const { data, error } = await supabase
      .from('tax_filings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching tax filing:', error);
      throw new Error('Failed to fetch tax filing');
    }

    return data ? this.mapDatabaseToFiling(data) : null;
  }

  /**
   * Create new tax filing
   */
  static async createFiling(filing: Omit<TaxFiling, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaxFiling> {
    const { data, error } = await supabase
      .from('tax_filings')
      .insert({
        company_id: filing.companyId,
        calendar_entry_id: filing.calendarEntryId,
        filing_type: filing.filingType,
        agency: filing.agency,
        jurisdiction: filing.jurisdiction,
        tax_year: filing.taxYear,
        tax_quarter: filing.taxQuarter,
        period_start_date: filing.periodStartDate,
        period_end_date: filing.periodEndDate,
        filing_data: filing.filingData,
        calculated_liability: filing.calculatedLiability,
        total_tax_due: filing.totalTaxDue,
        status: filing.status,
        submitted_by: filing.submittedBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tax filing:', error);
      throw new Error('Failed to create tax filing');
    }

    return this.mapDatabaseToFiling(data);
  }

  /**
   * Update tax filing
   */
  static async updateFiling(id: string, updates: Partial<TaxFiling>): Promise<TaxFiling> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.filingData !== undefined) updateData.filing_data = updates.filingData;
    if (updates.calculatedLiability !== undefined) updateData.calculated_liability = updates.calculatedLiability;
    if (updates.totalTaxDue !== undefined) updateData.total_tax_due = updates.totalTaxDue;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.efilingTransactionId !== undefined) updateData.efiling_transaction_id = updates.efilingTransactionId;
    if (updates.efilingConfirmation !== undefined) updateData.efiling_confirmation = updates.efilingConfirmation;
    if (updates.efilingStatus !== undefined) updateData.efiling_status = updates.efilingStatus;
    if (updates.efilingResponse !== undefined) updateData.efiling_response = updates.efilingResponse;
    if (updates.filingDocumentUrl !== undefined) updateData.filing_document_url = updates.filingDocumentUrl;
    if (updates.confirmationDocumentUrl !== undefined) updateData.confirmation_document_url = updates.confirmationDocumentUrl;

    const { data, error } = await supabase
      .from('tax_filings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tax filing:', error);
      throw new Error('Failed to update tax filing');
    }

    return this.mapDatabaseToFiling(data);
  }

  /**
   * Submit tax filing for e-filing
   */
  static async submitFiling(id: string): Promise<TaxFilingResponse> {
    try {
      // Get the filing details
      const filing = await this.getFiling(id);
      if (!filing) {
        throw new Error('Filing not found');
      }

      // Update status to submitted
      await this.updateFiling(id, {
        status: 'submitted',
        submittedAt: new Date().toISOString()
      });

      // Call e-filing API (placeholder - would integrate with actual e-filing service)
      const response = await this.callEFilingAPI(filing);

      // Update filing with e-filing response
      await this.updateFiling(id, {
        efilingTransactionId: response.transactionId,
        efilingConfirmation: response.confirmationNumber,
        efilingStatus: response.status,
        efilingResponse: response
      });

      return response;
    } catch (error) {
      console.error('Error submitting tax filing:', error);
      
      // Update status to failed
      await this.updateFiling(id, {
        status: 'rejected'
      });

      throw new Error('Failed to submit tax filing');
    }
  }

  /**
   * Calculate 941 form data
   */
  static async calculate941(companyId: string, year: number, quarter: number): Promise<Form941Data> {
    // This would integrate with payroll data to calculate 941 values
    // Placeholder implementation
    const { data: liabilities } = await supabase
      .from('tax_liabilities')
      .select('*')
      .eq('company_id', companyId)
      .eq('tax_year', year)
      .eq('tax_quarter', quarter)
      .in('liability_type', ['federal_income', 'fica_employee', 'fica_employer']);

    let totalWages = 0;
    let federalIncomeTax = 0;
    let socialSecurityTax = 0;
    let medicareTax = 0;

    liabilities?.forEach(liability => {
      totalWages += liability.taxable_wages || 0;
      
      switch (liability.liability_type) {
        case 'federal_income':
          federalIncomeTax += liability.employee_tax_amount || 0;
          break;
        case 'fica_employee':
          socialSecurityTax += liability.employee_tax_amount || 0;
          medicareTax += liability.employee_tax_amount || 0;
          break;
      }
    });

    const totalTaxDue = federalIncomeTax + socialSecurityTax + medicareTax;

    return {
      quarter,
      year,
      employeeCount: 0, // Would be calculated from payroll data
      totalWages,
      federalIncomeTax,
      socialSecurityWages: totalWages,
      socialSecurityTax,
      medicareWages: totalWages,
      medicareTax,
      totalTaxDue,
      totalDeposits: 0, // Would be from payment records
      balanceDue: totalTaxDue,
      overpayment: 0
    };
  }

  /**
   * Calculate 940 form data
   */
  static async calculate940(companyId: string, year: number): Promise<Form940Data> {
    const { data: liabilities } = await supabase
      .from('tax_liabilities')
      .select('*')
      .eq('company_id', companyId)
      .eq('tax_year', year)
      .eq('liability_type', 'futa');

    let totalFutaWages = 0;
    let futaTaxDue = 0;

    liabilities?.forEach(liability => {
      totalFutaWages += liability.taxable_wages || 0;
      futaTaxDue += liability.employer_tax_amount || 0;
    });

    return {
      year,
      stateTaxPaid: 0, // Would be calculated from state payments
      totalFutaWages,
      futaTaxDue,
      totalDeposits: 0, // Would be from payment records
      balanceDue: futaTaxDue,
      overpayment: 0
    };
  }

  /**
   * Delete tax filing
   */
  static async deleteFiling(id: string): Promise<void> {
    const { error } = await supabase
      .from('tax_filings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tax filing:', error);
      throw new Error('Failed to delete tax filing');
    }
  }

  /**
   * Call e-filing API (placeholder implementation)
   */
  private static async callEFilingAPI(filing: TaxFiling): Promise<TaxFilingResponse> {
    // This would integrate with actual e-filing service like Sovos, etc.
    // For now, return a mock successful response
    return {
      success: true,
      transactionId: `TXN-${Date.now()}`,
      confirmationNumber: `CONF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'accepted',
      acknowledgedAt: new Date().toISOString()
    };
  }

  /**
   * Map database row to TaxFiling object
   */
  private static mapDatabaseToFiling(data: any): TaxFiling {
    return {
      id: data.id,
      companyId: data.company_id,
      calendarEntryId: data.calendar_entry_id,
      filingType: data.filing_type,
      agency: data.agency,
      jurisdiction: data.jurisdiction,
      taxYear: data.tax_year,
      taxQuarter: data.tax_quarter,
      periodStartDate: data.period_start_date,
      periodEndDate: data.period_end_date,
      filingData: data.filing_data || {},
      calculatedLiability: data.calculated_liability || 0,
      totalTaxDue: data.total_tax_due || 0,
      status: data.status,
      submittedAt: data.submitted_at,
      submittedBy: data.submitted_by,
      efilingTransactionId: data.efiling_transaction_id,
      efilingConfirmation: data.efiling_confirmation,
      efilingStatus: data.efiling_status,
      efilingResponse: data.efiling_response,
      filingDocumentUrl: data.filing_document_url,
      confirmationDocumentUrl: data.confirmation_document_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}