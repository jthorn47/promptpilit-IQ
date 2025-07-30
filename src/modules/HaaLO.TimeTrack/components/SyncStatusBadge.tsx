import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RotateCcw, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { SyncStatus } from '../types';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  destination?: 'payroll' | 'jobcost' | 'both';
  lastSyncAttempt?: string;
  errorMessage?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  status,
  destination = 'both',
  lastSyncAttempt,
  errorMessage,
  onRetry,
  isRetrying = false
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: 'Synced',
          className: 'bg-green-100 text-green-800 hover:bg-green-200'
        };
      case 'pending':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          text: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        };
      case 'error':
        return {
          variant: 'destructive' as const,
          icon: AlertCircle,
          text: 'Error',
          className: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      case 'retry':
        return {
          variant: 'outline' as const,
          icon: RotateCcw,
          text: 'Retry',
          className: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: Clock,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const getDestinationText = () => {
    switch (destination) {
      case 'payroll':
        return 'PayrollIQ';
      case 'jobcost':
        return 'ProjectIQ';
      case 'both':
        return 'PayrollIQ & ProjectIQ';
      default:
        return 'Systems';
    }
  };

  const getTooltipContent = () => {
    const destinationText = getDestinationText();
    
    switch (status) {
      case 'synced':
        return `Successfully synced to ${destinationText}${lastSyncAttempt ? ` at ${new Date(lastSyncAttempt).toLocaleString()}` : ''}`;
      case 'pending':
        return `Waiting to sync to ${destinationText}`;
      case 'error':
        return `Failed to sync to ${destinationText}${errorMessage ? `: ${errorMessage}` : ''}`;
      case 'retry':
        return `Retrying sync to ${destinationText}`;
      default:
        return `Sync status unknown for ${destinationText}`;
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`text-xs ${config.className}`}>
              <Icon className="h-3 w-3 mr-1" />
              {config.text}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipContent()}</p>
          </TooltipContent>
        </Tooltip>
        
        {(status === 'error' || status === 'retry') && onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            disabled={isRetrying}
            className="h-6 w-6 p-0"
          >
            <RotateCcw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    </TooltipProvider>
  );
};