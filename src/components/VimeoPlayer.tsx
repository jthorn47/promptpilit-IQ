import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Captions } from 'lucide-react';

interface VimeoPlayerProps {
  videoId: string;
  employeeId: string;
  trainingModuleId: string;
  assignmentId: string;
  completionThreshold?: number; // Percentage required to mark as complete
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
  autoplay?: boolean;
  showControls?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

interface VideoProgress {
  currentTime: number;
  duration: number;
  percentWatched: number;
  isCompleted: boolean;
  watchedSegments: Array<{ start: number; end: number }>;
}

export const VimeoPlayer: React.FC<VimeoPlayerProps> = ({
  videoId,
  employeeId,
  trainingModuleId,
  assignmentId,
  completionThreshold = 80,
  onComplete,
  onProgress,
  autoplay = false,
  showControls = true,
  width = 640,
  height = 360,
  className = ''
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [progress, setProgress] = useState<VideoProgress>({
    currentTime: 0,
    duration: 0,
    percentWatched: 0,
    isCompleted: false,
    watchedSegments: []
  });
  
  const [lastSavedPosition, setLastSavedPosition] = useState(0);
  const saveProgressRef = useRef<NodeJS.Timeout>();

  // Initialize iframe and setup messaging
  useEffect(() => {
    if (!iframeRef.current || !videoId) return;

    const iframe = iframeRef.current;
    setIsReady(true);
    loadSavedProgress();

    // Listen for Vimeo player events via postMessage
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://player.vimeo.com') return;
      
      const data = event.data;
      
      switch (data.event) {
        case 'ready':
          setIsReady(true);
          break;
        case 'play':
          setIsPlaying(true);
          break;
        case 'pause':
          setIsPlaying(false);
          break;
        case 'timeupdate':
          if (data.data) {
            handleTimeUpdate({
              currentTime: data.data.seconds,
              duration: data.data.duration,
              percent: data.data.percent
            });
          }
          break;
        case 'ended':
          handleVideoEnd();
          break;
        case 'volumechange':
          if (data.data) {
            setIsMuted(data.data.volume === 0);
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      if (saveProgressRef.current) {
        clearTimeout(saveProgressRef.current);
      }
      window.removeEventListener('message', handleMessage);
    };
  }, [videoId]);

  // Player control functions using postMessage
  const sendPlayerCommand = useCallback((method: string, value?: any) => {
    if (!iframeRef.current || !isReady) return;
    
    try {
      const data = {
        method,
        value: value !== undefined ? value : null
      };
      
      if (iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify(data), 'https://player.vimeo.com');
      }
    } catch (error) {
      // Silently handle postMessage errors to prevent console spam
      console.debug('Vimeo postMessage failed:', error);
    }
  }, []);

  // Load saved progress from database
  const loadSavedProgress = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('training_completions')
        .select('last_video_position_seconds, video_progress_data')
        .eq('assignment_id', assignmentId)
        .single();

      if (error) {
        console.error('Error loading video progress:', error);
        return;
      }

      if (data?.last_video_position_seconds) {
        sendPlayerCommand('setCurrentTime', data.last_video_position_seconds);
        setLastSavedPosition(data.last_video_position_seconds);
      }

      if (data?.video_progress_data) {
        const progressData = data.video_progress_data as any as VideoProgress;
        setProgress(prev => ({ ...prev, ...progressData }));
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
  }, [assignmentId, sendPlayerCommand]);

  // Handle time updates
  const handleTimeUpdate = useCallback(async (data: { 
    currentTime: number; 
    duration: number; 
    percent: number; 
  }) => {
    const percentWatched = (data.currentTime / data.duration) * 100;
    
    const newProgress: VideoProgress = {
      currentTime: data.currentTime,
      duration: data.duration,
      percentWatched,
      isCompleted: percentWatched >= completionThreshold,
      watchedSegments: progress.watchedSegments // Keep existing segments
    };

    setProgress(newProgress);
    onProgress?.(percentWatched);

    // Debounced save to database
    if (saveProgressRef.current) {
      clearTimeout(saveProgressRef.current);
    }

    saveProgressRef.current = setTimeout(() => {
      saveProgressToDatabase(newProgress);
    }, 2000); // Save every 2 seconds of playback

    // Check for completion
    if (percentWatched >= completionThreshold && !progress.isCompleted) {
      await markAsCompleted(newProgress);
    }
  }, [completionThreshold, progress.isCompleted, progress.watchedSegments, onProgress]);

  // Handle video end
  const handleVideoEnd = async () => {
    const completedProgress: VideoProgress = {
      ...progress,
      percentWatched: 100,
      isCompleted: true
    };
    
    setProgress(completedProgress);
    await markAsCompleted(completedProgress);
  };

  // Save progress to database
  const saveProgressToDatabase = async (progressData: VideoProgress) => {
    try {
      const { error } = await supabase
        .from('training_completions')
        .upsert({
          assignment_id: assignmentId,
          employee_id: employeeId,
          training_module_id: trainingModuleId,
          last_video_position_seconds: Math.floor(progressData.currentTime),
          video_progress_data: progressData as any,
          progress_percentage: Math.floor(progressData.percentWatched),
          video_watched_seconds: Math.floor(progressData.currentTime),
          video_total_seconds: Math.floor(progressData.duration),
          status: progressData.isCompleted ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving video progress:', error);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Mark training as completed
  const markAsCompleted = async (progressData: VideoProgress) => {
    try {
      const { data: completion, error } = await supabase
        .from('training_completions')
        .upsert({
          assignment_id: assignmentId,
          employee_id: employeeId,
          training_module_id: trainingModuleId,
          status: 'completed',
          completed_at: new Date().toISOString(),
          progress_percentage: 100,
          video_progress_data: progressData as any,
          last_video_position_seconds: Math.floor(progressData.currentTime),
          video_watched_seconds: Math.floor(progressData.currentTime),
          video_total_seconds: Math.floor(progressData.duration),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error marking as completed:', error);
        return;
      }

      // Generate certificate on completion
      try {
        const { generateCertificateOnCompletion } = await import('@/services/certificateService');
        const certificateGenerated = await generateCertificateOnCompletion(
          completion.id,
          employeeId,
          trainingModuleId
        );
        
        if (certificateGenerated) {
          toast({
            title: "Training Completed!",
            description: "You have successfully completed this training module. Your certificate has been generated!",
          });
        } else {
          console.warn('Certificate generation failed, but training is complete');
          toast({
            title: "Training Completed!",
            description: "You have successfully completed this training module.",
          });
        }
      } catch (certError) {
        console.error('Error generating certificate:', certError);
        toast({
          title: "Training Completed!",
          description: "You have successfully completed this training module.",
        });
      }

      onComplete?.();
    } catch (error) {
      console.error('Error completing training:', error);
      toast({
        title: "Error",
        description: "Failed to mark training as completed. Please try again.",
        variant: "destructive",
      });
    }
  };


  const togglePlay = () => {
    if (isPlaying) {
      sendPlayerCommand('pause');
    } else {
      sendPlayerCommand('play');
    }
  };

  const toggleMute = () => {
    sendPlayerCommand('setVolume', isMuted ? 1 : 0);
  };

  const restartVideo = () => {
    sendPlayerCommand('setCurrentTime', 0);
    sendPlayerCommand('play');
  };

  const toggleCaptions = () => {
    sendPlayerCommand('enableTextTrack', captionsEnabled ? null : 'en');
    setCaptionsEnabled(!captionsEnabled);
  };

  const toggleFullscreen = () => {
    sendPlayerCommand('requestFullscreen');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Training Video</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {progress.duration > 0 && (
              <span>
                {formatTime(progress.currentTime)} / {formatTime(progress.duration)}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video Player */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            ref={iframeRef}
            src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&autoplay=${autoplay ? 1 : 0}&autopause=0&responsive=1&dnt=1${captionsEnabled ? '&texttrack=en' : ''}`}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            aria-label="Training video player"
            title="Training Video Player"
          />
        </div>

        {/* Progress Bar */}
        {isReady && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {Math.floor(progress.percentWatched)}%</span>
              <span className={`px-2 py-1 rounded text-xs ${
                progress.isCompleted 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {progress.isCompleted ? 'Completed' : 'In Progress'}
              </span>
            </div>
            <Progress value={progress.percentWatched} className="h-2" />
            <div className="text-xs text-muted-foreground">
              Need to watch {completionThreshold}% to complete
            </div>
          </div>
        )}

        {/* Custom Controls */}
        {showControls && isReady && (
          <div className="flex items-center justify-center gap-2 pt-4 border-t flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlay}
              disabled={!isReady}
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={restartVideo}
              disabled={!isReady}
              aria-label="Restart video"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              disabled={!isReady}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleCaptions}
              disabled={!isReady}
              aria-label={captionsEnabled ? "Disable captions" : "Enable captions"}
              className={captionsEnabled ? "bg-primary/10 border-primary/20" : ""}
            >
              <Captions className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              disabled={!isReady}
              aria-label="Enter fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Completion Status */}
        {progress.isCompleted && (
          <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <div className="text-green-800 font-medium">Training Completed!</div>
              <div className="text-sm text-green-600">
                You watched {Math.floor(progress.percentWatched)}% of the video
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VimeoPlayer;