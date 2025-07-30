import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import Player from "@vimeo/player";

interface VimeoEmbedProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  className?: string;
  autoplay?: boolean;
}

export interface VimeoPlayerRef {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  getCurrentTime: () => Promise<number>;
  setCurrentTime: (seconds: number) => Promise<number>;
  getDuration: () => Promise<number>;
  getVideoId: () => Promise<number>;
}

const VimeoEmbed = forwardRef<VimeoPlayerRef, VimeoEmbedProps>(({
  videoId,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  className = "",
  autoplay = false
}, ref) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);

  // Expose player methods via ref
  useImperativeHandle(ref, () => ({
    play: async () => {
      if (vimeoPlayerRef.current) {
        return vimeoPlayerRef.current.play();
      }
      return Promise.resolve();
    },
    pause: async () => {
      if (vimeoPlayerRef.current) {
        return vimeoPlayerRef.current.pause();
      }
      return Promise.resolve();
    },
    getCurrentTime: async () => {
      if (vimeoPlayerRef.current) {
        return vimeoPlayerRef.current.getCurrentTime();
      }
      return Promise.resolve(0);
    },
    setCurrentTime: async (seconds: number) => {
      if (vimeoPlayerRef.current) {
        return vimeoPlayerRef.current.setCurrentTime(seconds);
      }
      return Promise.resolve(0);
    },
    getDuration: async () => {
      if (vimeoPlayerRef.current) {
        return vimeoPlayerRef.current.getDuration();
      }
      return Promise.resolve(0);
    },
    getVideoId: async () => {
      if (vimeoPlayerRef.current) {
        return vimeoPlayerRef.current.getVideoId();
      }
      return Promise.resolve(0);
    }
  }));

  useEffect(() => {
    if (playerRef.current && videoId) {
      // Clean up previous player
      if (vimeoPlayerRef.current) {
        vimeoPlayerRef.current.destroy();
      }

      // Extract numeric ID from string if needed
      const numericVideoId = parseInt(videoId.toString().replace(/\D/g, ''));
      
      console.log('🎬 Initializing Vimeo player with ID:', numericVideoId);

      const player = new Player(playerRef.current, {
        id: numericVideoId,
        autopause: true,
        responsive: true,
        autoplay: autoplay,
        controls: true,
        pip: true, // Picture-in-picture
        playsinline: true,
        width: 800,
        height: 450,
      });

      vimeoPlayerRef.current = player;

      // Event handlers
      player.on("play", () => {
        console.log("🎵 Video is playing");
        onPlay?.();
      });

      player.on("pause", () => {
        console.log("⏸️ Video is paused");
        onPause?.();
      });

      player.on("ended", () => {
        console.log("🏁 Video ended");
        onEnded?.();
      });
      
      if (onTimeUpdate) {
        player.on("timeupdate", (data) => {
          onTimeUpdate(data.seconds);
        });
      }

      player.on("error", (error) => {
        console.error("❌ Vimeo player error:", error);
      });

      // Log when player is ready
      player.ready().then(() => {
        console.log("✅ Vimeo player is ready");
      });
    }

    // Cleanup on unmount
    return () => {
      if (vimeoPlayerRef.current) {
        console.log("🧹 Cleaning up Vimeo player");
        vimeoPlayerRef.current.destroy();
        vimeoPlayerRef.current = null;
      }
    };
  }, [videoId, onTimeUpdate, onPlay, onPause, onEnded, autoplay]);

  if (!videoId) {
    return (
      <div className={`aspect-video w-full border-2 border-dashed rounded-lg flex items-center justify-center border-muted-foreground/30 bg-muted/20 ${className}`}>
        <div className="text-center">
          <p className="text-muted-foreground">No video ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div 
        ref={playerRef} 
        className="w-full aspect-video rounded-lg overflow-hidden"
        style={{ aspectRatio: '16/9' }}
      />
    </div>
  );
});

VimeoEmbed.displayName = "VimeoEmbed";

export default VimeoEmbed;