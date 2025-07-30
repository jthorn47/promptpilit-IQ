import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import { ScormPlayerWrapper } from "./ScormPlayerWrapper";
import { CompletionGate } from '@/components/ui/scorm/overlay/CompletionGate';
import { Capacitor } from '@capacitor/core';

interface SBW9237ScormSceneProps {
  assignment: any;
  companySettings: any;
  onComplete: (score?: number) => void;
  testingMode?: boolean; // New prop to bypass timing restrictions
}

export const SBW9237ScormScene = ({ assignment, companySettings, onComplete, testingMode = false }: SBW9237ScormSceneProps) => {
  // Use actual SCORM package URL from database
  const scormPackageUrl = companySettings?.scorm_package_url;
  const [videoState, setVideoState] = useState({ currentTime: 0, duration: 0, isCompleted: false });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(Capacitor.isNativePlatform() || window.innerWidth <= 768);
  }, []);

  const handleScormComplete = (score?: number, duration?: string) => {
    console.log("🎉 SBW-9237 SCORM completed:", { score, duration });
    setVideoState(prev => ({ ...prev, isCompleted: true }));
    // Immediately call onComplete to proceed to next step
    onComplete(score);
  };

  const handleNextAttempt = () => {
    console.log('🚫 Early next attempt blocked - video not fully watched');
  };

  const ScormPlayerFallback = () => (
    <div className="min-h-[600px] bg-accent/5 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading SCORM training...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-background ${Capacitor.isNativePlatform() ? 'capacitor-app' : ''}`}>
      <div className={`container mx-auto py-8 px-4 max-w-6xl ${isMobile ? 'mobile-container' : ''}`}>
        <div className="mb-6">
          {/* Testing mode indicator */}
          {testingMode && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
                <span className="text-sm font-medium">Testing Mode: Fast-forwarding disabled for verification</span>
              </div>
            </div>
          )}
        </div>
        
        <div className={`bg-card rounded-lg border shadow-sm overflow-hidden ${isMobile ? 'scorm-player-container' : ''}`}>
          <ScormPlayerWrapper
            assignment={assignment}
            companySettings={companySettings}
            onComplete={handleScormComplete}
            testingMode={testingMode}
          />
        </div>
          
        {/* Skip Button for Testing Mode */}
        {testingMode && (
          <div className="mt-6 text-center pb-6">
            <Button
              onClick={() => {
                console.log('🎮 Testing Mode Skip button clicked');
                handleScormComplete(100);
              }}
              size="lg"
              className="px-12 py-6 text-xl font-semibold h-auto"
              variant="outline"
            >
              <Play className="w-6 h-6 mr-3" />
              Skip to Next Step (Testing Mode)
            </Button>
          </div>
        )}
        
        {/* Manual Next Button - for testing/fallback - only show if not in testing mode */}
        {!testingMode && (
          <div className="mt-6 text-center pb-6">
            <CompletionGate
              settings={{
                allowFastForward: false,
                allowRewind: true,
                allowSeek: false,
                allowKeyboardShortcuts: false,
                showProgressBar: true,
                allowVolumeControl: true,
                enableOverlayBlocking: true,
                requireFullCompletion: true,
                showCustomControlBar: false
              }}
              currentTime={videoState.currentTime}
              duration={videoState.duration}
              isVideoCompleted={videoState.isCompleted}
              onNextAttempt={handleNextAttempt}
            >
              <Button
                onClick={() => handleScormComplete(100)}
                size="lg"
                className="px-8 py-3"
              >
                Continue to WPV Plan Review
              </Button>
            </CompletionGate>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-muted-foreground">
              Step 2 of 3: Core Training
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};