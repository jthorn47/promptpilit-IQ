import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, ArrowLeft } from 'lucide-react';

interface VideoPlayer {
  play(): Promise<void>;
  pause(): Promise<void>;
  getCurrentTime(): Promise<number>;
  setCurrentTime(time: number): Promise<void>;
  getDuration(): Promise<number>;
  getVolume(): Promise<number>;
  setVolume(volume: number): Promise<void>;
  setMuted(muted: boolean): Promise<void>;
  getMuted(): Promise<boolean>;
  destroy(): void;
  on(event: string, callback: () => void): void;
}

declare global {
  interface Window {
    Vimeo: {
      Player: new (element: HTMLElement, options: any) => VideoPlayer;
    };
  }
}

export const SecureVideoPlayer: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [player, setPlayer] = useState<VideoPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 10, y: 10 });
  
  const playerRef = useRef<HTMLDivElement>(null);
  const watermarkIntervalRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  
  const token = searchParams.get('token');
  const moduleId = searchParams.get('module');
  const sessionToken = searchParams.get('session');

  useEffect(() => {
    if (!token || !moduleId || !sessionToken || !user) {
      setError('Invalid access parameters');
      setLoading(false);
      return;
    }

    validateAccessAndLoadVideo();
    startWatermarkRotation();
    
    // Prevent right-click and common shortcuts
    const preventRightClick = (e: MouseEvent) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+U, etc.
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', preventKeys);

    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', preventKeys);
      
      if (watermarkIntervalRef.current) {
        clearInterval(watermarkIntervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (player) {
        player.destroy();
      }
    };
  }, [token, moduleId, sessionToken, user]);

  const validateAccessAndLoadVideo = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-video-access', {
        body: { 
          action: 'validate_token',
          token,
          moduleId
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Access validation failed');
      }

      // Load training module data
      const { data: moduleData, error: moduleError } = await supabase
        .from('training_modules')
        .select(`
          id,
          title,
          description,
          vimeo_video_id,
          vimeo_embed_url,
          video_duration_seconds,
          estimated_duration
        `)
        .eq('id', moduleId)
        .single();

      if (moduleError) throw moduleError;

      setVideoData({
        ...moduleData,
        user_email: data.user_email,
        video_position: data.video_position || 0
      });

      // Initialize Vimeo player if video ID exists
      if (moduleData.vimeo_video_id && playerRef.current) {
        await loadVimeoScript();
        initializeVimeoPlayer(moduleData.vimeo_video_id, data.video_position || 0);
      }

    } catch (error) {
      console.error('Video access validation error:', error);
      setError(error.message);
      toast.error('Access denied: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadVimeoScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Vimeo) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://player.vimeo.com/api/player.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Vimeo player'));
      document.head.appendChild(script);
    });
  };

  const initializeVimeoPlayer = (videoId: string, startTime: number = 0) => {
    if (!playerRef.current || !window.Vimeo) return;

    const vimeoPlayer = new window.Vimeo.Player(playerRef.current, {
      id: videoId,
      width: '100%',
      height: 400,
      controls: true,
      responsive: true,
      dnt: true, // Do not track
      title: false,
      byline: false,
      portrait: false
    });

    // Set start time if provided
    if (startTime > 0) {
      vimeoPlayer.setCurrentTime(startTime);
    }

    // Set up event listeners
    vimeoPlayer.on('play', () => {
      setIsPlaying(true);
      startProgressTracking();
    });

    vimeoPlayer.on('pause', () => {
      setIsPlaying(false);
      stopProgressTracking();
    });

    vimeoPlayer.on('ended', () => {
      setIsPlaying(false);
      stopProgressTracking();
      // TODO: Trigger completion and certificate generation
    });

    setPlayer(vimeoPlayer);
  };

  const startWatermarkRotation = () => {
    const rotateWatermark = () => {
      const positions = [
        { x: 10, y: 10 },      // Top-left
        { x: 10, y: 90 },      // Bottom-left
        { x: 90, y: 10 },      // Top-right
        { x: 90, y: 90 },      // Bottom-right
        { x: 50, y: 10 },      // Top-center
        { x: 50, y: 90 },      // Bottom-center
      ];
      
      const randomPosition = positions[Math.floor(Math.random() * positions.length)];
      setWatermarkPosition(randomPosition);
    };

    // Rotate every 60 seconds
    watermarkIntervalRef.current = setInterval(rotateWatermark, 60000);
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) return;

    progressIntervalRef.current = setInterval(async () => {
      if (!player) return;

      try {
        const currentTime = await player.getCurrentTime();
        const duration = await player.getDuration();
        const progressPercent = (currentTime / duration) * 100;
        
        setProgress(progressPercent);

        // Save progress every 30 seconds
        if (Math.floor(currentTime) % 30 === 0) {
          await saveVideoProgress(currentTime, progressPercent);
        }
      } catch (error) {
        console.error('Error tracking progress:', error);
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = undefined;
    }
  };

  const saveVideoProgress = async (currentTime: number, progressPercent: number) => {
    try {
      // Create or update training completion record
      const { data: existingCompletion } = await supabase
        .from('training_completions')
        .select('id, assignment_id')
        .eq('employee_id', user?.id)
        .eq('training_module_id', moduleId)
        .single();

      if (existingCompletion) {
        // Update existing completion
        await supabase
          .from('training_completions')
          .update({
            last_video_position_seconds: Math.floor(currentTime),
            progress_percentage: Math.floor(progressPercent),
            video_watched_seconds: Math.floor(currentTime),
            status: progressPercent >= 80 ? 'completed' : 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCompletion.id);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handlePlayPause = async () => {
    if (!player) return;

    try {
      if (isPlaying) {
        await player.pause();
      } else {
        await player.play();
      }
    } catch (error) {
      console.error('Error controlling playback:', error);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    if (!player) return;

    try {
      await player.setVolume(newVolume);
      setVolume(newVolume);
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };

  const handleMuteToggle = async () => {
    if (!player) return;

    try {
      await player.setMuted(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating access and loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => navigate('/admin/training-modules')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Training
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Security Banner */}
      <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground p-2 text-center text-sm z-50">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-4 w-4" />
          Secure Training Session - Content is protected and monitored
        </div>
      </div>

      {/* Dynamic Watermark */}
      {videoData?.user_email && (
        <div 
          className="absolute text-white/30 text-sm font-mono pointer-events-none z-40 transition-all duration-1000"
          style={{
            left: `${watermarkPosition.x}%`,
            top: `${watermarkPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}
        >
          {videoData.user_email}
        </div>
      )}

      {/* Main Content */}
      <div className="pt-12 pb-4 px-4 h-screen flex flex-col">
        {/* Video Header */}
        <div className="mb-4">
          <h1 className="text-white text-xl font-bold">{videoData?.title}</h1>
          <p className="text-white/70 text-sm">{videoData?.description}</p>
        </div>

        {/* Video Player Container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl bg-black rounded-lg overflow-hidden">
            <div ref={playerRef} className="w-full aspect-video bg-black" />
          </div>
        </div>

        {/* Video Controls */}
        <div className="mt-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePlayPause}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleMuteToggle}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            <div className="flex items-center gap-2 flex-1">
              <span className="text-white text-sm min-w-0">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1"
              />
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/admin/training-modules')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-white text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>
      </div>

      {/* Anti-Screenshot Overlay (for additional protection) */}
      <div className="fixed inset-0 pointer-events-none z-30 opacity-0 hover:opacity-5 transition-opacity">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      </div>
    </div>
  );
};