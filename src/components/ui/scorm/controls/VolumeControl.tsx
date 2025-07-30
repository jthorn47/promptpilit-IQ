import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMute: () => void;
  onUnmute: () => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onMute,
  onUnmute,
}) => {
  const handleVolumeChange = (value: number[]) => {
    onVolumeChange(value[0]);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={isMuted ? onUnmute : onMute}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </Button>
      <Slider
        value={[isMuted ? 0 : volume]}
        onValueChange={handleVolumeChange}
        max={100}
        step={1}
        className="w-20"
      />
    </div>
  );
};