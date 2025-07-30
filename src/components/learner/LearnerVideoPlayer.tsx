import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Volume2, Maximize, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";

interface LearnerVideoPlayerProps {
  scene: {
    id: string;
    title: string;
    content_url: string;
    estimated_duration: number;
  };
  assignment: {
    id: string;
    training_module_id: string;
    employee_id: string;
  };
  onNext: () => void;
}

export const LearnerVideoPlayer = ({ scene, assignment, onNext }: LearnerVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | HTMLIFrameElement>(null);
  const { toast } = useToast();
  const lastTimeRef = useRef(0);

  // Initialize behavior tracking
  const behaviorTracking = useBehaviorTracking({
    employeeId: assignment.employee_id,
    sceneId: scene.id,
    assignmentId: assignment.id,
  });

  // Load existing progress
  useEffect(() => {
    loadProgress();
  }, [scene.id, assignment.id]);

  // Auto-save removed per El Jefe's request

  const loadProgress = async () => {
    try {
      const { data, error } = await supabase
        .from("learner_video_progress")
        .select("*")
        .eq("employee_id", assignment.employee_id)
        .eq("scene_id", scene.id)
        .eq("assignment_id", assignment.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCurrentTime(data.current_time_seconds || 0);
        setDuration(data.duration_seconds || 0);
        setProgress(data.completion_percentage || 0);
        setCanProceed(data.is_completed || false);

        // Seek to saved position if video is loaded
        if (videoRef.current && 'currentTime' in videoRef.current && data.current_time_seconds) {
          videoRef.current.currentTime = data.current_time_seconds;
        }
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const saveProgress = async () => {
    if (!duration || duration === 0) return;

    const completionPercentage = (currentTime / duration) * 100;
    const isCompleted = completionPercentage >= 90; // 90% threshold

    setProgress(completionPercentage);
    setCanProceed(isCompleted);

    try {
      const { error } = await supabase
        .from("learner_video_progress")
        .upsert({
          employee_id: assignment.employee_id,
          scene_id: scene.id,
          assignment_id: assignment.id,
          current_time_seconds: currentTime,
          duration_seconds: duration,
          completion_percentage: completionPercentage,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (videoRef.current && 'play' in videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        behaviorTracking.trackVideoEvent('pause', currentTime, duration);
      } else {
        videoRef.current.play();
        behaviorTracking.trackVideoEvent('play', currentTime, duration);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && 'currentTime' in videoRef.current) {
      const time = videoRef.current.currentTime;
      const timeDiff = Math.abs(time - lastTimeRef.current);
      
      // Detect seeking behavior
      if (timeDiff > 5 && lastTimeRef.current > 0) {
        if (time < lastTimeRef.current) {
          behaviorTracking.trackVideoEvent('rewind', time, duration, {
            seek_from: lastTimeRef.current,
            seek_to: time,
            seek_distance: lastTimeRef.current - time
          });
        } else {
          behaviorTracking.trackVideoEvent('seek', time, duration, {
            seek_from: lastTimeRef.current,
            seek_to: time,
            seek_distance: time - lastTimeRef.current
          });
        }
      }
      
      setCurrentTime(time);
      lastTimeRef.current = time;
      
      // Check if 90% watched or ended
      if (duration > 0) {
        const completionPercentage = (time / duration) * 100;
        setProgress(completionPercentage);
        
        if (completionPercentage >= 90 && !canProceed) {
          setCanProceed(true);
          saveProgress();
          behaviorTracking.trackVideoEvent('complete', time, duration, {
            completion_percentage: completionPercentage
          });
          toast({
            title: "Video Complete!",
            description: "You can now proceed to the questions.",
          });
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && 'duration' in videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      
      // If we have saved progress, seek to that position
      if (currentTime > 0) {
        videoRef.current.currentTime = currentTime;
      }
    }
  };

  const handleEnded = () => {
    setCanProceed(true);
    setProgress(100);
    saveProgress();
    behaviorTracking.trackVideoEvent('complete', duration, duration, {
      completion_percentage: 100,
      completed_naturally: true
    });
    toast({
      title: "Video Complete!",
      description: "You can now proceed to the questions.",
    });
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && 'currentTime' in videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      const oldTime = currentTime;
      
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Track manual seek
      behaviorTracking.trackVideoEvent('seek', newTime, duration, {
        seek_from: oldTime,
        seek_to: newTime,
        seek_distance: Math.abs(newTime - oldTime),
        seek_method: 'progress_bar'
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        handlePlayPause();
        break;
      case 'ArrowLeft':
        if (videoRef.current && 'currentTime' in videoRef.current) {
          const newTime = Math.max(0, currentTime - 10);
          videoRef.current.currentTime = newTime;
          behaviorTracking.trackVideoEvent('rewind', newTime, duration, {
            seek_from: currentTime,
            seek_to: newTime,
            seek_distance: 10,
            seek_method: 'keyboard'
          });
        }
        break;
      case 'ArrowRight':
        if (videoRef.current && 'currentTime' in videoRef.current) {
          const newTime = Math.min(duration, currentTime + 10);
          videoRef.current.currentTime = newTime;
          behaviorTracking.trackVideoEvent('seek', newTime, duration, {
            seek_from: currentTime,
            seek_to: newTime,
            seek_distance: 10,
            seek_method: 'keyboard'
          });
        }
        break;
    }
  };

  const renderVideoPlayer = () => {
    // Check if it's a Vimeo URL (either regular or embed URL)
    if (scene.content_url.includes('vimeo.com') || scene.content_url.includes('player.vimeo.com')) {
      // Extract video ID and create proper embed URL
      let videoId = '';
      let embedUrl = scene.content_url;
      
      if (scene.content_url.includes('vimeo.com/') && !scene.content_url.includes('player.vimeo.com')) {
        // Convert regular Vimeo URL to embed URL
        const videoMatch = scene.content_url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (videoMatch) {
          videoId = videoMatch[1];
          // Use improved embed URL with hidden branding and enabled captions
          embedUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&autopause=0&responsive=1&dnt=1&texttrack=en`;
          console.log(`🎥 Converted to enhanced embed URL: ${embedUrl}`);
        }
      } else if (scene.content_url.includes('player.vimeo.com')) {
        // Extract video ID from existing embed URL
        const videoMatch = scene.content_url.match(/player\.vimeo\.com\/video\/(\d+)/);
        if (videoMatch) {
          videoId = videoMatch[1];
          // Reconstruct with improved parameters
          embedUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&autopause=0&responsive=1&dnt=1&texttrack=en`;
        }
      }
      
      return (
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative">
          <iframe
            ref={videoRef as React.RefObject<HTMLIFrameElement>}
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={`Training video: ${scene.title}`}
            aria-label={`Training video player for ${scene.title}`}
          />
          {/* Vimeo player overlay for better accessibility */}
          <div className="sr-only" aria-live="polite" id="video-status">
            Video player loaded for training module: {scene.title}
          </div>
        </div>
      );
    }

    return (
      <div 
        className="aspect-video w-full bg-black rounded-lg overflow-hidden relative focus-within:ring-2 focus-within:ring-primary"
        role="region"
        aria-label="Video player"
      >
        <video
          ref={videoRef as React.RefObject<HTMLVideoElement>}
          src={scene.content_url}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => {
            setIsPlaying(true);
            behaviorTracking.trackVideoEvent('play', currentTime, duration);
          }}
          onPause={() => {
            setIsPlaying(false);
            behaviorTracking.trackVideoEvent('pause', currentTime, duration);
          }}
          onEnded={handleEnded}
          aria-label={`Training video: ${scene.title}`}
          controls={false}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <track kind="captions" src="" srcLang="en" label="English captions" default />
        </video>
        
        {/* Custom Video Controls */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
          role="toolbar"
          aria-label="Video controls"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="text-white hover:bg-white/20 focus:ring-2 focus:ring-white"
              aria-label={isPlaying ? "Pause video" : "Play video"}
              aria-pressed={isPlaying}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            
            <div className="flex-1" role="slider" aria-label="Video progress">
              <div 
                className="h-2 bg-white/30 rounded-full cursor-pointer focus:ring-2 focus:ring-white"
                onClick={handleSeek}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSeek(e as any);
                  }
                }}
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={currentTime}
                aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              >
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>
            
            <span className="text-white text-sm font-mono" aria-live="polite">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 focus:ring-2 focus:ring-white"
              aria-label="Volume controls"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 focus:ring-2 focus:ring-white"
              aria-label="Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Clean up behavior tracking on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentTime > 0 && currentTime < duration * 0.9) {
        behaviorTracking.trackDropout(currentTime, duration, 'page_unload');
      }
      behaviorTracking.cleanup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      behaviorTracking.cleanup();
    };
  }, [currentTime, duration, behaviorTracking]);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link for keyboard navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
      
      <div className="container mx-auto py-8 px-4 max-w-4xl" id="main-content">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" id="video-title">{scene.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Player */}
            <div aria-labelledby="video-title">
              {renderVideoPlayer()}
            </div>

            {/* Progress */}
            <div className="space-y-2" role="region" aria-label="Training progress">
              <div className="flex justify-between text-sm">
                <span id="progress-label">Video Progress</span>
                <span aria-live="polite">{Math.round(progress)}% Complete</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2" 
                aria-labelledby="progress-label"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              />
              {progress >= 90 && (
                <p className="text-sm text-green-600 font-medium" role="status" aria-live="polite">
                  ✓ Video completed! You can now proceed to questions.
                </p>
              )}
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
              <Button
                onClick={onNext}
                disabled={!canProceed}
                className={`${
                  canProceed 
                    ? 'bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary' 
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                aria-disabled={!canProceed}
                aria-describedby="next-button-help"
              >
                <ArrowRight className="w-4 h-4 mr-2" aria-hidden="true" />
                Next → Answer Questions
              </Button>
            </div>

            {!canProceed && (
              <p 
                className="text-sm text-muted-foreground text-center" 
                id="next-button-help"
                role="status"
              >
                Watch at least 90% of the video to continue
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};