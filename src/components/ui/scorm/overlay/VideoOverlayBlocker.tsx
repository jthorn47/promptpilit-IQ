import React, { useState, useEffect, useRef } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScormPlayerSettings } from '@/types/scorm-settings';

interface VideoOverlayBlockerProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  settings: ScormPlayerSettings;
  onSeekAttempt?: () => void;
}

export const VideoOverlayBlocker: React.FC<VideoOverlayBlockerProps> = ({
  iframeRef,
  settings,
  onSeekAttempt
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Update overlay position based on iframe
  useEffect(() => {
    const updateOverlayPosition = () => {
      if (!iframeRef.current || !settings.enableOverlayBlocking) return;

      const iframe = iframeRef.current;
      const iframeRect = iframe.getBoundingClientRect();
      const parentRect = iframe.offsetParent?.getBoundingClientRect() || { top: 0, left: 0 };

      // Position overlay over the bottom portion where seek bar typically appears
      const seekBarHeight = 60; // Approximate height of typical video control bar
      const seekBarTop = iframeRect.height - seekBarHeight;

      setOverlayPosition({
        top: seekBarTop,
        left: 0,
        width: iframeRect.width,
        height: seekBarHeight
      });
    };

    // Update position on mount and resize
    updateOverlayPosition();
    window.addEventListener('resize', updateOverlayPosition);

    // Use ResizeObserver if available for iframe size changes
    if (window.ResizeObserver && iframeRef.current) {
      const resizeObserver = new ResizeObserver(updateOverlayPosition);
      resizeObserver.observe(iframeRef.current);
      
      return () => {
        window.removeEventListener('resize', updateOverlayPosition);
        resizeObserver.disconnect();
      };
    }

    return () => {
      window.removeEventListener('resize', updateOverlayPosition);
    };
  }, [iframeRef, settings.enableOverlayBlocking]);

  const handleOverlayInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    // Prevent default behavior and show alert
    event.preventDefault();
    event.stopPropagation();
    
    setShowAlert(true);
    onSeekAttempt?.();
    
    console.log('🚫 Seek attempt blocked by overlay');
  };

  const handleKeyboardBlock = (event: React.KeyboardEvent) => {
    if (!settings.enableOverlayBlocking) return;

    // Block common fast-forward shortcuts
    const blockedKeys = [
      'ArrowRight', 'ArrowLeft', // Seek keys
      'l', 'j', // YouTube-style shortcuts
      'f', // Fullscreen toggle (if we want to block it)
    ];

    if (blockedKeys.includes(event.key) || blockedKeys.includes(event.code)) {
      event.preventDefault();
      event.stopPropagation();
      setShowAlert(true);
      onSeekAttempt?.();
    }
  };

  if (!settings.enableOverlayBlocking) {
    return null;
  }

  return (
    <>
      {/* Transparent overlay over seek bar area */}
      <div
        ref={overlayRef}
        className="absolute z-10 cursor-not-allowed"
        style={{
          top: overlayPosition.top,
          left: overlayPosition.left,
          width: overlayPosition.width,
          height: overlayPosition.height,
          backgroundColor: 'transparent',
          pointerEvents: 'auto'
        }}
        onClick={handleOverlayInteraction}
        onTouchStart={handleOverlayInteraction}
        onMouseDown={handleOverlayInteraction}
        onKeyDown={handleKeyboardBlock}
        tabIndex={0}
        aria-label="Video controls are disabled during training"
      />

      {/* Alert dialog for blocked seek attempts */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Training Requirement</AlertDialogTitle>
            <AlertDialogDescription>
              You must watch the entire video to complete this training. Fast-forwarding is not allowed.
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