import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreateCaseRequest, UpdateCaseRequest, Case } from '@/modules/CaseManagement/types';
import { useHROIQRetainer } from '@/modules/HaaLO.HROIQ/hooks/useHROIQRetainer';

export interface RetainerInfo {
  id: string;
  tier_name: string;
  retainer_hours: number;
  hours_used: number;
  usage_percentage: number;
  assigned_consultant_id?: string;
  consultant_name?: string;
  overage_allowed: boolean;
}

export const useRetainerAwareCases = () => {
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [retainerInfo, setRetainerInfo] = useState<RetainerInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Get retainer info when client is selected
  const { retainer, calculateUsage } = useHROIQRetainer(selectedClientId);

  useEffect(() => {
    if (retainer && selectedClientId) {
      const usage = calculateUsage();
      setRetainerInfo({
        id: retainer.id,
        tier_name: 'Standard', // retainer.tier_name || 'Standard',
        retainer_hours: retainer.retainer_hours || 0,
        hours_used: usage.used,
        usage_percentage: usage.percentage,
        assigned_consultant_id: retainer.assigned_consultant_id,
        consultant_name: 'Unassigned', // retainer.consultant_name || 'Unassigned',
        overage_allowed: false // retainer.overage_allowed || false
      });
    } else {
      setRetainerInfo(null);
    }
  }, [retainer, selectedClientId, calculateUsage]);

  const getRetainerStatus = (): 'ok' | 'warning' | 'critical' => {
    if (!retainerInfo) return 'ok';
    
    if (retainerInfo.usage_percentage >= 90) return 'critical';
    if (retainerInfo.usage_percentage >= 75) return 'warning';
    return 'ok';
  };

  const getRetainerStatusMessage = (): string => {
    if (!retainerInfo) return '';
    
    const status = getRetainerStatus();
    if (status === 'critical') {
      return `Client has used ${retainerInfo.usage_percentage.toFixed(1)}% of their retainer hours. Overage charges will apply.`;
    }
    if (status === 'warning') {
      return `Client has used ${retainerInfo.usage_percentage.toFixed(1)}% of their retainer hours. Approaching limit.`;
    }
    return `Client has ${retainerInfo.retainer_hours - retainerInfo.hours_used} hours remaining this month.`;
  };

  const createRetainerAwareCase = useCallback(async (caseData: CreateCaseRequest) => {
    try {
      setLoading(true);

      // Enhanced case data with retainer linking
      const enhancedCaseData = {
        ...caseData,
        retainer_id: retainerInfo?.id,
        // Auto-assign to designated consultant if available
        assigned_to: retainerInfo?.assigned_consultant_id || caseData.assigned_to,
        // Add retainer context to internal notes
        internal_notes: caseData.internal_notes 
          ? `${caseData.internal_notes}\n\nRetainer Context: ${retainerInfo?.tier_name} tier, ${retainerInfo?.usage_percentage.toFixed(1)}% utilized`
          : `Retainer Context: ${retainerInfo?.tier_name} tier, ${retainerInfo?.usage_percentage.toFixed(1)}% utilized`
      };

      // Create the case via edge function
      const { data, error } = await supabase.functions.invoke('create-case', {
        body: { 
          case: enhancedCaseData,
          retainerContext: retainerInfo
        }
      });

      if (error) throw error;

      // Log initial time entry if estimated hours provided
      if (caseData.estimated_hours && caseData.estimated_hours > 0) {
        await supabase.from('unified_time_entries').insert({
          company_id: selectedClientId,
          case_id: data.case.id,
          retainer_id: retainerInfo?.id,
          time_type: 'case_work',
          hours_logged: 0, // Start at 0, will be updated as work progresses
          billable: true,
          description: `Case created: ${caseData.title}`,
          work_date: new Date().toISOString().split('T')[0],
          logged_by: (await supabase.auth.getUser()).data.user?.id
        });
      }

      toast({
        title: 'Case Created',
        description: 'Case created successfully and linked to retainer',
      });

      return data.case;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create case',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [retainerInfo, selectedClientId, toast]);

  const updateCaseWithTimeTracking = useCallback(async (
    caseId: string, 
    updates: UpdateCaseRequest,
    additionalHours?: number
  ) => {
    try {
      setLoading(true);

      // Update the case
      const { data, error } = await supabase.functions.invoke('update-case', {
        body: { 
          caseId,
          updates,
          retainerContext: retainerInfo
        }
      });

      if (error) throw error;

      // Log additional time if provided
      if (additionalHours && additionalHours > 0) {
        await supabase.from('unified_time_entries').insert({
          company_id: selectedClientId,
          case_id: caseId,
          retainer_id: retainerInfo?.id,
          time_type: 'case_work',
          hours_logged: additionalHours,
          billable: true,
          description: `Case update: Additional ${additionalHours} hours`,
          work_date: new Date().toISOString().split('T')[0],
          logged_by: (await supabase.auth.getUser()).data.user?.id
        });
      }

      toast({
        title: 'Case Updated',
        description: 'Case updated successfully',
      });

      return data.case;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update case',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [retainerInfo, selectedClientId, toast]);

  const closeCaseWithServiceLog = useCallback(async (caseId: string, caseData: Case) => {
    try {
      setLoading(true);

      // Close the case
      await supabase.functions.invoke('update-case', {
        body: { 
          caseId,
          updates: { status: 'closed', closed_at: new Date().toISOString() }
        }
      });

      // Auto-generate service log entry
      const serviceLogData = {
        company_id: selectedClientId,
        retainer_id: retainerInfo?.id,
        consultant_id: retainerInfo?.assigned_consultant_id,
        service_type: caseData.type,
        service_category: 'case_resolution',
        hours_logged: caseData.actual_hours || 0,
        billable: true,
        service_date: new Date().toISOString().split('T')[0],
        description: `Case Resolution: ${caseData.title}`,
        deliverables: [`Resolved case: ${caseData.title}`],
        case_id: caseId,
        internal_notes: `Auto-generated from case closure. Original case description: ${caseData.description}`
      };

      await supabase.from('hroiq_service_logs').insert(serviceLogData);

      toast({
        title: 'Case Closed',
        description: 'Case closed and service log created',
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to close case',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [retainerInfo, selectedClientId, toast]);

  return {
    selectedClientId,
    setSelectedClientId,
    retainerInfo,
    loading,
    getRetainerStatus,
    getRetainerStatusMessage,
    createRetainerAwareCase,
    updateCaseWithTimeTracking,
    closeCaseWithServiceLog
  };
};