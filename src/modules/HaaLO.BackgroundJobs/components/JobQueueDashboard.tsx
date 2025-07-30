import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Clock, Play, Pause, RotateCcw, X } from 'lucide-react';
import { BackgroundJobService } from '../services/BackgroundJobService';
import type { BackgroundJob, JobStats } from '../types';

export const JobQueueDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const jobService = BackgroundJobService.getInstance();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [jobsResult, statsResult] = await Promise.all([
        jobService.queryJobs({ limit: 50 }),
        jobService.getJobStats(),
      ]);
      
      setJobs(jobsResult.jobs);
      setStats(statsResult);
    } catch (error) {
      console.error('Failed to load job data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      case 'queued': return 'outline';
      default: return 'outline';
    }
  };

  const formatDuration = (startedAt?: Date, completedAt?: Date) => {
    if (!startedAt) return 'N/A';
    const endTime = completedAt || new Date();
    const duration = endTime.getTime() - startedAt.getTime();
    return `${Math.round(duration / 1000)}s`;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            Background Jobs
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage background job queues
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Queue Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{stats.queueHealth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processingJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedJobs}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>Latest background job activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <Badge variant={getStatusBadgeVariant(job.status)}>
                    {job.status}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">{job.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.sourceModule} • {job.type}
                    </p>
                    {job.progress && (
                      <div className="mt-1">
                        <div className="text-xs text-muted-foreground mb-1">
                          {job.progress.message || `${job.progress.current}/${job.progress.total}`}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${job.progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDuration(job.startedAt, job.completedAt)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};