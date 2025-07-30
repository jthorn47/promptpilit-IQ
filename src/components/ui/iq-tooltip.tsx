
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IQIcon } from './iq-icon';
import { cn } from '@/lib/utils';

interface IQTooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted' | 'accent';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  maxWidth?: string;
  showBranding?: boolean;
}

export const IQTooltip: React.FC<IQTooltipProps> = ({
  content,
  children,
  size = 'md',
  variant = 'default',
  side = 'top',
  className,
  maxWidth = 'max-w-xs',
  showBranding = false
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || <IQIcon size={size} variant={variant} className={className} />}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className={cn(maxWidth, 'z-50')}
        >
          <div className="space-y-1">
            {content}
            {showBranding && (
              <div className="text-xs text-muted-foreground/60 mt-2 pt-1 border-t border-border/50">
                Powered by HaaLO IQ
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Convenience component for simple text tooltips
export const SimpleIQTooltip: React.FC<{
  text: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted' | 'accent';
  className?: string;
}> = ({ text, size, variant, className }) => (
  <IQTooltip content={<p>{text}</p>} size={size} variant={variant} className={className} />
);
