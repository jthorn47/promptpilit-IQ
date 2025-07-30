import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  ArrowRight,
  Copy,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { DataBridgeLog, retrySync } from '@/services/databridge/logService';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface DataBridgeLogDetailModalProps {
  log: DataBridgeLog | null;
  isOpen: boolean;
  onClose: () => void;
  onRetrySuccess?: () => void;
}

export const DataBridgeLogDetailModal: React.FC<DataBridgeLogDetailModalProps> = ({
  log,
  isOpen,
  onClose,
  onRetrySuccess
}) => {
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);

  if (!log) return null;

  const getStatusIcon = () => {
    switch (log.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'stale':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusColor = () => {
    switch (log.status) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'stale':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(log.id);
      toast({
        title: "Copied",
        description: "Log ID copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy log ID",
        variant: "destructive",
      });
    }
  };

  const handleRetry = async () => {
    if (log.status !== 'error') return;
    
    setIsRetrying(true);
    try {
      await retrySync(log.id);
      toast({
        title: "Sync Retried",
        description: `Retry initiated for ${log.module_name}`,
      });
      onRetrySuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "Retry Failed",
        description: `Failed to retry sync for ${log.module_name}`,
        variant: "destructive",
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Sync Log Details - {log.module_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status & Timing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className={getStatusColor()}>
                  {log.status.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDistanceToNow(new Date(log.last_synced_at), { addSuffix: true })}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium">Sync Duration</div>
                  <div className="text-lg">{formatDuration(log.sync_duration_ms)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Records Processed</div>
                  <div className="text-lg">{log.records_processed}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Retry Count</div>
                  <div className="text-lg">{log.retry_count}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Last Synced</div>
                  <div className="text-sm">
                    {format(new Date(log.last_synced_at), 'PPpp')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Flow */}
          {log.origin_module && log.target_module && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Module Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 justify-center">
                  <div className="text-center">
                    <div className="text-sm font-medium text-muted-foreground">Origin</div>
                    <div className="text-lg font-semibold">{log.origin_module}</div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  <div className="text-center">
                    <div className="text-sm font-medium text-muted-foreground">Target</div>
                    <div className="text-lg font-semibold">{log.target_module}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Details */}
          {log.error_message && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Error Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <pre className="text-sm text-destructive whitespace-pre-wrap break-words">
                    {log.error_message}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Log ID</div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {log.id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyId}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Created</div>
                  <div className="text-sm">
                    {format(new Date(log.created_at), 'PPpp')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex gap-2">
              {log.status === 'error' && (
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="gap-2"
                >
                  {isRetrying ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Retry Sync
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};