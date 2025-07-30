import { useState, useEffect } from 'react';

interface VideoCompletionState {
  watchedSegments: Array<{start: number, end: number}>;
  actualWatchTime: number;
  completionPercentage: number;
  isFullyCompleted: boolean;
}

interface UseVideoCompletionProps {
  currentTime: number;
  duration: number;
  requiredCompletionPercentage?: number;
}

export const useVideoCompletion = ({
  currentTime,
  duration,
  requiredCompletionPercentage = 95
}: UseVideoCompletionProps): VideoCompletionState => {
  const [watchedSegments, setWatchedSegments] = useState<Array<{start: number, end: number}>>([]);
  const [actualWatchTime, setActualWatchTime] = useState(0);

  // Track video progress in 1-second increments
  useEffect(() => {
    if (currentTime > 0 && duration > 0) {
      const currentSecond = Math.floor(currentTime);
      
      setWatchedSegments(prev => {
        // Check if this second has already been watched
        const alreadyWatched = prev.some(segment => 
          currentSecond >= segment.start && currentSecond < segment.end
        );
        
        if (!alreadyWatched) {
          // Add new watched segment
          const newSegment = { start: currentSecond, end: currentSecond + 1 };
          const updatedSegments = [...prev, newSegment];
          
          // Merge overlapping segments for efficiency
          const mergedSegments = mergeSegments(updatedSegments);
          
          // Calculate total watched time
          const totalWatched = mergedSegments.reduce((total, segment) => {
            return total + (segment.end - segment.start);
          }, 0);
          
          setActualWatchTime(totalWatched);
          return mergedSegments;
        }
        
        return prev;
      });
    }
  }, [currentTime, duration]);

  const completionPercentage = duration > 0 ? (actualWatchTime / duration) * 100 : 0;
  const isFullyCompleted = completionPercentage >= requiredCompletionPercentage;

  return {
    watchedSegments,
    actualWatchTime,
    completionPercentage,
    isFullyCompleted
  };
};

// Helper function to merge overlapping segments
const mergeSegments = (segments: Array<{start: number, end: number}>): Array<{start: number, end: number}> => {
  if (segments.length <= 1) return segments;
  
  const sorted = segments.sort((a, b) => a.start - b.start);
  const merged = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    
    if (current.start <= last.end) {
      // Merge overlapping segments
      last.end = Math.max(last.end, current.end);
    } else {
      // Add non-overlapping segment
      merged.push(current);
    }
  }
  
  return merged;
};