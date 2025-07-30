import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MicroContent {
  id: string;
  title: string;
  content_type: 'video' | 'flashcard_set' | 'drill_question' | 'coachgpt_replay';
  topic_tags: string[];
  estimated_duration_seconds: number;
  content_url?: string;
  content_data: any;
  thumbnail_url?: string;
  description: string;
  effectiveness_score: number;
}

export interface TriggerEvent {
  id: string;
  employee_id: string;
  trigger_type: string;
  trigger_context: any;
  detected_topics: string[];
  micro_content_served: string[];
  created_at: string;
}

export interface MicroIntervention {
  id: string;
  trigger_event_id: string;
  micro_content_id: string;
  delivery_method: string;
  viewed: boolean;
  completed: boolean;
  rating?: number;
  micro_content_library: MicroContent;
}

interface UseMicroLearningProps {
  employeeId: string;
  sessionId?: string;
}

export const useMicroLearning = ({ employeeId, sessionId }: UseMicroLearningProps) => {
  const [activeTriggers, setActiveTriggers] = useState<TriggerEvent[]>([]);
  const [pendingInterventions, setPendingInterventions] = useState<MicroIntervention[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Detect and process trigger events
  const processTrigger = async (params: {
    triggerType: 'quiz_failure' | 'scenario_failure' | 'long_pause' | 'missed_refresh';
    context: {
      trainingModuleId?: string;
      sceneId?: string;
      assignmentId?: string;
      currentProgress?: number;
      detectedTopics?: string[];
      failureCount?: number;
      pauseDuration?: number;
      performanceData?: any;
      sessionId?: string;
    };
    learnerProfile?: {
      roleTitle: string;
      industry: string;
      skillLevel: string;
    };
  }) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('micro-learning-trigger-processor', {
        body: {
          employeeId,
          triggerType: params.triggerType,
          context: {
            ...params.context,
            sessionId
          },
          learnerProfile: params.learnerProfile
        }
      });

      if (error) throw error;

      if (data.success && data.interventions.length > 0) {
        setPendingInterventions(prev => [...prev, ...data.interventions]);
        
        // Show recommendation text
        if (data.recommendationText) {
          toast.info(data.recommendationText, {
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => {
                // This could trigger showing the micro-content modal
              }
            }
          });
        }
      }

      return data;
    } catch (error) {
      console.error('Error processing micro-learning trigger:', error);
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  // Mark intervention as viewed
  const markAsViewed = async (interventionId: string, viewDuration?: number) => {
    try {
      const { error } = await supabase
        .from('micro_learning_interventions')
        .update({
          viewed: true,
          view_duration_seconds: viewDuration
        })
        .eq('id', interventionId);

      if (error) throw error;

      setPendingInterventions(prev =>
        prev.map(int => 
          int.id === interventionId 
            ? { ...int, viewed: true }
            : int
        )
      );
    } catch (error) {
      console.error('Error marking intervention as viewed:', error);
    }
  };

  // Mark intervention as completed
  const markAsCompleted = async (interventionId: string, rating?: number, feedback?: string) => {
    try {
      const { error } = await supabase
        .from('micro_learning_interventions')
        .update({
          completed: true,
          rating,
          feedback,
          rated: rating !== undefined
        })
        .eq('id', interventionId);

      if (error) throw error;

      setPendingInterventions(prev =>
        prev.map(int => 
          int.id === interventionId 
            ? { ...int, completed: true, rating }
            : int
        )
      );

      // Remove from pending after completion
      setTimeout(() => {
        setPendingInterventions(prev => prev.filter(int => int.id !== interventionId));
      }, 2000);

      toast.success('Thank you for the feedback!');
    } catch (error) {
      console.error('Error marking intervention as completed:', error);
    }
  };

  // Dismiss intervention
  const dismissIntervention = async (interventionId: string) => {
    setPendingInterventions(prev => prev.filter(int => int.id !== interventionId));
  };

  // Fetch recent trigger events for analytics
  const fetchRecentTriggers = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_trigger_events')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveTriggers(data || []);
    } catch (error) {
      console.error('Error fetching recent triggers:', error);
    }
  };

  // Auto-detect long pause
  useEffect(() => {
    let pauseTimer: NodeJS.Timeout;
    let startTime = Date.now();

    const handleActivity = () => {
      clearTimeout(pauseTimer);
      startTime = Date.now();
      
      pauseTimer = setTimeout(() => {
        const pauseDuration = Date.now() - startTime;
        if (pauseDuration > 30000) { // 30 seconds
          processTrigger({
            triggerType: 'long_pause',
            context: {
              pauseDuration: pauseDuration / 1000
            }
          });
        }
      }, 30000);
    };

    // Listen for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);

    handleActivity(); // Start timer

    return () => {
      clearTimeout(pauseTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [employeeId, sessionId]);

  return {
    activeTriggers,
    pendingInterventions,
    isProcessing,
    processTrigger,
    markAsViewed,
    markAsCompleted,
    dismissIntervention,
    fetchRecentTriggers
  };
};