import { useState, useEffect, useCallback } from 'react';
import { ScormPlayerSettings } from '@/types/scorm-settings';

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

export const useScormVideoControl = (
  iframeRef: React.RefObject<HTMLIFrameElement>,
  settings: ScormPlayerSettings
) => {
  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 100,
    isMuted: false,
  });

  // Since CORS blocks script injection, we'll simulate controls
  const injectControlScripts = useCallback(() => {
    console.log('🎮 CORS-safe control mode activated');
    
    // Simulate a basic video state for UI purposes
    setVideoState({
      isPlaying: false,
      currentTime: 0,
      duration: 300, // Assume 5 minute video
      volume: 100,
      isMuted: false,
    });
  }, []);

  // Control functions using comprehensive postMessage patterns
  const sendCommand = useCallback((command: string, value?: number) => {
    console.log('🎮 Executing command:', command, value);
    
    if (!iframeRef.current?.contentWindow) return;
    
    try {
      const iframe = iframeRef.current;
      
      // Try multiple common video player postMessage formats
      const messages = [];
      
      switch (command) {
        case 'play':
          messages.push(
            // Standard formats
            { cmd: 'play' },
            { command: 'play' },
            { type: 'play' },
            { action: 'play' },
            // YouTube-style
            { event: 'command', func: 'playVideo' },
            // Vimeo-style
            { method: 'play' },
            // H5P-style
            { type: 'h5p', action: 'play' },
            // Video.js style
            { type: 'player', method: 'play' },
            // Generic video element control
            { type: 'video-control', command: 'play' },
            // SCORM-specific attempts
            { type: 'scorm-video', action: 'play' },
            { type: 'training-video', command: 'play' }
          );
          
          setVideoState(prev => ({ 
            ...prev, 
            isPlaying: !prev.isPlaying 
          }));
          break;
          
        case 'pause':
          messages.push(
            { cmd: 'pause' },
            { command: 'pause' },
            { type: 'pause' },
            { action: 'pause' },
            { event: 'command', func: 'pauseVideo' },
            { method: 'pause' },
            { type: 'h5p', action: 'pause' },
            { type: 'player', method: 'pause' },
            { type: 'video-control', command: 'pause' },
            { type: 'scorm-video', action: 'pause' },
            { type: 'training-video', command: 'pause' }
          );
          
          setVideoState(prev => ({ 
            ...prev, 
            isPlaying: false 
          }));
          break;
          
        case 'seek':
          if (value !== undefined && (settings.allowFastForward || value <= videoState.currentTime)) {
            messages.push(
              { cmd: 'seek', param: value },
              { command: 'seek', time: value },
              { type: 'seek', time: value },
              { action: 'seek', currentTime: value },
              { event: 'command', func: 'seekTo', args: [value] },
              { method: 'setCurrentTime', value: value },
              { type: 'player', method: 'currentTime', value: value },
              { type: 'video-control', command: 'seek', time: value },
              { type: 'scorm-video', action: 'seek', time: value }
            );
            
            setVideoState(prev => ({ 
              ...prev, 
              currentTime: value 
            }));
          }
          break;
          
        case 'volume':
          if (value !== undefined) {
            const normalizedVolume = value / 100;
            messages.push(
              { cmd: 'volume', param: normalizedVolume },
              { command: 'volume', level: normalizedVolume },
              { type: 'volume', value: normalizedVolume },
              { action: 'setVolume', volume: normalizedVolume },
              { event: 'command', func: 'setVolume', args: [normalizedVolume] },
              { method: 'setVolume', value: normalizedVolume },
              { type: 'player', method: 'volume', value: normalizedVolume },
              { type: 'video-control', command: 'volume', level: normalizedVolume }
            );
            
            setVideoState(prev => ({ 
              ...prev, 
              volume: value 
            }));
          }
          break;
          
        case 'mute':
          messages.push(
            { cmd: 'mute' },
            { command: 'mute' },
            { type: 'mute' },
            { action: 'mute' },
            { event: 'command', func: 'mute' },
            { method: 'setMuted', value: true },
            { type: 'player', method: 'muted', value: true },
            { type: 'video-control', command: 'mute', muted: true }
          );
          
          setVideoState(prev => ({ 
            ...prev, 
            isMuted: true 
          }));
          break;
          
        case 'unmute':
          messages.push(
            { cmd: 'unmute' },
            { command: 'unmute' },
            { type: 'unmute' },
            { action: 'unmute' },
            { event: 'command', func: 'unMute' },
            { method: 'setMuted', value: false },
            { type: 'player', method: 'muted', value: false },
            { type: 'video-control', command: 'unmute', muted: false }
          );
          
          setVideoState(prev => ({ 
            ...prev, 
            isMuted: false 
          }));
          break;
      }
      
      // Send all message formats
      messages.forEach((message, index) => {
        setTimeout(() => {
          iframe.contentWindow!.postMessage(message, '*');
          console.log(`🎮 Sent message ${index + 1}:`, message);
        }, index * 10); // Small delay between messages
      });
      
    } catch (error) {
      console.warn('🎮 Control command failed:', error);
    }
  }, [settings.allowFastForward, videoState.currentTime]);

  // Simulate video progress for testing
  useEffect(() => {
    if (!videoState.isPlaying) return;
    
    const interval = setInterval(() => {
      setVideoState(prev => ({
        ...prev,
        currentTime: Math.min(prev.currentTime + 1, prev.duration)
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [videoState.isPlaying, videoState.duration]);

  const play = useCallback(() => {
    console.log('🎮 Play button clicked');
    sendCommand('play');
  }, [sendCommand]);
  
  const pause = useCallback(() => {
    console.log('🎮 Pause button clicked');
    sendCommand('pause');
  }, [sendCommand]);
  
  const seek = useCallback((time: number) => {
    console.log('🎮 Seek requested to:', time);
    sendCommand('seek', time);
  }, [sendCommand]);
  
  const setVolume = useCallback((volume: number) => {
    console.log('🎮 Volume change to:', volume);
    sendCommand('volume', volume);
  }, [sendCommand]);
  
  const mute = useCallback(() => {
    console.log('🎮 Mute clicked');
    sendCommand('mute');
  }, [sendCommand]);
  
  const unmute = useCallback(() => {
    console.log('🎮 Unmute clicked');
    sendCommand('unmute');
  }, [sendCommand]);

  return {
    videoState,
    controls: {
      play,
      pause,
      seek,
      setVolume,
      mute,
      unmute,
    },
    injectControlScripts,
  };
};