import React from 'react';
import { PlayButton } from './PlayButton';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { TimeDisplay } from './TimeDisplay';
import { ScormPlayerSettings } from '@/types/scorm-settings';

interface ScormControlBarProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  settings: ScormPlayerSettings;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMute: () => void;
  onUnmute: () => void;
}

export const ScormControlBar: React.FC<ScormControlBarProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  settings,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onMute,
  onUnmute,
}) => {
  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-3">
      {/* Progress Bar */}
      {settings.showProgressBar && (
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          allowSeek={settings.allowFastForward}
          onSeek={onSeek}
        />
      )}
      
      {/* Control Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Play/Pause Button */}
          <PlayButton
            isPlaying={isPlaying}
            onPlay={onPlay}
            onPause={onPause}
          />
          
          {/* Time Display */}
          <TimeDisplay
            currentTime={currentTime}
            duration={duration}
          />
        </div>
        
        {/* Volume Control */}
        {settings.allowVolumeControl && (
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onMute={onMute}
            onUnmute={onUnmute}
          />
        )}
      </div>
    </div>
  );
};