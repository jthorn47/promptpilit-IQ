/**
 * Tax Notice Service
 * Manages tax agency notices and correspondence
 */

import { supabase } from '@/integrations/supabase/client';
import type { TaxNotice } from '../types';

export class TaxNoticeService {
  /**
   * Get tax notices for a company
   */
  static async getNotices(companyId: string, filters?: {
    status?: string;
    agency?: string;
    noticeType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TaxNotice[]> {
    let query = supabase
      .from('tax_notices')
      .select('*')
      .eq('company_id', companyId)
      .order('notice_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.agency) {
      query = query.eq('agency', filters.agency);
    }
    if (filters?.noticeType) {
      query = query.eq('notice_type', filters.noticeType);
    }
    if (filters?.startDate) {
      query = query.gte('notice_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('notice_date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tax notices:', error);
      throw new Error('Failed to fetch tax notices');
    }

    return data.map(this.mapDatabaseToNotice);
  }

  /**
   * Get single tax notice
   */
  static async getNotice(id: string): Promise<TaxNotice | null> {
    const { data, error } = await supabase
      .from('tax_notices')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching tax notice:', error);
      throw new Error('Failed to fetch tax notice');
    }

    return data ? this.mapDatabaseToNotice(data) : null;
  }

  /**
   * Create new tax notice
   */
  static async createNotice(notice: Omit<TaxNotice, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaxNotice> {
    const { data, error } = await supabase
      .from('tax_notices')
      .insert({
        company_id: notice.companyId,
        filing_id: notice.filingId,
        notice_type: notice.noticeType,
        agency: notice.agency,
        jurisdiction: notice.jurisdiction,
        notice_number: notice.noticeNumber,
        notice_date: notice.noticeDate,
        response_due_date: notice.responseDueDate,
        subject: notice.subject,
        description: notice.description,
        notice_document_url: notice.noticeDocumentUrl,
        penalty_amount: notice.penaltyAmount,
        interest_amount: notice.interestAmount,
        adjustment_amount: notice.adjustmentAmount,
        status: notice.status,
        created_by: notice.createdBy
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tax notice:', error);
      throw new Error('Failed to create tax notice');
    }

    return this.mapDatabaseToNotice(data);
  }

  /**
   * Update tax notice
   */
  static async updateNotice(id: string, updates: Partial<TaxNotice>): Promise<TaxNotice> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.responseDueDate !== undefined) updateData.response_due_date = updates.responseDueDate;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.noticeDocumentUrl !== undefined) updateData.notice_document_url = updates.noticeDocumentUrl;
    if (updates.penaltyAmount !== undefined) updateData.penalty_amount = updates.penaltyAmount;
    if (updates.interestAmount !== undefined) updateData.interest_amount = updates.interestAmount;
    if (updates.adjustmentAmount !== undefined) updateData.adjustment_amount = updates.adjustmentAmount;
    if (updates.resolutionNotes !== undefined) updateData.resolution_notes = updates.resolutionNotes;
    if (updates.resolutionDate !== undefined) updateData.resolution_date = updates.resolutionDate;
    if (updates.resolvedBy !== undefined) updateData.resolved_by = updates.resolvedBy;

    const { data, error } = await supabase
      .from('tax_notices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tax notice:', error);
      throw new Error('Failed to update tax notice');
    }

    return this.mapDatabaseToNotice(data);
  }

  /**
   * Resolve tax notice
   */
  static async resolveNotice(id: string, resolutionNotes: string, resolvedBy?: string): Promise<TaxNotice> {
    return this.updateNotice(id, {
      status: 'resolved',
      resolutionNotes,
      resolutionDate: new Date().toISOString().split('T')[0],
      resolvedBy
    });
  }

  /**
   * Escalate tax notice
   */
  static async escalateNotice(id: string, escalationNotes?: string): Promise<TaxNotice> {
    return this.updateNotice(id, {
      status: 'escalated',
      resolutionNotes: escalationNotes
    });
  }

  /**
   * Get notices requiring attention (due soon or overdue)
   */
  static async getNoticesRequiringAttention(companyId: string): Promise<{
    overdue: TaxNotice[];
    dueSoon: TaxNotice[];
  }> {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const notices = await this.getNotices(companyId, {
      status: 'received'
    });

    const overdue = notices.filter(notice => 
      notice.responseDueDate && notice.responseDueDate < today
    );

    const dueSoon = notices.filter(notice => 
      notice.responseDueDate && 
      notice.responseDueDate >= today && 
      notice.responseDueDate <= nextWeek
    );

    return { overdue, dueSoon };
  }

  /**
   * Get notice summary by type and status
   */
  static async getNoticeSummary(companyId: string): Promise<{
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    totalFinancialImpact: number;
  }> {
    const notices = await this.getNotices(companyId);

    const summary = {
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      totalFinancialImpact: 0
    };

    notices.forEach(notice => {
      // Count by type
      summary.byType[notice.noticeType] = (summary.byType[notice.noticeType] || 0) + 1;
      
      // Count by status
      summary.byStatus[notice.status] = (summary.byStatus[notice.status] || 0) + 1;
      
      // Calculate financial impact
      summary.totalFinancialImpact += notice.penaltyAmount + notice.interestAmount + Math.abs(notice.adjustmentAmount);
    });

    return summary;
  }

  /**
   * Delete tax notice
   */
  static async deleteNotice(id: string): Promise<void> {
    const { error } = await supabase
      .from('tax_notices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tax notice:', error);
      throw new Error('Failed to delete tax notice');
    }
  }

  /**
   * Upload notice document
   */
  static async uploadNoticeDocument(
    noticeId: string,
    file: File
  ): Promise<string> {
    try {
      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${noticeId}-${Date.now()}.${fileExt}`;
      const filePath = `tax-notices/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Update notice with document URL
      await this.updateNotice(noticeId, {
        noticeDocumentUrl: publicUrl
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading notice document:', error);
      throw new Error('Failed to upload notice document');
    }
  }

  /**
   * Map database row to TaxNotice object
   */
  private static mapDatabaseToNotice(data: any): TaxNotice {
    return {
      id: data.id,
      companyId: data.company_id,
      filingId: data.filing_id,
      noticeType: data.notice_type,
      agency: data.agency,
      jurisdiction: data.jurisdiction,
      noticeNumber: data.notice_number,
      noticeDate: data.notice_date,
      responseDueDate: data.response_due_date,
      subject: data.subject,
      description: data.description,
      noticeDocumentUrl: data.notice_document_url,
      penaltyAmount: data.penalty_amount || 0,
      interestAmount: data.interest_amount || 0,
      adjustmentAmount: data.adjustment_amount || 0,
      status: data.status,
      resolutionNotes: data.resolution_notes,
      resolutionDate: data.resolution_date,
      resolvedBy: data.resolved_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    };
  }
}