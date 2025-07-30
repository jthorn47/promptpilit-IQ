import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  ExternalLink,
  Zap 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { triggerManualSync, SyncHealthMetrics } from '@/services/databridge/getSyncStatus';
import { useToast } from '@/hooks/use-toast';

interface SyncStatusCardProps {
  sync: SyncHealthMetrics;
  onRefresh?: () => void;
}

export const SyncStatusCard: React.FC<SyncStatusCardProps> = ({ sync, onRefresh }) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const { toast } = useToast();

  const getStatusIcon = () => {
    switch (sync.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'stale':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusColor = () => {
    switch (sync.status) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'stale':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const getStatusText = () => {
    switch (sync.status) {
      case 'success':
        return 'Healthy';
      case 'stale':
        return 'Stale';
      case 'error':
        return 'Error';
    }
  };

  const handleManualSync = async () => {
    setIsTriggering(true);
    try {
      await triggerManualSync(sync.module_name);
      toast({
        title: "Sync Triggered",
        description: `Manual sync initiated for ${sync.module_name}`,
      });
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: `Failed to trigger sync for ${sync.module_name}`,
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">{sync.module_name}</CardTitle>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Badge */}
        <Badge variant="outline" className={getStatusColor()}>
          {getStatusText()}
        </Badge>

        {/* Last Sync Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {formatDistanceToNow(new Date(sync.last_synced_at), { addSuffix: true })}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="font-semibold text-foreground">
              {sync.records_processed}
            </div>
            <div className="text-muted-foreground">Records</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="font-semibold text-foreground">
              {formatDuration(sync.sync_duration_ms)}
            </div>
            <div className="text-muted-foreground">Duration</div>
          </div>
        </div>

        {/* Error Count */}
        {sync.error_count_24h > 0 && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <XCircle className="h-4 w-4" />
            <span>{sync.error_count_24h} errors (24h)</span>
          </div>
        )}

        {/* Error Message */}
        {sync.latest_error && sync.status === 'error' && (
          <div className="text-xs text-destructive bg-destructive/5 p-2 rounded border border-destructive/20">
            {sync.latest_error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSync}
            disabled={isTriggering}
            className="flex-1 h-8"
          >
            {isTriggering ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Zap className="h-3 w-3" />
            )}
            <span className="ml-1 text-xs">Sync</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            title="View detailed logs"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};