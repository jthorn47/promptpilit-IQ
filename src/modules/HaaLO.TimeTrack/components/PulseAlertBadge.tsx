import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Coffee, Clock, FileX } from 'lucide-react';
import { PulseAlertType } from '../types';

interface PulseAlertBadgeProps {
  type: PulseAlertType;
  severity: 'low' | 'medium' | 'high';
  message: string;
  pulseLink?: string;
}

export const PulseAlertBadge: React.FC<PulseAlertBadgeProps> = ({
  type,
  severity,
  message,
  pulseLink
}) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'overtime':
        return {
          icon: Clock,
          text: 'OT',
          color: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      case 'missed_break':
        return {
          icon: Coffee,
          text: 'Break',
          color: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
        };
      case 'undertime':
        return {
          icon: AlertTriangle,
          text: 'Hours',
          color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        };
      case 'unapproved_pto':
        return {
          icon: FileX,
          text: 'PTO',
          color: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
        };
      default:
        return {
          icon: AlertTriangle,
          text: 'Alert',
          color: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
    }
  };

  const config = getAlertConfig();
  const Icon = config.icon;

  const handleClick = () => {
    if (pulseLink) {
      window.open(pulseLink, '_blank');
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={`text-xs cursor-pointer ${config.color}`}
            onClick={handleClick}
          >
            <Icon className="h-3 w-3 mr-1" />
            {config.text}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
          {pulseLink && <p className="text-xs text-muted-foreground">Click to view in Pulse</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};