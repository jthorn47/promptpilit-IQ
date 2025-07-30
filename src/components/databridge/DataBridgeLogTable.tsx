import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
  ArrowRight,
  Database
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  getDataBridgeLogs,
  retrySync,
  LogFilters,
  DataBridgeLog,
  PaginatedLogs
} from '@/services/databridge/logService';
import { DataBridgeLogDetailModal } from './DataBridgeLogDetailModal';
import { useToast } from '@/hooks/use-toast';

interface DataBridgeLogTableProps {
  filters: LogFilters;
  refreshTrigger?: number;
  onRefresh?: () => void;
}

export const DataBridgeLogTable: React.FC<DataBridgeLogTableProps> = ({
  filters,
  refreshTrigger,
  onRefresh
}) => {
  const [logs, setLogs] = useState<PaginatedLogs>({
    data: [],
    total: 0,
    page: 1,
    per_page: 50,
    total_pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<DataBridgeLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchLogs = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDataBridgeLogs(page, 50, filters);
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters, refreshTrigger]);

  const handlePageChange = (page: number) => {
    fetchLogs(page);
  };

  const handleViewDetails = (log: DataBridgeLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleRetry = async (log: DataBridgeLog) => {
    if (log.status !== 'error') return;
    
    setRetryingIds(prev => new Set(prev).add(log.id));
    try {
      await retrySync(log.id);
      toast({
        title: "Sync Retried",
        description: `Retry initiated for ${log.module_name}`,
      });
      fetchLogs(logs.page); // Refresh current page
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Retry Failed",
        description: `Failed to retry sync for ${log.module_name}`,
        variant: "destructive",
      });
    } finally {
      setRetryingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(log.id);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'stale':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'stale':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderPagination = () => {
    if (logs.total_pages <= 1) return null;

    const pages = [];
    const currentPage = logs.page;
    const totalPages = logs.total_pages;

    // Show first page
    if (currentPage > 3) {
      pages.push(1);
      if (currentPage > 4) {
        pages.push('...');
      }
    }

    // Show pages around current
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pages.push(i);
    }

    // Show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === '...' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => handlePageChange(page as number)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => fetchLogs(1)} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            DataBridge Sync Logs
            <Badge variant="outline" className="ml-auto">
              {logs.total} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Flow</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>Error Summary</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.data.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">
                                {format(new Date(log.last_synced_at), 'MMM dd, HH:mm')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(log.last_synced_at), { addSuffix: true })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(log.status)}>
                              {getStatusIcon(log.status)}
                              <span className="ml-1">{log.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{log.module_name}</span>
                          </TableCell>
                          <TableCell>
                            {log.origin_module && log.target_module ? (
                              <div className="flex items-center gap-1 text-sm">
                                <span className="text-muted-foreground">{log.origin_module}</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{log.target_module}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{log.records_processed}</span>
                          </TableCell>
                          <TableCell>
                            {log.retry_count > 0 ? (
                              <Badge variant="outline" className="text-warning">
                                {log.retry_count}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {log.error_message ? (
                              <span className="text-sm text-destructive">
                                {truncateText(log.error_message)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(log)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {log.status === 'error' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRetry(log)}
                                  disabled={retryingIds.has(log.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <RefreshCw className={`h-3 w-3 ${retryingIds.has(log.id) ? 'animate-spin' : ''}`} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {logs.total_pages > 1 && (
                <div className="flex justify-center mt-6">
                  {renderPagination()}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <DataBridgeLogDetailModal
        log={selectedLog}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedLog(null);
        }}
        onRetrySuccess={() => {
          fetchLogs(logs.page);
          onRefresh?.();
        }}
      />
    </>
  );
};