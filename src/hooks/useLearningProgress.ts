import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LearningProgress {
  id: string;
  assignment_id: string;
  employee_id: string;
  training_module_id: string;
  scene_id?: string;
  overall_progress_percentage: number;
  time_spent_seconds: number;
  content_viewed_percentage: number;
  content_completed_at?: string;
  quiz_attempts: number;
  quiz_best_score?: number;
  quiz_passed: boolean;
  quiz_completed_at?: string;
  status: 'not_started' | 'in_progress' | 'content_complete' | 'quiz_complete' | 'completed';
  completed_at?: string;
  last_accessed_at: string;
  completion_data: any;
}

interface ProgressUpdate {
  overall_progress_percentage?: number;
  time_spent_seconds?: number;
  content_viewed_percentage?: number;
  content_completed_at?: string;
  quiz_attempts?: number;
  quiz_best_score?: number;
  quiz_passed?: boolean;
  quiz_completed_at?: string;
  status?: LearningProgress['status'];
  completed_at?: string;
  completion_data?: any;
}

export const useLearningProgress = (assignmentId?: string, employeeId?: string) => {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch current progress
  const fetchProgress = useCallback(async () => {
    if (!assignmentId || !employeeId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      setProgress(data as LearningProgress);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching learning progress:', err);
    } finally {
      setLoading(false);
    }
  }, [assignmentId, employeeId]);

  // Initialize progress record if it doesn't exist
  const initializeProgress = useCallback(async (trainingModuleId: string) => {
    if (!assignmentId || !employeeId) return null;

    try {
      const { data, error } = await supabase
        .from('learning_progress')
        .insert({
          assignment_id: assignmentId,
          employee_id: employeeId,
          training_module_id: trainingModuleId,
          status: 'not_started',
          overall_progress_percentage: 0
        })
        .select()
        .single();

      if (error) throw error;
      
      setProgress(data as LearningProgress);
      return data;
    } catch (err: any) {
      console.error('Error initializing progress:', err);
      setError(err.message);
      return null;
    }
  }, [assignmentId, employeeId]);

  // Update progress
  const updateProgress = useCallback(async (updates: ProgressUpdate) => {
    if (!progress) return null;

    try {
      // Calculate overall progress based on content and quiz completion
      let calculatedProgress = updates.overall_progress_percentage;
      
      if (!calculatedProgress) {
        const contentWeight = 0.7; // 70% for content
        const quizWeight = 0.3; // 30% for quiz
        
        const contentProgress = updates.content_viewed_percentage ?? progress.content_viewed_percentage;
        const quizProgress = updates.quiz_passed ? 100 : (updates.quiz_best_score ?? progress.quiz_best_score ?? 0);
        
        calculatedProgress = Math.round(
          (contentProgress * contentWeight) + (quizProgress * quizWeight)
        );
      }

      // Determine status based on progress
      let newStatus = updates.status;
      if (!newStatus) {
        if (calculatedProgress === 100 && updates.quiz_passed) {
          newStatus = 'completed';
        } else if (updates.quiz_completed_at) {
          newStatus = 'quiz_complete';
        } else if (updates.content_completed_at) {
          newStatus = 'content_complete';
        } else if (calculatedProgress > 0) {
          newStatus = 'in_progress';
        }
      }

      const finalUpdates = {
        ...updates,
        overall_progress_percentage: calculatedProgress,
        status: newStatus || progress.status,
        last_accessed_at: new Date().toISOString(),
        completed_at: newStatus === 'completed' ? (updates.completed_at || new Date().toISOString()) : updates.completed_at
      };

      const { data, error } = await supabase
        .from('learning_progress')
        .update(finalUpdates)
        .eq('id', progress.id)
        .select()
        .single();

      if (error) throw error;
      
      setProgress(data as LearningProgress);
      
      // Log analytics event
      await logAnalyticsEvent('progress_update', {
        previous_progress: progress.overall_progress_percentage,
        new_progress: calculatedProgress,
        status_change: progress.status !== newStatus ? { from: progress.status, to: newStatus } : null
      });

      return data;
    } catch (err: any) {
      console.error('Error updating progress:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive"
      });
      return null;
    }
  }, [progress, toast]);

  // Log analytics events
  const logAnalyticsEvent = useCallback(async (eventType: string, eventData: any = {}) => {
    if (!employeeId) return;

    try {
      await supabase
        .from('training_analytics_events')
        .insert({
          employee_id: employeeId,
          assignment_id: assignmentId,
          training_module_id: progress?.training_module_id,
          scene_id: progress?.scene_id,
          event_type: eventType,
          event_data: eventData,
          session_id: crypto.randomUUID()
        });
    } catch (err) {
      console.error('Error logging analytics event:', err);
    }
  }, [employeeId, assignmentId, progress]);

  // Mark content as complete
  const markContentComplete = useCallback(async (contentViewedPercentage: number = 100) => {
    return updateProgress({
      content_viewed_percentage: contentViewedPercentage,
      content_completed_at: new Date().toISOString()
    });
  }, [updateProgress]);

  // Record quiz attempt
  const recordQuizAttempt = useCallback(async (score: number, passed: boolean) => {
    const updates: ProgressUpdate = {
      quiz_attempts: (progress?.quiz_attempts || 0) + 1,
      quiz_best_score: Math.max(score, progress?.quiz_best_score || 0),
      quiz_passed: passed || progress?.quiz_passed || false
    };

    if (passed) {
      updates.quiz_completed_at = new Date().toISOString();
    }

    await logAnalyticsEvent('quiz_attempt', { score, passed, attempt_number: updates.quiz_attempts });
    
    return updateProgress(updates);
  }, [progress, updateProgress, logAnalyticsEvent]);

  // Update time spent
  const updateTimeSpent = useCallback(async (additionalSeconds: number) => {
    return updateProgress({
      time_spent_seconds: (progress?.time_spent_seconds || 0) + additionalSeconds
    });
  }, [progress, updateProgress]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    fetchProgress,
    initializeProgress,
    updateProgress,
    markContentComplete,
    recordQuizAttempt,
    updateTimeSpent,
    logAnalyticsEvent
  };
};