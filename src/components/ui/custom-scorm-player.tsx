import React, { useRef, useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { ScormPlayer } from './scorm-player';

interface CustomScormPlayerProps {
  scormPackageUrl?: string;
  onComplete?: (score?: number, duration?: string) => void;
  onProgress?: (progress: number) => void;
  className?: string;
  employeeId?: string;
  trainingModuleId?: string;
  moduleName?: string;
}

export const CustomScormPlayer = ({
  scormPackageUrl,
  onComplete,
  onProgress,
  moduleName,
  ...props
}: CustomScormPlayerProps) => {
  console.log('🎮 CustomScormPlayer RENDERING with:', { scormPackageUrl, moduleName });
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'initializing' | 'extracting' | 'processing' | 'deploying' | 'loading-content' | 'complete'>('initializing');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [scormPlayerReady, setScormPlayerReady] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const loadingStartTime = useRef<number>(Date.now());

  // Enhanced loading simulation with performance tracking
  useEffect(() => {
    if (!scormPackageUrl) return;
    
    loadingStartTime.current = Date.now();
    console.log('🎮 Starting SCORM loading process...');
    
    const loadingStages = [
      { stage: 'initializing', duration: 500, label: 'Initializing SCORM player...' },
      { stage: 'extracting', duration: 1500, label: 'Extracting SCORM package...' },
      { stage: 'processing', duration: 1000, label: 'Processing training content...' },
      { stage: 'deploying', duration: 800, label: 'Deploying to training environment...' },
      { stage: 'loading-content', duration: 1200, label: 'Loading interactive content...' }
    ];

    let currentStageIndex = 0;
    let totalElapsed = 0;

    const advanceStage = () => {
      if (currentStageIndex < loadingStages.length) {
        const currentStageData = loadingStages[currentStageIndex] as any;
        setLoadingStage(currentStageData.stage);
        console.log(`🎮 Loading stage: ${currentStageData.label}`);
        
        const stageDuration = currentStageData.duration;
        let stageProgress = 0;
        
        const stageInterval = setInterval(() => {
          stageProgress += 2;
          const overallProgress = ((currentStageIndex * 20) + (stageProgress / 5));
          setLoadingProgress(Math.min(overallProgress, 95));
          
          if (stageProgress >= 100) {
            clearInterval(stageInterval);
            currentStageIndex++;
            totalElapsed += stageDuration;
            
            if (currentStageIndex < loadingStages.length) {
              setTimeout(advanceStage, 100);
            } else {
              // Final stage - wait for actual SCORM player to be ready
              setLoadingStage('complete');
              setLoadingProgress(100);
              
              setTimeout(() => {
                setIsLoading(false);
                setScormPlayerReady(true);
                const totalTime = Date.now() - loadingStartTime.current;
                console.log(`🎮 SCORM loading completed in ${totalTime}ms`);
              }, 500);
            }
          }
        }, stageDuration / 50);
      }
    };

    advanceStage();
  }, [scormPackageUrl]);

  // Try to find video element within SCORM iframe
  useEffect(() => {
    const findVideoElement = () => {
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow && iframe.contentDocument) {
          const video = iframe.contentDocument.querySelector('video') as HTMLVideoElement;
          if (video) {
            setVideoElement(video);
            setupVideoListeners(video);
          }
        }
      } catch (error) {
        // CORS restrictions may prevent access
        console.log('Cannot access iframe content directly, using postMessage communication');
      }
    };

    if (!isLoading) {
      // Try multiple times as SCORM content may load asynchronously
      const attempts = [1000, 3000, 5000];
      attempts.forEach(delay => {
        setTimeout(findVideoElement, delay);
      });
    }
  }, [isLoading]);

  const setupVideoListeners = (video: HTMLVideoElement) => {
    const updateProgress = () => {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        setProgress(progress);
        setCurrentTime(video.currentTime);
        setDuration(video.duration);
        onProgress?.(progress);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.(100, formatTime(video.duration));
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', updateProgress);

    // Store for cleanup
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', updateProgress);
    };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
    } else {
      // Fallback: send message to iframe
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: isPlaying ? 'pause' : 'play'
          }, '*');
        }
      } catch (error) {
        console.error('Error controlling video:', error);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleRewind = () => {
    if (videoElement) {
      videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
    } else {
      // Send message to iframe
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'rewind',
            seconds: 10
          }, '*');
        }
      } catch (error) {
        console.error('Error rewinding video:', error);
      }
    }
  };

  const handleMute = () => {
    if (videoElement) {
      videoElement.muted = !videoElement.muted;
      setIsMuted(videoElement.muted);
    } else {
      // Send message to iframe
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'mute',
            muted: !isMuted
          }, '*');
        }
      } catch (error) {
        console.error('Error muting video:', error);
      }
    }
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    const newTime = (duration * newProgress) / 100;
    
    if (videoElement) {
      videoElement.currentTime = newTime;
    } else {
      // Send message to iframe
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'seek',
            time: newTime
          }, '*');
        }
      } catch (error) {
        console.error('Error seeking video:', error);
      }
    }
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  const getLoadingStageMessage = () => {
    switch (loadingStage) {
      case 'initializing': return 'Initializing SCORM player...';
      case 'extracting': return 'Extracting training package...';
      case 'processing': return 'Processing interactive content...';
      case 'deploying': return 'Deploying to training environment...';
      case 'loading-content': return 'Loading multimedia content...';
      case 'complete': return 'Finalizing setup...';
      default: return 'Loading training content...';
    }
  };

  if (isLoading) {
    return (
      <Card className="aspect-video w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
        </div>
        
        <div className="text-center space-y-6 z-10 p-8">
          {/* Animated loader */}
          <div className="relative">
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-400/20 rounded-full mx-auto animate-ping" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">
              {scormPlayerReady ? 'Loading Complete' : 'Loading SCORM Training'}
            </h3>
            <p className="text-white/80 text-lg">
              {getLoadingStageMessage()}
            </p>
            
            {/* Enhanced progress bar */}
            <div className="w-80 mx-auto space-y-2">
              <div className="flex justify-between text-sm text-white/60">
                <span>Progress</span>
                <span>{Math.round(loadingProgress)}%</span>
              </div>
              <div className="relative">
                <Progress value={loadingProgress} className="h-3 bg-slate-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse" 
                     style={{ width: `${loadingProgress}%` }} />
              </div>
            </div>
            
            {/* Performance indicator */}
            <div className="text-xs text-white/50 font-mono">
              Stage: {loadingStage} • Time: {Math.round((Date.now() - loadingStartTime.current) / 1000)}s
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      <div className="aspect-video relative">
        <ScormPlayer
          {...props}
          scormPackageUrl={scormPackageUrl}
          onComplete={onComplete}
          moduleName={moduleName}
          className="w-full h-full"
        />
        
        {/* ALWAYS VISIBLE CONTROLS - OUTSIDE THE PLAYER */}
      </div>
      
      {/* Controls Outside Player */}
      <div className="bg-slate-800 p-4 space-y-3">
        {/* Debug Info */}
        <div className="text-green-400 text-sm font-mono">
          CONTROLS LOADED - Progress: {Math.round(progress)}% | Playing: {isPlaying ? 'YES' : 'NO'}
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div 
            className="h-4 bg-slate-600 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePlayPause}
            className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                PAUSE
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                PLAY
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={handleRewind}
            className="bg-green-600 text-white border-green-600 hover:bg-green-700"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            REWIND 10s
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleMute}
            className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-5 h-5 mr-2" />
                UNMUTE
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 mr-2" />
                MUTE
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};