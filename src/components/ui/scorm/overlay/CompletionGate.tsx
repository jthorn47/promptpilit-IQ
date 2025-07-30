import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ScormPlayerSettings } from '@/types/scorm-settings';

interface CompletionGateProps {
  settings: ScormPlayerSettings;
  currentTime: number;
  duration: number;
  isVideoCompleted: boolean;
  onNextAttempt?: () => void;
  children: React.ReactNode;
}

export const CompletionGate: React.FC<CompletionGateProps> = ({
  settings,
  currentTime,
  duration,
  isVideoCompleted,
  onNextAttempt,
  children
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [actualWatchTime, setActualWatchTime] = useState(0);
  const [watchedSegments, setWatchedSegments] = useState<Array<{start: number, end: number}>>([]);

  // Track actual watch time
  useEffect(() => {
    if (currentTime > 0 && duration > 0) {
      const currentSegment = { start: Math.floor(currentTime), end: Math.floor(currentTime) + 1 };
      
      setWatchedSegments(prev => {
        // Check if this second has already been watched
        const alreadyWatched = prev.some(segment => 
          currentSegment.start >= segment.start && currentSegment.start <= segment.end
        );
        
        if (!alreadyWatched) {
          const newSegments = [...prev, currentSegment];
          
          // Calculate total unique watch time
          const totalWatched = newSegments.reduce((total, segment) => {
            return total + (segment.end - segment.start);
          }, 0);
          
          setActualWatchTime(totalWatched);
          return newSegments;
        }
        
        return prev;
      });
    }
  }, [currentTime, duration]);

  const calculateCompletionPercentage = () => {
    if (duration <= 0) return 0;
    return (actualWatchTime / duration) * 100;
  };

  const isFullyWatched = () => {
    const completionPercentage = calculateCompletionPercentage();
    return completionPercentage >= 95; // Require 95% completion
  };

  const handleNextClick = (event: React.MouseEvent) => {
    if (!settings.requireFullCompletion) return;

    if (!isFullyWatched() && !isVideoCompleted) {
      event.preventDefault();
      event.stopPropagation();
      setShowAlert(true);
      onNextAttempt?.();
      return false;
    }
    
    return true;
  };

  // Intercept clicks on children (Next buttons, etc.)
  const wrappedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === Button) {
      // If it's a Button component, wrap it with our completion check
      return React.cloneElement(child, {
        ...child.props,
        onClick: (event: React.MouseEvent) => {
          const canProceed = handleNextClick(event);
          if (canProceed && child.props.onClick) {
            child.props.onClick(event);
          }
        },
        disabled: settings.requireFullCompletion ? !isFullyWatched() && !isVideoCompleted : child.props.disabled
      });
    }
    return child;
  });

  return (
    <>
      {wrappedChildren}
      
      {/* Completion requirement alert */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete the Video First</AlertDialogTitle>
            <AlertDialogDescription>
              You must watch the entire video to complete this training. 
              Current progress: {Math.round(calculateCompletionPercentage())}% of video watched.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowAlert(false)}>
            Continue Watching
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};