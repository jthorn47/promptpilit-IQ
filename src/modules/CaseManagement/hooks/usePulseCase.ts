
import { useState, useCallback } from 'react';
import { Case, CreateCaseRequest, UpdateCaseRequest, CaseActivity, CaseStatus } from '../types';
import { supabase } from '@/integrations/supabase/client';

export const usePulseCase = (caseId?: string) => {
  const [case_, setCase] = useState<Case | null>(null);
  const [activities, setActivities] = useState<CaseActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch single case by ID
  const fetchCase = useCallback(async (id?: string) => {
    const targetId = id || caseId;
    if (!targetId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke('get-case-by-id', {
        body: { caseId: targetId }
      });

      if (fetchError) throw fetchError;
      
      setCase(data.case as unknown as Case);
      setActivities(data.activities as unknown as CaseActivity[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch case');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  // Create new case
  const createCase = useCallback(async (caseData: CreateCaseRequest): Promise<Case> => {
    const { data, error } = await supabase.functions.invoke('create-case', {
      body: { case: caseData }
    });

    if (error) throw error;
    
    const newCase = data.case as unknown as Case;
    setCase(newCase);
    return newCase;
  }, []);

  // Update existing case
  const updateCase = useCallback(async (updates: UpdateCaseRequest): Promise<Case> => {
    if (!caseId) throw new Error('No case ID provided for update');

    const { data, error } = await supabase.functions.invoke('update-case', {
      body: { 
        caseId,
        updates 
      }
    });

    if (error) throw error;
    
    const updatedCase = data.case as unknown as Case;
    setCase(updatedCase);
    return updatedCase;
  }, [caseId]);

  // Update case status with workflow
  const updateStatus = useCallback(async (status: CaseStatus, note?: string) => {
    if (!caseId) throw new Error('No case ID provided for status update');

    const { data, error } = await supabase.functions.invoke('update-case-status', {
      body: { 
        caseId,
        status,
        note 
      }
    });

    if (error) throw error;
    
    const updatedCase = data.case as unknown as Case;
    setCase(updatedCase);
    
    // Refresh activities to show status change
    if (data.activity) {
      setActivities(prev => [data.activity as unknown as CaseActivity, ...prev]);
    }
    
    return updatedCase;
  }, [caseId]);

  // Reassign case to another user
  const reassignCase = useCallback(async (assigneeId: string, note?: string) => {
    if (!caseId) throw new Error('No case ID provided for reassignment');

    const { data, error } = await supabase.functions.invoke('reassign-case', {
      body: { 
        caseId,
        assigneeId,
        note 
      }
    });

    if (error) throw error;
    
    const updatedCase = data.case as unknown as Case;
    setCase(updatedCase);
    
    // Add activity for reassignment
    if (data.activity) {
      setActivities(prev => [data.activity as unknown as CaseActivity, ...prev]);
    }
    
    return updatedCase;
  }, [caseId]);

  // Add note to case
  const addNote = useCallback(async (note: string, isInternal = true) => {
    if (!caseId) throw new Error('No case ID provided for adding note');

    const { data, error } = await supabase.functions.invoke('add-note-to-case', {
      body: { 
        caseId,
        note,
        isInternal 
      }
    });

    if (error) throw error;
    
    const newActivity = data.activity as unknown as CaseActivity;
    setActivities(prev => [newActivity, ...prev]);
    
    return newActivity;
  }, [caseId]);

  // Add file to case
  const addFile = useCallback(async (fileName: string, filePath: string, fileSize?: number) => {
    if (!caseId) throw new Error('No case ID provided for adding file');

    // Mock implementation until Supabase types are updated
    console.log('File upload attempted:', { fileName, filePath, fileSize });
    await addNote(`File uploaded: ${fileName}`, true);
    
    return { id: 'mock-file-id', file_name: fileName, file_path: filePath };
  }, [caseId, addNote]);

  // Close case with resolution
  const closeCase = useCallback(async (resolutionNote?: string) => {
    if (!caseId) throw new Error('No case ID provided for closing');

    const updates: UpdateCaseRequest = {
      status: 'closed',
      closed_at: new Date().toISOString(),
    };

    const updatedCase = await updateCase(updates);
    
    if (resolutionNote) {
      await addNote(`Case closed: ${resolutionNote}`, true);
    }
    
    return updatedCase;
  }, [caseId, updateCase, addNote]);

  // Reopen case
  const reopenCase = useCallback(async (reason?: string) => {
    if (!caseId) throw new Error('No case ID provided for reopening');

    const updates: UpdateCaseRequest = {
      status: 'open',
      closed_at: undefined,
    };

    const updatedCase = await updateCase(updates);
    
    if (reason) {
      await addNote(`Case reopened: ${reason}`, true);
    }
    
    return updatedCase;
  }, [caseId, updateCase, addNote]);

  // Auto-load case if ID is provided
  useState(() => {
    if (caseId) {
      fetchCase();
    }
  });

  return {
    // Data
    case: case_,
    activities,
    loading,
    error,

    // Case Management
    fetchCase,
    createCase,
    updateCase,
    closeCase,
    reopenCase,

    // Status & Assignment
    updateStatus,
    reassignCase,

    // Communication
    addNote,
    addFile,

    // Utilities
    refetch: () => fetchCase(caseId),
  };
};
