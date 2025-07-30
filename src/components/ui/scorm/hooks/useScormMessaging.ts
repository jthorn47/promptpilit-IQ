import { useEffect, useCallback } from 'react';
import { ScormData } from './useScormTracking';

export interface ScormMessageData {
  type: string;
  method: string;
  args: any[];
  result?: string;
  scormData?: ScormData;
}

export const useScormMessaging = (
  onScormDataUpdate: (data: Partial<ScormData>) => void,
  onComplete?: (score?: number, duration?: string) => void
) => {
  const handleMessage = useCallback((event: MessageEvent<ScormMessageData>) => {
    // Only handle messages with the correct structure and type
    if (!event.data || event.data.type !== 'SCORM_API_CALL') {
      return; // Ignore non-SCORM messages
    }

    try {
      const { method, args, scormData: iframeScormData } = event.data;
      
      console.log("🎓 Parent received SCORM call:", method, args);
      
      // Update our local state with the iframe's SCORM data
      if (iframeScormData) {
        onScormDataUpdate({
          lessonStatus: iframeScormData.lessonStatus,
          score: iframeScormData.score,
          sessionTime: iframeScormData.sessionTime,
          suspendData: iframeScormData.suspendData
        });
        
        // Check for completion
        if (method === 'LMSSetValue' && args[0] === 'cmi.core.lesson_status') {
          const status = args[1];
          if (status === 'completed' || status === 'passed') {
            console.log("🎉 SCORM completion detected in parent!");
            setTimeout(() => {
              if (onComplete) {
                const score = iframeScormData.score ? parseInt(iframeScormData.score) : 100;
                onComplete(score, iframeScormData.sessionTime);
              }
            }, 500);
          }
        }
      }
    } catch (error) {
      // Silently handle any parsing errors to prevent console spam
      console.debug('SCORM message handling error:', error);
    }
  }, [onScormDataUpdate, onComplete]);

  useEffect(() => {
    // Only set up the listener if we have a completion handler (meaning SCORM content is active)
    if (!onComplete) {
      return; // Don't set up listener if no SCORM content is expected
    }
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage, onComplete]);

  return { handleMessage };
};