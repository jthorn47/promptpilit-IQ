import { useState, useCallback } from 'react';

export interface ScormData {
  lessonStatus: string;
  score: string;
  sessionTime: string;
  suspendData: string;
}

export const useScormTracking = (
  onComplete?: (score?: number, duration?: string) => void
) => {
  const [scormData, setScormData] = useState<ScormData>({
    lessonStatus: 'not attempted',
    score: '',
    sessionTime: '',
    suspendData: ''
  });

  const updateScormData = useCallback((updates: Partial<ScormData>) => {
    setScormData(prev => {
      const newData = { ...prev, ...updates };
      
      // Check for completion
      if (updates.lessonStatus === 'completed' || updates.lessonStatus === 'passed') {
        console.log("🎉 SCORM course completed!");
        setTimeout(() => {
          if (onComplete) {
            const score = newData.score ? parseInt(newData.score) : 100;
            onComplete(score, newData.sessionTime);
          }
        }, 100);
      }
      
      return newData;
    });
  }, [onComplete]);

  const markComplete = useCallback((score: number = 100) => {
    updateScormData({
      lessonStatus: 'completed',
      score: score.toString()
    });
  }, [updateScormData]);

  const reset = useCallback(() => {
    setScormData({
      lessonStatus: 'not attempted',
      score: '',
      sessionTime: '',
      suspendData: ''
    });
  }, []);

  return {
    scormData,
    updateScormData,
    markComplete,
    reset
  };
};