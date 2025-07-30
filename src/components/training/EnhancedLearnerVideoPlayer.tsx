import React, { useEffect, useRef, useState } from 'react';
import { useEnhancedBehaviorTracking } from '@/hooks/useEnhancedBehaviorTracking';
import { SarahRemediationPanel } from './SarahRemediationPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipForward, SkipBack, HelpCircle } from 'lucide-react';

interface Scene {
  id: string;
  title: string;
  description: string;
  content_url: string | null;
  estimated_duration: number;
}

interface Assignment {
  id: string;
  training_module_id: string;
  employee_id: string;
}

interface EnhancedLearnerVideoPlayerProps {
  scene: Scene;
  assignment: Assignment;
  onNext: () => void;
  topic?: string;
}

export const EnhancedLearnerVideoPlayer: React.FC<EnhancedLearnerVideoPlayerProps> = ({
  scene,
  assignment,
  onNext,
  topic = 'General Training'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);

  const behaviorTracking = useEnhancedBehaviorTracking({
    employeeId: assignment.employee_id,
    sceneId: scene.id,
    assignmentId: assignment.id,
    moduleId: assignment.training_module_id
  });

  // Track video events
  const handlePlay = () => {
    setIsPlaying(true);
    behaviorTracking.trackVideoEvent('play', currentTime, duration, { topic });
  };

  const handlePause = () => {
    setIsPlaying(false);
    const newPauseCount = pauseCount + 1;
    setPauseCount(newPauseCount);
    
    behaviorTracking.trackVideoEvent('pause', currentTime, duration, { 
      topic, 
      pauseCount: newPauseCount 
    });
  };

  const handleSeek = (newTime: number) => {
    const seekDistance = Math.abs(newTime - currentTime);
    const seekDirection = newTime > currentTime ? 'forward' : 'backward';
    
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    
    behaviorTracking.trackVideoEvent('seek', newTime, duration, {
      topic,
      seekDirection,
      seekDistance
    });
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    behaviorTracking.trackVideoEvent('complete', duration, duration, { topic });
    onNext();
  };

  const handleHelpRequest = () => {
    behaviorTracking.trackHelpRequest(topic, 'video_help_button');
  };

  // Simulate quiz failure for demonstration
  const simulateQuizFailure = () => {
    behaviorTracking.trackQuizFailure('demo-question-1', 2, topic);
  };

  // Simulate CoachGPT activation
  const simulateCoachActivation = () => {
    behaviorTracking.trackCoachActivation(topic, 'What does this section mean?');
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('ended', handleEnded);
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  if (!scene.content_url) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No video content available for this scene.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <Card>
        <CardContent className="pt-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full h-full"
              src={scene.content_url}
              onPlay={handlePlay}
              onPause={handlePause}
              controls={false}
            />
          </div>
          
          {/* Custom Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSeek(Math.max(0, currentTime - 10))}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                onClick={isPlaying ? handlePause : handlePlay}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {topic}
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleHelpRequest}
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Need Help?
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
              <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Sarah Triggers */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium mb-3">Demo: Trigger Sarah's Remediation</h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={simulateQuizFailure}
            >
              Simulate Quiz Failure
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={simulateCoachActivation}
            >
              Activate CoachGPT
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Try pausing the video multiple times or seeking forward to trigger Sarah's support system.
          </p>
        </CardContent>
      </Card>

      {/* Sarah's Remediation Panel */}
      <SarahRemediationPanel
        suggestions={behaviorTracking.sarahRemediation.activeSuggestions}
        isAnalyzing={behaviorTracking.sarahRemediation.isAnalyzing}
        onAcceptSuggestion={behaviorTracking.sarahRemediation.acceptSuggestion}
        onDismissSuggestion={behaviorTracking.sarahRemediation.dismissSuggestion}
      />
    </div>
  );
};