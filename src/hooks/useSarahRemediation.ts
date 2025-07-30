import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RemediationProps {
  employeeId: string;
  moduleId: string;
  sceneId: string;
  userRole?: string;
  sessionId: string;
}

interface StrugglePattern {
  type: 'quiz_failure' | 'excessive_pauses' | 'coach_activation' | 'video_skipping' | 'help_requests';
  severity: 'low' | 'medium' | 'high';
  context: {
    topic?: string;
    timePosition?: number;
    attempts?: number;
    frequency?: number;
  };
}

interface RemediationSuggestion {
  id: string;
  type: 'explanation' | 'microlearning' | 'example' | 'reminder' | 'peer_support';
  title: string;
  content: string;
  actionLabel: string;
  metadata?: any;
}

export const useSarahRemediation = ({
  employeeId,
  moduleId,
  sceneId,
  userRole = 'learner',
  sessionId
}: RemediationProps) => {
  const [activeSuggestions, setActiveSuggestions] = useState<RemediationSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Track struggle patterns
  const struggleCounters = useRef({
    quizFailures: 0,
    pauseCount: 0,
    coachActivations: 0,
    helpRequests: 0,
    skippingEvents: 0,
    lastPauseTime: 0
  });

  // Detect quiz struggles
  const trackQuizFailure = useCallback(async (questionId: string, attempt: number, topic: string) => {
    struggleCounters.current.quizFailures += 1;
    
    if (attempt >= 2) {
      const pattern: StrugglePattern = {
        type: 'quiz_failure',
        severity: attempt >= 3 ? 'high' : 'medium',
        context: { topic, attempts: attempt }
      };
      
      await generateRemediation(pattern);
    }
    
    // Log the struggle
    await logStruggleEvent('quiz_failure', { questionId, attempt, topic });
  }, []);

  // Detect excessive pausing
  const trackVideoPause = useCallback(async (currentTime: number, topic?: string) => {
    const now = Date.now();
    const timeSinceLastPause = now - struggleCounters.current.lastPauseTime;
    
    if (timeSinceLastPause < 30000) { // Less than 30 seconds since last pause
      struggleCounters.current.pauseCount += 1;
      
      if (struggleCounters.current.pauseCount >= 3) {
        const pattern: StrugglePattern = {
          type: 'excessive_pauses',
          severity: 'medium',
          context: { topic, timePosition: currentTime, frequency: struggleCounters.current.pauseCount }
        };
        
        await generateRemediation(pattern);
        struggleCounters.current.pauseCount = 0; // Reset after remediation
      }
    }
    
    struggleCounters.current.lastPauseTime = now;
    await logStruggleEvent('pause', { currentTime, topic, pauseCount: struggleCounters.current.pauseCount });
  }, []);

  // Track CoachGPT activations
  const trackCoachActivation = useCallback(async (topic: string, question: string) => {
    struggleCounters.current.coachActivations += 1;
    
    if (struggleCounters.current.coachActivations >= 2) {
      const pattern: StrugglePattern = {
        type: 'coach_activation',
        severity: 'medium',
        context: { topic, frequency: struggleCounters.current.coachActivations }
      };
      
      await generateRemediation(pattern);
    }
    
    await logStruggleEvent('coach_activation', { topic, question });
  }, []);

  // Track video skipping
  const trackVideoSkipping = useCallback(async (skippedDuration: number, topic?: string) => {
    if (skippedDuration > 30) { // Skipped more than 30 seconds
      struggleCounters.current.skippingEvents += 1;
      
      const pattern: StrugglePattern = {
        type: 'video_skipping',
        severity: skippedDuration > 120 ? 'high' : 'medium',
        context: { topic, timePosition: skippedDuration }
      };
      
      await generateRemediation(pattern);
    }
    
    await logStruggleEvent('video_skipping', { skippedDuration, topic });
  }, []);

  // Track help requests
  const trackHelpRequest = useCallback(async (topic: string, requestType: string) => {
    struggleCounters.current.helpRequests += 1;
    
    if (struggleCounters.current.helpRequests >= 3) {
      const pattern: StrugglePattern = {
        type: 'help_requests',
        severity: 'high',
        context: { topic, frequency: struggleCounters.current.helpRequests }
      };
      
      await generateRemediation(pattern);
    }
    
    await logStruggleEvent('help_request', { topic, requestType });
  }, []);

  // Generate appropriate remediation based on struggle pattern
  const generateRemediation = useCallback(async (pattern: StrugglePattern) => {
    setIsAnalyzing(true);
    
    try {
      let suggestions: RemediationSuggestion[] = [];
      
      switch (pattern.type) {
        case 'quiz_failure':
          suggestions = [
            {
              id: `quiz-help-${Date.now()}`,
              type: 'explanation',
              title: 'Need a different approach?',
              content: `Let me break down ${pattern.context.topic} in a simpler way. This concept can be tricky at first.`,
              actionLabel: 'Get Simple Explanation',
              metadata: { topic: pattern.context.topic }
            },
            {
              id: `quiz-coach-${Date.now()}`,
              type: 'microlearning',
              title: 'Quick Review Session',
              content: 'Try our 2-minute focused review on this topic before attempting the question again.',
              actionLabel: 'Start Quick Review',
              metadata: { duration: 120, topic: pattern.context.topic }
            }
          ];
          break;
          
        case 'excessive_pauses':
          suggestions = [
            {
              id: `pause-tip-${Date.now()}`,
              type: 'explanation',
              title: 'Clarifying Tip',
              content: `Taking your time is great! Here's a key point about ${pattern.context.topic} that might help you move forward.`,
              actionLabel: 'See Tip',
              metadata: { topic: pattern.context.topic }
            }
          ];
          break;
          
        case 'video_skipping':
          suggestions = [
            {
              id: `skip-summary-${Date.now()}`,
              type: 'reminder',
              title: 'Quick Summary',
              content: 'Here are the key points from the section you skipped. We\'ll remind you to review this later.',
              actionLabel: 'See Summary',
              metadata: { topic: pattern.context.topic }
            }
          ];
          break;
          
        case 'help_requests':
          suggestions = [
            {
              id: `peer-support-${Date.now()}`,
              type: 'peer_support',
              title: 'Connect with Peers',
              content: 'Other learners have found success discussing this topic. Would you like to join a study group?',
              actionLabel: 'Find Study Group',
              metadata: { topic: pattern.context.topic }
            }
          ];
          break;
          
        case 'coach_activation':
          suggestions = [
            {
              id: `coach-example-${Date.now()}`,
              type: 'example',
              title: 'Real-World Example',
              content: `Here's how ${pattern.context.topic} applies in a real workplace scenario.`,
              actionLabel: 'See Example',
              metadata: { topic: pattern.context.topic }
            }
          ];
          break;
      }
      
      setActiveSuggestions(prev => [...prev, ...suggestions]);
      
      // Store remediation in database
      await supabase.from('microlearning_recommendations').insert({
        user_id: employeeId,
        training_module_id: moduleId,
        recommendation_type: suggestions[0]?.type || 'explanation',
        title: suggestions[0]?.title || 'Learning Support',
        description: suggestions[0]?.content || '',
        trigger_reason: pattern.type,
        behavioral_context: JSON.parse(JSON.stringify({
          pattern: pattern,
          suggestions: suggestions,
          userRole,
          sessionId,
          sceneId
        }))
      });
      
    } catch (error) {
      console.error('Failed to generate remediation:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [employeeId, moduleId, sceneId, userRole, sessionId]);

  // Log struggle events for analytics
  const logStruggleEvent = useCallback(async (eventType: string, data: any) => {
    try {
      await supabase.from('learner_behavior_tracking').insert({
        user_id: employeeId,
        training_module_id: moduleId,
        session_id: sessionId,
        behavior_type: eventType,
        behavioral_tags: {
          type: eventType,
          severity: data.severity || 'medium',
          context: data,
          sceneId
        }
      });
    } catch (error) {
      console.error('Failed to log struggle event:', error);
    }
  }, [employeeId, moduleId, sceneId, sessionId]);

  // Accept a remediation suggestion
  const acceptSuggestion = useCallback(async (suggestionId: string) => {
    const suggestion = activeSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    // Remove from active suggestions
    setActiveSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    
    // Log acceptance
    await supabase.from('learner_behavior_tracking').insert({
      user_id: employeeId,
      training_module_id: moduleId,
      session_id: sessionId,
      behavior_type: 'remediation_accepted',
      behavioral_tags: { suggestionId, type: suggestion.type, sceneId }
    });
    
    toast.success('Support activated! Continue when ready.');
  }, [activeSuggestions, employeeId, moduleId, sceneId, sessionId]);

  // Dismiss a suggestion
  const dismissSuggestion = useCallback(async (suggestionId: string) => {
    const suggestion = activeSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    setActiveSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    
    // Log dismissal
    await supabase.from('learner_behavior_tracking').insert({
      user_id: employeeId,
      training_module_id: moduleId,
      session_id: sessionId,
      behavior_type: 'remediation_dismissed',
      behavioral_tags: { suggestionId, type: suggestion.type, sceneId }
    });
  }, [activeSuggestions, employeeId, moduleId, sceneId, sessionId]);

  return {
    activeSuggestions,
    isAnalyzing,
    trackQuizFailure,
    trackVideoPause,
    trackCoachActivation,
    trackVideoSkipping,
    trackHelpRequest,
    acceptSuggestion,
    dismissSuggestion
  };
};