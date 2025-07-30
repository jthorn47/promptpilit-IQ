import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBehaviorTracking } from './useBehaviorTracking';
import { useSarahRemediation } from './useSarahRemediation';

interface EnhancedTrackingProps {
  employeeId: string;
  sceneId: string;
  assignmentId: string;
  moduleId: string;
  sessionId?: string;
}

export const useEnhancedBehaviorTracking = ({
  employeeId,
  sceneId,
  assignmentId,
  moduleId,
  sessionId = crypto.randomUUID()
}: EnhancedTrackingProps) => {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const lastEngagementUpdate = useRef(Date.now());
  const sessionStartTime = useRef(Date.now());
  
  const baseBehaviorTracking = useBehaviorTracking({
    employeeId,
    sceneId,
    assignmentId,
    sessionId
  });

  // Initialize Sarah's remediation system
  const sarahRemediation = useSarahRemediation({
    employeeId,
    moduleId,
    sceneId,
    sessionId
  });

  // Update engagement heatmap in real-time
  const updateEngagementHeatmap = useCallback(async (
    timePosition: number,
    engagementScore: number,
    eventType: string
  ) => {
    try {
      const now = Date.now();
      
      // Throttle updates to every 5 seconds
      if (now - lastEngagementUpdate.current < 5000) return;
      lastEngagementUpdate.current = now;

      // Calculate time position as percentage
      const videoDuration = 100; // This should come from actual video duration
      const positionPercentage = Math.round((timePosition / videoDuration) * 100);

      // Update or insert heatmap data
      const { data: existing } = await supabase
        .from('module_engagement_heatmaps')
        .select('*')
        .eq('module_id', moduleId)
        .eq('scene_id', sceneId)
        .eq('time_position', positionPercentage)
        .single();

      if (existing) {
        // Update existing data point
        const updateData: any = {
          engagement_score: (existing.engagement_score + engagementScore) / 2,
        };

        if (eventType === 'dropout') updateData.dropout_count = existing.dropout_count + 1;
        if (eventType === 'pause') updateData.pause_count = existing.pause_count + 1;
        if (eventType === 'seek') updateData.seek_count = existing.seek_count + 1;
        if (eventType === 'rewind') updateData.rewatch_count = existing.rewatch_count + 1;

        await supabase
          .from('module_engagement_heatmaps')
          .update(updateData)
          .eq('id', existing.id);
      } else {
        // Create new data point
        await supabase
          .from('module_engagement_heatmaps')
          .insert({
            module_id: moduleId,
            scene_id: sceneId,
            time_position: positionPercentage,
            engagement_score: engagementScore,
            dropout_count: eventType === 'dropout' ? 1 : 0,
            pause_count: eventType === 'pause' ? 1 : 0,
            seek_count: eventType === 'seek' ? 1 : 0,
            rewatch_count: eventType === 'rewind' ? 1 : 0
          });
      }

    } catch (error) {
      console.error('Failed to update engagement heatmap:', error);
    }
  }, [moduleId, sceneId]);

  // Enhanced video tracking with heatmap updates
  const trackVideoEvent = useCallback((
    eventType: 'play' | 'pause' | 'seek' | 'rewind' | 'complete',
    currentTime: number,
    duration: number,
    additionalData?: any
  ) => {
    // Call base tracking
    baseBehaviorTracking.trackVideoEvent(eventType, currentTime, duration, additionalData);
    
    // Calculate engagement score based on behavior
    let engagementScore = 5; // baseline
    
    switch (eventType) {
      case 'play':
        engagementScore = 7;
        break;
      case 'pause':
        // Frequent pauses might indicate difficulty
        const pauseFrequency = additionalData?.pauseCount || 1;
        engagementScore = Math.max(2, 6 - pauseFrequency);
        
        // Track with Sarah for remediation
        sarahRemediation.trackVideoPause(currentTime, additionalData?.topic);
        break;
      case 'seek':
        // Forward seeking might indicate skipping
        const seekDirection = additionalData?.seekDirection || 'forward';
        engagementScore = seekDirection === 'forward' ? 3 : 4;
        
        // Track significant skipping
        if (seekDirection === 'forward' && additionalData?.seekDistance > 30) {
          sarahRemediation.trackVideoSkipping(additionalData.seekDistance, additionalData?.topic);
        }
        break;
      case 'rewind':
        engagementScore = 4; // Indicates confusion but engagement
        break;
      case 'complete':
        engagementScore = 10;
        break;
    }
    
    // Update heatmap
    updateEngagementHeatmap(currentTime, engagementScore, eventType);
  }, [baseBehaviorTracking.trackVideoEvent, updateEngagementHeatmap, sarahRemediation]);

  // Track dropout with enhanced analytics
  const trackDropout = useCallback(async (
    currentTime: number, 
    duration: number, 
    reason?: string
  ) => {
    // Call base tracking
    baseBehaviorTracking.trackDropout(currentTime, duration, reason);
    
    // Update heatmap with dropout data
    await updateEngagementHeatmap(currentTime, 1, 'dropout');
    
    // Update module analytics
    try {
      await updateModuleDropoutAnalytics(currentTime, duration, reason);
    } catch (error) {
      console.error('Failed to update module dropout analytics:', error);
    }
  }, [baseBehaviorTracking.trackDropout, updateEngagementHeatmap, moduleId]);

  // Update module-level analytics
  const updateModuleDropoutAnalytics = useCallback(async (
    currentTime: number,
    duration: number,
    reason?: string
  ) => {
    try {
      const { data: existing } = await supabase
        .from('training_module_analytics')
        .select('*')
        .eq('module_id', moduleId)
        .single();

      const completionPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
      const sessionDuration = Date.now() - sessionStartTime.current;
      
      if (existing) {
        // Calculate new dropout rate and update analytics
        const newDropoutRate = existing.dropout_rate + 1; // Simplified increment
        const newAvgTime = (existing.average_completion_time + sessionDuration) / 2;
        
        const currentIndicators = existing.struggle_indicators as any || {};
        const updatedStruggleIndicators = {
          ...currentIndicators,
          dropout_points: [
            ...(currentIndicators?.dropout_points || []),
            {
              time: currentTime,
              percentage: completionPercentage,
              reason,
              sessionDuration
            }
          ].slice(-10) // Keep last 10 dropout points
        };

        await supabase
          .from('training_module_analytics')
          .update({
            dropout_rate: newDropoutRate,
            average_completion_time: newAvgTime,
            struggle_indicators: updatedStruggleIndicators
          })
          .eq('id', existing.id);
      } else {
        // Create new analytics record
        await supabase
          .from('training_module_analytics')
          .insert({
            module_id: moduleId,
            dropout_rate: 1,
            average_completion_time: sessionDuration,
            struggle_indicators: {
              dropout_points: [{
                time: currentTime,
                percentage: completionPercentage,
                reason,
                sessionDuration
              }]
            }
          });
      }
    } catch (error) {
      console.error('Failed to update module analytics:', error);
    }
  }, [moduleId]);

  // Get current engagement data for real-time display
  const getCurrentEngagementData = useCallback(() => {
    return {
      sessionDuration: Date.now() - sessionStartTime.current,
      heatmapData,
      sessionId
    };
  }, [heatmapData, sessionId]);

  // Enhanced quiz failure tracking
  const trackQuizFailure = useCallback(async (questionId: string, attempt: number, topic: string) => {
    await sarahRemediation.trackQuizFailure(questionId, attempt, topic);
  }, [sarahRemediation]);

  // Enhanced coach activation tracking
  const trackCoachActivation = useCallback(async (topic: string, question: string) => {
    await sarahRemediation.trackCoachActivation(topic, question);
  }, [sarahRemediation]);

  // Enhanced help request tracking
  const trackHelpRequest = useCallback(async (topic: string, requestType: string) => {
    await sarahRemediation.trackHelpRequest(topic, requestType);
  }, [sarahRemediation]);

  return {
    ...baseBehaviorTracking,
    trackVideoEvent,
    trackDropout,
    updateEngagementHeatmap,
    getCurrentEngagementData,
    // Sarah's remediation system
    trackQuizFailure,
    trackCoachActivation,
    trackHelpRequest,
    sarahRemediation
  };
};