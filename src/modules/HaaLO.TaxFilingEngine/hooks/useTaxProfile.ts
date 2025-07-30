/**
 * Tax Profile Hook
 * Manages tax profile state and operations
 */

import { useState, useEffect } from 'react';
import { TaxProfileService } from '../services/TaxProfileService';
import type { UseTaxProfileReturn, TaxProfile } from '../types';

export function useTaxProfile(companyId: string): UseTaxProfileReturn {
  const [profile, setProfile] = useState<TaxProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      loadProfile();
    }
  }, [companyId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TaxProfileService.getProfile(companyId);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tax profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<TaxProfile>) => {
    if (!profile) return;

    try {
      setError(null);
      const updated = await TaxProfileService.updateProfile(profile.id, data);
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tax profile');
      throw err;
    }
  };

  const createProfile = async (data: Omit<TaxProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const created = await TaxProfileService.createProfile(data);
      setProfile(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tax profile');
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    createProfile
  };
}