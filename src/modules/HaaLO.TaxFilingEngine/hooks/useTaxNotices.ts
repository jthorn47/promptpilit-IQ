/**
 * Tax Notices Hook
 * Manages tax notices state and operations
 */

import { useState, useEffect } from 'react';
import { TaxNoticeService } from '../services/TaxNoticeService';
import type { UseTaxNoticesReturn, TaxNotice } from '../types';

export function useTaxNotices(companyId: string, filters?: {
  status?: string;
  agency?: string;
  noticeType?: string;
  startDate?: string;
  endDate?: string;
}): UseTaxNoticesReturn {
  const [notices, setNotices] = useState<TaxNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      loadNotices();
    }
  }, [companyId, filters]);

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TaxNoticeService.getNotices(companyId, filters);
      setNotices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tax notices');
    } finally {
      setLoading(false);
    }
  };

  const createNotice = async (data: Omit<TaxNotice, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const created = await TaxNoticeService.createNotice(data);
      setNotices(prev => [created, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tax notice');
      throw err;
    }
  };

  const updateNotice = async (id: string, data: Partial<TaxNotice>) => {
    try {
      setError(null);
      const updated = await TaxNoticeService.updateNotice(id, data);
      setNotices(prev => prev.map(notice => 
        notice.id === id ? updated : notice
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tax notice');
      throw err;
    }
  };

  const resolveNotice = async (id: string, resolutionNotes: string) => {
    try {
      setError(null);
      const resolved = await TaxNoticeService.resolveNotice(id, resolutionNotes);
      setNotices(prev => prev.map(notice => 
        notice.id === id ? resolved : notice
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve tax notice');
      throw err;
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      setError(null);
      await TaxNoticeService.deleteNotice(id);
      setNotices(prev => prev.filter(notice => notice.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tax notice');
      throw err;
    }
  };

  return {
    notices,
    loading,
    error,
    createNotice,
    updateNotice,
    resolveNotice,
    deleteNotice
  };
}