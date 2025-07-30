import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  RefreshCw,
  Play,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Calendar,
  Activity,
  TrendingUp,
  Database
} from 'lucide-react';
import { format } from 'date-fns';

interface IntegrationJob {
  id: string;
  integration_id: string;
  job_type: string;
  status: string;
  started_at: string;
  completed_at: string;
  error_message: string;
  retry_count: number;
  max_retries: number;
  records_processed: number;
  records_failed: number;
  created_at: string;
  integration: {
    name: string;
    provider: {
      display_name: string;
    };
  };
}

interface JobLogsProps {
  integrationId?: string;
}

export function JobLogs({ integrationId }: JobLogsProps) {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<IntegrationJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadJobs();
  }, [integrationId]);

  const loadJobs = async () => {
    try {
      let query = supabase
        .from('integration_jobs')
        .select(`
          *,
          integration:integrations!inner(
            name,
            provider:integration_providers(display_name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load job logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const retryJob = async (jobId: string) => {
    try {
      // Create a new job based on the failed one
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      const { error } = await supabase
        .from('integration_jobs')
        .insert([{
          integration_id: job.integration_id,
          job_type: job.job_type,
          status: 'pending',
          retry_count: 0,
          max_retries: 3
        }]);

      if (error) throw error;

      await loadJobs();
      toast({
        title: "Success",
        description: "Job retry initiated successfully",
      });
    } catch (error) {
      console.error('Error retrying job:', error);
      toast({
        title: "Error",
        description: "Failed to retry job",
        variant: "destructive",
      });
    }
  };

  const startSyncNow = async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('integration_jobs')
        .insert([{
          integration_id: integrationId,
          job_type: 'sync',
          status: 'pending',
          retry_count: 0,
          max_retries: 3
        }]);

      if (error) throw error;

      await loadJobs();
      toast({
        title: "Success",
        description: "Sync job started successfully",
      });
    } catch (error) {
      console.error('Error starting sync:', error);
      toast({
        title: "Error",
        description: "Failed to start sync job",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'running': return <Activity className="h-4 w-4 text-warning animate-pulse" />;
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'failed': return 'bg-destructive text-destructive-foreground';
      case 'running': return 'bg-warning text-warning-foreground';
      case 'pending': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sync': return <RefreshCw className="h-4 w-4" />;
      case 'import': return <Database className="h-4 w-4" />;
      case 'export': return <TrendingUp className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesType = typeFilter === 'all' || job.job_type === typeFilter;
    const matchesSearch = searchQuery === '' || 
      job.integration?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.integration?.provider?.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.error_message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  // Calculate summary stats
  const stats = {
    total: jobs.length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
    running: jobs.filter(j => j.status === 'running').length,
    pending: jobs.filter(j => j.status === 'pending').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Job Logs</h3>
          <p className="text-sm text-muted-foreground">
            Monitor sync attempts and job history
          </p>
        </div>
        <div className="flex gap-2">
          {integrationId && (
            <Button onClick={() => startSyncNow(integrationId)}>
              <Play className="h-4 w-4 mr-2" />
              Start Sync Now
            </Button>
          )}
          <Button variant="outline" onClick={loadJobs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Jobs</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">{stats.running}</p>
                <p className="text-xs text-muted-foreground">Running</p>
              </div>
              <Activity className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-muted-foreground">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative w-64">
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sync">Sync</SelectItem>
            <SelectItem value="import">Import</SelectItem>
            <SelectItem value="export">Export</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-muted-foreground text-center">
                <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No job logs found</p>
                <p className="text-sm">Jobs will appear here when integrations run</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(job.status)}
                      {getTypeIcon(job.job_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium truncate">
                          {job.integration?.name} - {job.job_type}
                        </p>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                        {job.retry_count > 0 && (
                          <Badge variant="outline">
                            Retry {job.retry_count}/{job.max_retries}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(job.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                        {job.records_processed > 0 && (
                          <span>
                            Processed: {job.records_processed}
                          </span>
                        )}
                        {job.records_failed > 0 && (
                          <span className="text-destructive">
                            Failed: {job.records_failed}
                          </span>
                        )}
                        {job.started_at && job.completed_at && (
                          <span>
                            Duration: {Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)}s
                          </span>
                        )}
                      </div>
                      {job.error_message && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                          {job.error_message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {job.status === 'failed' && job.retry_count < job.max_retries && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryJob(job.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}