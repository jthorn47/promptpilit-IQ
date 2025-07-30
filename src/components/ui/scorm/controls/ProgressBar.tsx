import React from 'react';
import { Slider } from '@/components/ui/slider';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  allowSeek: boolean;
  onSeek: (time: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  allowSeek,
  onSeek,
}) => {
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (value: number[]) => {
    if (allowSeek && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      onSeek(newTime);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center space-x-2">
        <Slider
          value={[percentage]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          disabled={!allowSeek}
          className="flex-1"
        />
      </div>
      {!allowSeek && (
        <p className="text-xs text-muted-foreground mt-1">
          Fast forwarding is disabled for this training
        </p>
      )}
    </div>
  );
};