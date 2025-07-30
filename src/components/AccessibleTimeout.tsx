import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle } from 'lucide-react';

interface AccessibleTimeoutProps {
  timeoutDuration: number; // in seconds
  warningDuration: number; // in seconds before timeout to show warning
  onTimeout: () => void;
  onExtend?: () => void;
  title?: string;
  description?: string;
  extendLabel?: string;
  logoutLabel?: string;
}

export const AccessibleTimeout: React.FC<AccessibleTimeoutProps> = ({
  timeoutDuration,
  warningDuration,
  onTimeout,
  onExtend,
  title = "Session Timeout Warning",
  description = "Your session will expire soon due to inactivity.",
  extendLabel = "Continue Session",
  logoutLabel = "Log Out Now"
}) => {
  const [timeLeft, setTimeLeft] = useState(timeoutDuration);
  const [showWarning, setShowWarning] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const resetTimer = useCallback(() => {
    setTimeLeft(timeoutDuration);
    setShowWarning(false);
    setIsActive(true);
  }, [timeoutDuration]);

  const extendSession = useCallback(() => {
    resetTimer();
    onExtend?.();
  }, [resetTimer, onExtend]);

  // Reset timer on user activity
  useEffect(() => {
    const handleActivity = () => {
      if (isActive) {
        resetTimer();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [resetTimer, isActive]);

  // Countdown timer
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        if (newTime <= warningDuration && !showWarning) {
          setShowWarning(true);
        }
        
        if (newTime <= 0) {
          setIsActive(false);
          onTimeout();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, warningDuration, showWarning, onTimeout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressValue = ((timeoutDuration - timeLeft) / timeoutDuration) * 100;

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md"
        role="alertdialog"
        aria-describedby="timeout-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
            {title}
          </DialogTitle>
          <DialogDescription id="timeout-description">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium">
              Time remaining: <span className="text-danger font-mono">{formatTime(timeLeft)}</span>
            </span>
            <span className="sr-only">
              {timeLeft} seconds remaining before automatic logout
            </span>
          </div>

          <Progress 
            value={progressValue}
            className="w-full"
            aria-label={`Session timeout progress: ${Math.round(progressValue)}% complete`}
          />

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={extendSession}
              className="flex-1"
              autoFocus
              aria-describedby="extend-session-description"
            >
              {extendLabel}
            </Button>
            <Button
              onClick={onTimeout}
              variant="outline"
              className="flex-1"
              aria-describedby="logout-now-description"
            >
              {logoutLabel}
            </Button>
          </div>

          <div className="sr-only">
            <div id="extend-session-description">
              Continue your current session and reset the timeout timer
            </div>
            <div id="logout-now-description">
              End your session immediately and return to the login page
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};