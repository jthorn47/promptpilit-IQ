import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomVideoPlayerProps {
  videoId: string;
  onEnd?: () => void;
  className?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
}

export const CustomVideoPlayer = ({ 
  videoId, 
  onEnd, 
  className,
  onTimeUpdate,
  onDurationChange 
}: CustomVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePlayPause = () => {
    if (!iframeRef.current) return;
    
    try {
      // Send postMessage to Vimeo iframe to control playback
      const iframe = iframeRef.current;
      const targetOrigin = 'https://player.vimeo.com';
      
      if (isPlaying) {
        iframe.contentWindow?.postMessage('{"method":"pause"}', targetOrigin);
        setIsPlaying(false);
      } else {
        iframe.contentWindow?.postMessage('{"method":"play"}', targetOrigin);
        setIsPlaying(true);
      }
    } catch (error) {
      // Silently handle postMessage errors to avoid console spam
      console.debug('Video playback control not available:', error);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!iframeRef.current || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    try {
      const iframe = iframeRef.current;
      const targetOrigin = 'https://player.vimeo.com';
      
      iframe.contentWindow?.postMessage(
        `{"method":"setCurrentTime","value":${newTime}}`, 
        targetOrigin
      );
      setCurrentTime(newTime);
    } catch (error) {
      // Silently handle postMessage errors to avoid console spam
      console.debug('Video seeking not available:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simplified embed URL that should work reliably
  const embedUrl = `https://player.vimeo.com/video/${videoId}?controls=0&autoplay=0&muted=0&title=0&byline=0&portrait=0`;

  console.log('🎬 CustomVideoPlayer: Rendering video ID:', videoId, 'URL:', embedUrl);

  return (
    <div className={cn("relative aspect-video w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700/50", className)}>
      {/* Vimeo Iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full rounded-xl"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Training Video"
        onLoad={() => {
          console.log('✅ CustomVideoPlayer: Iframe loaded successfully');
          // Simulate some duration for demo purposes
          setDuration(300); // 5 minutes
          onDurationChange?.(300);
        }}
      />

      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-sm p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div 
            className="group relative h-2 bg-white/10 rounded-full cursor-pointer hover:h-3 transition-all duration-300 shadow-inner"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 shadow-lg relative overflow-hidden"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            >
              {/* Progress bar glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
            {/* Hover indicator */}
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 border-2 border-white/50"
                 style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transform: 'translateX(-50%) translateY(-50%)' }} />
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex items-center gap-6">
          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePlayPause}
            className="text-white hover:bg-primary/20 hover:text-primary p-3 rounded-full shadow-xl backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
          >
            <div className="relative">
              {isPlaying ? (
                <Pause className="w-8 h-8 transition-transform duration-200 group-hover:scale-110" fill="currentColor" />
              ) : (
                <Play className="w-8 h-8 transition-transform duration-200 group-hover:scale-110" fill="currentColor" />
              )}
              {/* Button glow effect */}
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Button>

          {/* Time Display */}
          <div className="flex items-center gap-3 text-white bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 shadow-lg">
            <div className="flex items-center gap-1">
              <span className="text-lg font-mono font-medium tabular-nums">{formatTime(currentTime)}</span>
              <span className="text-white/60 text-sm">/</span>
              <span className="text-white/80 text-lg font-mono tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Progress Percentage */}
          <div className="text-white/80 bg-black/30 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10 shadow-lg">
            {Math.round(duration > 0 ? (currentTime / duration) * 100 : 0)}%
          </div>
        </div>
      </div>

      {/* Loading state overlay */}
      {duration === 0 && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">Loading video...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Demo Usage Example
export const CustomVideoPlayerDemo = () => {
  const handleVideoEnd = () => {
    console.log('Video finished! Unlock quiz or next content.');
  };

  const handleTimeUpdate = (currentTime: number) => {
    console.log('Current time:', currentTime);
  };

  const handleDurationChange = (duration: number) => {
    console.log('Video duration:', duration);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4">Custom Video Player Demo</h2>
      
      <CustomVideoPlayer
        videoId="1099527462" // Replace with actual Vimeo video ID
        onEnd={handleVideoEnd}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        className="shadow-2xl"
      />
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Simplified custom video player with basic controls</p>
        <p>Play/Pause functionality using Vimeo postMessage API</p>
      </div>
    </div>
  );
};