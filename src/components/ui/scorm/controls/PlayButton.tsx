import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface PlayButtonProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
  isPlaying,
  onPlay,
  onPause,
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={isPlaying ? onPause : onPlay}
      className="flex items-center space-x-2"
    >
      {isPlaying ? (
        <Pause className="w-4 h-4" />
      ) : (
        <Play className="w-4 h-4" />
      )}
      <span>{isPlaying ? 'Pause' : 'Play'}</span>
    </Button>
  );
};