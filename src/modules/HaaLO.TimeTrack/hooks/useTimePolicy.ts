import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TimePolicyService } from '../services/TimeTrackService';
import { TimePolicy, TimeComplianceViolation } from '../types';

export const useTimePolicy = () => {
  const { companyId } = useAuth();
  const [timePolicy, setTimePolicy] = useState<TimePolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePolicy = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const policy = await TimePolicyService.getActiveTimePolicy(companyId);
      setTimePolicy(policy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch time policy');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchActivePolicy();
  }, [fetchActivePolicy]);

  return {
    timePolicy,
    isLoading,
    error,
    refetch: fetchActivePolicy,
  };
};

export const useComplianceViolations = (filters?: {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
  resolved?: boolean;
}) => {
  const { companyId } = useAuth();
  const [violations, setViolations] = useState<TimeComplianceViolation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchViolations = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await TimePolicyService.getComplianceViolations(companyId, filters);
      setViolations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch violations');
    } finally {
      setIsLoading(false);
    }
  }, [companyId, filters]);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  const resolveViolation = useCallback(async (violationId: string, notes?: string) => {
    try {
      await TimePolicyService.resolveViolation(violationId, notes);
      await fetchViolations(); // Refresh the list
    } catch (err) {
      throw err;
    }
  }, [fetchViolations]);

  return {
    violations,
    isLoading,
    error,
    resolveViolation,
    refetch: fetchViolations,
  };
};