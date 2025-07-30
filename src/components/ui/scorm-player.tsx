import React, { useRef, useState } from "react";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, AlertCircle, Play } from 'lucide-react';
import { useScormExtraction } from './scorm/hooks/useScormExtraction';
import { useScormTracking } from './scorm/hooks/useScormTracking';
import { useScormMessaging } from './scorm/hooks/useScormMessaging';
import { useScormVideoControl } from './scorm/hooks/useScormVideoControl';
import { ScormControlBar } from './scorm/controls/ScormControlBar';
import { VideoOverlayBlocker } from './scorm/overlay/VideoOverlayBlocker';
import { useVideoCompletion } from './scorm/overlay/VideoCompletionTracker';
import { ScormPlayerSettings, defaultScormSettings } from '@/types/scorm-settings';
import { AIAssistantModal } from '@/components/ai-assistant/AIAssistantModal';
import { AIAssistantButton } from '@/components/ai-assistant/AIAssistantButton';



interface ScormPlayerProps {
  scormPackageUrl?: string;
  onComplete?: (score?: number, duration?: string) => void;
  onProgress?: (progress: number) => void;
  className?: string;
  employeeId?: string;
  trainingModuleId?: string;
  settings?: ScormPlayerSettings;
  moduleName?: string;
  testingMode?: boolean; // New prop to bypass restrictions for admin testing
}

export const ScormPlayer = ({ scormPackageUrl, onComplete, settings = defaultScormSettings, moduleName, testingMode = false, employeeId, trainingModuleId }: ScormPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [seekAttempts, setSeekAttempts] = useState(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  // Use refactored hooks - ALL HOOKS MUST BE CALLED AT TOP LEVEL
  const { isExtracting, extractionError, extractedPackage, extractPackage } = useScormExtraction();
  const { scormData, updateScormData, markComplete } = useScormTracking(onComplete);
  
  // Only set up messaging when we have a URL and extracted package
  const shouldUseMessaging = Boolean(scormPackageUrl && extractedPackage);
  useScormMessaging(updateScormData, shouldUseMessaging ? onComplete : undefined);

  // Special settings for Workplace Violence Training - check module name instead of URL
  const isWorkplaceViolenceTraining = moduleName?.toLowerCase().includes('wpv') || 
                                     moduleName?.toLowerCase().includes('workplace violence') ||
                                     moduleName?.toLowerCase().includes('core wpv');
  
  // For testing, disable fast forward even in testing mode for Workplace Violence Training  
  const effectiveSettings = testingMode ? {
    ...settings,
    allowFastForward: isWorkplaceViolenceTraining ? false : true, // Still disable for WPV training
    allowRewind: true,
    allowSeek: isWorkplaceViolenceTraining ? false : true, // Also disable seeking for WPV
    allowKeyboardShortcuts: true,
    showProgressBar: true,
    allowVolumeControl: true,
    enableOverlayBlocking: isWorkplaceViolenceTraining, // Enable overlay for WPV in testing
    requireFullCompletion: isWorkplaceViolenceTraining // Require full completion for WPV
  } : isWorkplaceViolenceTraining ? {
    ...settings,
    allowFastForward: false,
    allowRewind: true,
    showProgressBar: true,
    allowVolumeControl: true,
    enableOverlayBlocking: true, // Enable overlay blocking for WPV
    requireFullCompletion: true // Require full completion for WPV
  } : settings;

  // Video control hook
  const { videoState, controls, injectControlScripts } = useScormVideoControl(iframeRef, effectiveSettings);
  
  // Video completion tracking for overlay blocking
  const videoCompletion = useVideoCompletion({
    currentTime: videoState.currentTime,
    duration: videoState.duration,
    requiredCompletionPercentage: 95
  });

  console.log("🎓 ScormPlayer rendered with URL:", scormPackageUrl);
  console.log("🎓 Is Workplace Violence Training:", isWorkplaceViolenceTraining);
  console.log("🎓 Testing Mode:", testingMode);
  console.log("🎓 Effective Settings:", effectiveSettings);
  
  // Extract SCORM package when URL is provided - Memoized to prevent excessive calls
  React.useEffect(() => {
    if (scormPackageUrl && !extractedPackage && !isExtracting) {
      console.log("🎓 Starting SCORM extraction for:", scormPackageUrl);
      extractPackage(scormPackageUrl, settings).catch(error => {
        console.error("❌ SCORM extraction failed:", error);
      });
    } else if (!scormPackageUrl) {
      console.log("❌ No SCORM URL provided to player");
    }
  }, [scormPackageUrl, extractPackage, settings, extractedPackage, isExtracting]);

  const handleComplete = () => {
    console.log("🎓 Manual complete button clicked");
    markComplete(100);
  };

  const handleSeekAttempt = () => {
    setSeekAttempts(prev => prev + 1);
    console.log(`🚫 Seek attempt #${seekAttempts + 1} blocked`);
  };

  if (!scormPackageUrl) {
    return (
      <Card className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No SCORM package uploaded</p>
        </div>
      </Card>
    );
  }

  if (isExtracting) {
    return (
      <Card className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Extracting SCORM package...</p>
        </div>
      </Card>
    );
  }

  if (extractionError) {
    return (
      <Card className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
          <div>
            <p className="text-lg font-medium text-foreground">SCORM Load Error</p>
            <p className="text-sm text-muted-foreground mb-4">{extractionError}</p>
            <Button onClick={handleComplete} variant="outline" size="sm">
              Mark Complete (Demo)
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (extractedPackage?.launchUrl) {
    console.log('🎓 Rendering extracted SCORM content with URL:', extractedPackage.launchUrl);
    
    console.log('🎓 Using extracted SCORM launch URL directly:', extractedPackage.launchUrl);
    
    return (
      <div className="w-full space-y-4">
        {/* AI Assistant Button */}
        <AIAssistantButton
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          isActive={showAIAssistant}
        />

        {/* SCORM Player Content */}
         
         <div className="relative w-full bg-white rounded-lg border overflow-hidden" style={{ height: '600px' }}>
            <iframe
              ref={iframeRef}
              src={extractedPackage.launchUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-presentation allow-autoplay"
              title="SCORM Content"
              allow="fullscreen; autoplay; picture-in-picture"
              style={{ 
                backgroundColor: '#ffffff',
                minHeight: '600px'
              }}
               onLoad={() => {
                 console.log('🎓 SCORM iframe loaded successfully using src URL');
                 console.log('🎓 SCORM iframe src:', extractedPackage.launchUrl);
                 
                 // Debug iframe content
                 const iframe = iframeRef.current;
                 if (iframe) {
                   console.log('🎓 Iframe dimensions:', {
                     width: iframe.offsetWidth,
                     height: iframe.offsetHeight,
                     clientWidth: iframe.clientWidth,
                     clientHeight: iframe.clientHeight
                   });
                 }
                 
                 // Inject video control scripts after iframe loads
                 setTimeout(() => {
                   injectControlScripts();
                 }, 2000);
                 
                 // Verify iframe communication after load
                 setTimeout(() => {
                   try {
                     const iframeWindow = iframeRef.current?.contentWindow as any;
                     if (iframeWindow) {
                       console.log('🎓 Iframe window accessible');
                       console.log('🎓 Iframe has API:', !!iframeWindow.API);
                       console.log('🎓 Iframe has API_1484_11:', !!iframeWindow.API_1484_11);
                       
                       // Try to get iframe document
                       try {
                         const doc = iframeWindow.document;
                         console.log('🎓 Iframe document title:', doc?.title || 'No title');
                         console.log('🎓 Iframe document body:', doc?.body ? 'Has body' : 'No body');
                         console.log('🎓 Iframe body innerHTML length:', doc?.body?.innerHTML?.length || 0);
                       } catch (e) {
                         console.log('🎓 Cannot access iframe document (CORS)');
                       }
                     }
                   } catch (e) {
                     console.log('🎓 Cannot access iframe content (expected due to CORS)');
                     console.log('🎓 SCORM communication will use postMessage bridge');
                   }
                 }, 1000);
               }}
               onError={() => {
                 console.error('❌ SCORM iframe failed to load');
               }}
             />
             
             {/* Transparent overlay for blocking fast-forward */}
             <VideoOverlayBlocker
               iframeRef={iframeRef}
               settings={effectiveSettings}
               onSeekAttempt={handleSeekAttempt}
             />
            </div>
         
         {/* Custom Control Bar */}
         {effectiveSettings.showCustomControlBar && (
           <ScormControlBar
             isPlaying={videoState.isPlaying}
             currentTime={videoState.currentTime}
             duration={videoState.duration}
             volume={videoState.volume}
             isMuted={videoState.isMuted}
             settings={effectiveSettings}
             onPlay={controls.play}
             onPause={controls.pause}
             onSeek={controls.seek}
             onVolumeChange={controls.setVolume}
             onMute={controls.mute}
             onUnmute={controls.unmute}
           />
          )}

          {/* AI Assistant Modal */}
          <AIAssistantModal
            isOpen={showAIAssistant}
            onClose={() => setShowAIAssistant(false)}
            trainingContext={{
              moduleId: trainingModuleId || 'unknown',
              moduleName: moduleName || 'SCORM Training',
              topic: moduleName || 'Training Content',
              userRole: 'Learner',
              currentSection: 'SCORM Content'
            }}
          />
         </div>
       );
    }

  return (
    <Card className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">SCORM content not available</p>
      </div>
    </Card>
  );
};