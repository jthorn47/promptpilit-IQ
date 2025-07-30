import React from 'react';

interface TimeDisplayProps {
  currentTime: number;
  duration: number;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  currentTime,
  duration,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-sm text-muted-foreground font-mono">
      {formatTime(currentTime)} / {formatTime(duration)}
    </div>
  );
};