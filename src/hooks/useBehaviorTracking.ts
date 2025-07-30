import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BehaviorEvent {
  event_type: 'play' | 'pause' | 'seek' | 'rewind' | 'quiz_attempt' | 'quiz_pass' | 'quiz_fail' | 'dropout' | 'complete';
  event_data?: any;
  current_time_seconds?: number;
  video_duration_seconds?: number;
  engagement_score?: number;
  metadata?: any;
}

interface UseBehaviorTrackingProps {
  employeeId: string;
  sceneId: string;
  assignmentId: string;
  sessionId?: string;
}

export const useBehaviorTracking = ({
  employeeId,
  sceneId,
  assignmentId,
  sessionId = crypto.randomUUID()
}: UseBehaviorTrackingProps) => {
  const [isTracking, setIsTracking] = useState(true);
  const sessionStartTime = useRef(Date.now());
  const lastEventTime = useRef(Date.now());
  const eventQueue = useRef<BehaviorEvent[]>([]);
  const flushTimer = useRef<NodeJS.Timeout>();

  // Track events in batches for performance
  const trackEvent = useCallback(async (event: BehaviorEvent) => {
    if (!isTracking) return;

    const now = Date.now();
    const eventWithTimestamp = {
      ...event,
      event_data: {
        ...event.event_data,
        session_duration: now - sessionStartTime.current,
        time_since_last_event: now - lastEventTime.current,
        timestamp: now,
      }
    };

    eventQueue.current.push(eventWithTimestamp);
    lastEventTime.current = now;

    // Flush queue every 5 seconds or when it reaches 10 events
    if (eventQueue.current.length >= 10) {
      await flushEvents();
    } else {
      clearTimeout(flushTimer.current);
      flushTimer.current = setTimeout(flushEvents, 5000);
    }
  }, [isTracking]);

  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return;

    const events = eventQueue.current.splice(0);
    
    try {
      const eventsToInsert = events.map(event => ({
        employee_id: employeeId,
        scene_id: sceneId,
        assignment_id: assignmentId,
        session_id: sessionId,
        event_type: event.event_type,
        event_data: event.event_data || {},
        current_time_seconds: event.current_time_seconds,
        video_duration_seconds: event.video_duration_seconds,
        engagement_score: event.engagement_score || 0,
        metadata: event.metadata || {}
      }));

      const { error } = await supabase
        .from('user_behavior_analytics')
        .insert(eventsToInsert);

      if (error) {
        console.error('Failed to track behavior events:', error);
        // Re-queue events on failure
        eventQueue.current.unshift(...events);
      }
    } catch (error) {
      console.error('Error flushing behavior events:', error);
      eventQueue.current.unshift(...events);
    }
  }, [employeeId, sceneId, assignmentId, sessionId]);

  // Video-specific tracking helpers
  const trackVideoEvent = useCallback((
    eventType: 'play' | 'pause' | 'seek' | 'rewind' | 'complete',
    currentTime: number,
    duration: number,
    additionalData?: any
  ) => {
    const engagementScore = calculateEngagementScore(eventType, currentTime, duration);
    
    trackEvent({
      event_type: eventType,
      current_time_seconds: currentTime,
      video_duration_seconds: duration,
      engagement_score: engagementScore,
      event_data: additionalData,
      metadata: {
        completion_percentage: duration > 0 ? (currentTime / duration) * 100 : 0
      }
    });
  }, [trackEvent]);

  // Quiz-specific tracking helpers
  const trackQuizEvent = useCallback((
    eventType: 'quiz_attempt' | 'quiz_pass' | 'quiz_fail',
    quizData: any
  ) => {
    const engagementScore = eventType === 'quiz_pass' ? 10 : eventType === 'quiz_fail' ? -2 : 5;
    
    trackEvent({
      event_type: eventType,
      engagement_score: engagementScore,
      event_data: quizData,
      metadata: {
        attempt_number: quizData.attempt_number || 1,
        time_spent: quizData.time_spent || 0
      }
    });
  }, [trackEvent]);

  // Dropout tracking (when user leaves without completing)
  const trackDropout = useCallback((currentTime: number, duration: number, reason?: string) => {
    trackEvent({
      event_type: 'dropout',
      current_time_seconds: currentTime,
      video_duration_seconds: duration,
      engagement_score: -5,
      event_data: { reason },
      metadata: {
        completion_percentage: duration > 0 ? (currentTime / duration) * 100 : 0
      }
    });
  }, [trackEvent]);

  // Calculate engagement score based on behavior patterns
  const calculateEngagementScore = (eventType: string, currentTime: number, duration: number): number => {
    switch (eventType) {
      case 'play':
        return 1;
      case 'pause':
        // Frequent pauses might indicate difficulty or distraction
        return currentTime > duration * 0.1 ? 0 : -1;
      case 'seek':
        // Seeking forward might indicate skipping, seeking backward indicates confusion
        return -1;
      case 'rewind':
        return -2; // Indicates confusion or difficulty
      case 'complete':
        return 10;
      default:
        return 0;
    }
  };

  // Clean up on unmount
  const cleanup = useCallback(() => {
    clearTimeout(flushTimer.current);
    flushEvents();
    setIsTracking(false);
  }, [flushEvents]);

  return {
    trackEvent,
    trackVideoEvent,
    trackQuizEvent,
    trackDropout,
    flushEvents,
    cleanup,
    isTracking,
    sessionId
  };
};