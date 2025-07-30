import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIAssistantButtonProps {
  onClick: () => void;
  isActive?: boolean;
  className?: string;
}

export const AIAssistantButton = ({ 
  onClick, 
  isActive = false,
  className 
}: AIAssistantButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant={isActive ? "default" : "outline"}
      size="sm"
      className={cn(
        "fixed top-4 right-4 z-40 shadow-lg transition-all duration-200",
        "hover:scale-105 active:scale-95",
        isActive && "bg-primary text-primary-foreground",
        className
      )}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {isActive ? 'Close Assistant' : 'Ask CoachGPT'}
    </Button>
  );
};