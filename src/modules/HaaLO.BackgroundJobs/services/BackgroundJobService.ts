import { supabase } from '../../../integrations/supabase/client';
import { EventBus } from '../../../modules/shared/services/EventBus';
import type { 
  BackgroundJob, 
  JobType, 
  JobPriority, 
  JobStatus,
  JobStats,
  JobQueue,
  JobLog
} from '../types';

export class BackgroundJobService {
  private static instance: BackgroundJobService;
  private static initialized = false;
  private static config: any = {};
  private eventBus = EventBus.getInstance();
  private jobHandlers: Map<JobType, (job: BackgroundJob) => Promise<any>> = new Map();
  private activeJobs: Map<string, BackgroundJob> = new Map();

  private constructor() {}

  static getInstance(): BackgroundJobService {
    if (!BackgroundJobService.instance) {
      BackgroundJobService.instance = new BackgroundJobService();
    }
    return BackgroundJobService.instance;
  }

  static async initialize(config?: any): Promise<void> {
    if (BackgroundJobService.initialized) return;
    
    console.log('⏰ Initializing Background Job Service', config);
    BackgroundJobService.config = config || {};
    BackgroundJobService.initialized = true;

    // Start job processor
    const instance = BackgroundJobService.getInstance();
    instance.startJobProcessor();
  }

  // Queue a new job
  async queueJob(
    type: JobType,
    name: string,
    payload: Record<string, any>,
    options: {
      priority?: JobPriority;
      delay?: number;
      retryAttempts?: number;
      sourceModule: string;
      companyId?: string;
      createdBy: string;
      description?: string;
    }
  ): Promise<string> {
    const job: BackgroundJob = {
      id: crypto.randomUUID(),
      type,
      name,
      description: options.description,
      status: 'queued',
      priority: options.priority || 'normal',
      payload,
      options: {
        delay: options.delay,
        retryAttempts: options.retryAttempts || 3,
      },
      createdAt: new Date(),
      createdBy: options.createdBy,
      sourceModule: options.sourceModule,
      companyId: options.companyId,
      retryCount: 0,
      logs: [],
    };

    // Store job in database
    await this.storeJob(job);

    // Add to processing queue if no delay
    if (!options.delay) {
      this.scheduleJobProcessing(job);
    }

    // Emit job queued event
    this.eventBus.emit('job_queued', {
      jobId: job.id,
      type: job.type,
      sourceModule: job.sourceModule,
    });

    return job.id;
  }

  // Register a job handler
  registerHandler(type: JobType, handler: (job: BackgroundJob) => Promise<any>): void {
    this.jobHandlers.set(type, handler);
    console.log(`📝 Registered handler for job type: ${type}`);
  }

  // Get job status
  async getJob(jobId: string): Promise<BackgroundJob | null> {
    // Check active jobs first
    if (this.activeJobs.has(jobId)) {
      return this.activeJobs.get(jobId)!;
    }

    // Load from database
    return this.loadJob(jobId);
  }

  // Get job statistics
  async getJobStats(companyId?: string): Promise<JobStats> {
    // Mock implementation
    return {
      totalJobs: 1250,
      queuedJobs: 15,
      processingJobs: 3,
      completedJobs: 1180,
      failedJobs: 52,
      averageProcessingTime: 45,
      throughputPerHour: 24,
      errorRate: 4.2,
      queueHealth: 'healthy',
    };
  }

  // Get queue information
  async getQueues(): Promise<JobQueue[]> {
    return [
      {
        name: 'payroll',
        description: 'Payroll processing jobs',
        priority: 'high',
        maxConcurrency: 3,
        isActive: true,
        jobCount: 5,
        processingCount: 1,
        completedCount: 145,
        failedCount: 2,
      },
      {
        name: 'reports',
        description: 'Report generation jobs',
        priority: 'normal',
        maxConcurrency: 5,
        isActive: true,
        jobCount: 8,
        processingCount: 2,
        completedCount: 89,
        failedCount: 3,
      },
      {
        name: 'maintenance',
        description: 'System maintenance jobs',
        priority: 'low',
        maxConcurrency: 1,
        isActive: true,
        jobCount: 2,
        processingCount: 0,
        completedCount: 12,
        failedCount: 0,
      },
    ];
  }

  // Query jobs with filters
  async queryJobs(filters: {
    status?: JobStatus;
    type?: JobType;
    companyId?: string;
    sourceModule?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ jobs: BackgroundJob[]; total: number }> {
    // Mock implementation
    const mockJobs: BackgroundJob[] = [
      {
        id: '1',
        type: 'payroll_calculation',
        name: 'October 2024 Payroll',
        status: 'completed',
        priority: 'high',
        payload: { payrollRunId: 'pr-123' },
        progress: { current: 100, total: 100, percentage: 100 },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 120000),
        createdBy: 'admin@company.com',
        sourceModule: 'HaaLO.PayrollEngine',
        companyId: 'company-1',
        retryCount: 0,
        logs: [],
      },
      {
        id: '2',
        type: 'report_generation',
        name: 'Monthly Benefits Report',
        status: 'processing',
        priority: 'normal',
        payload: { reportType: 'benefits', month: '2024-10' },
        progress: { current: 65, total: 100, percentage: 65, message: 'Processing employee data...' },
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
        startedAt: new Date(Date.now() - 8 * 60 * 1000),
        createdBy: 'manager@company.com',
        sourceModule: 'HaaLO.Reports',
        companyId: 'company-1',
        retryCount: 0,
        logs: [],
      },
      {
        id: '3',
        type: 'data_sync',
        name: 'Benefits Carrier Sync',
        status: 'failed',
        priority: 'normal',
        payload: { carrierId: 'carrier-abc' },
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        startedAt: new Date(Date.now() - 28 * 60 * 1000),
        createdBy: 'system',
        sourceModule: 'HaaLO.BenefitsSyncEngine',
        companyId: 'company-1',
        retryCount: 2,
        nextRetryAt: new Date(Date.now() + 5 * 60 * 1000),
        error: 'Connection timeout to benefits carrier API',
        logs: [],
      },
    ];

    // Apply filters
    let filteredJobs = mockJobs;
    
    if (filters.status) {
      filteredJobs = filteredJobs.filter(job => job.status === filters.status);
    }
    
    if (filters.type) {
      filteredJobs = filteredJobs.filter(job => job.type === filters.type);
    }
    
    if (filters.companyId) {
      filteredJobs = filteredJobs.filter(job => job.companyId === filters.companyId);
    }

    // Sort by creation date (newest first)
    filteredJobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Paginate
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    const paginatedJobs = filteredJobs.slice(offset, offset + limit);

    return {
      jobs: paginatedJobs,
      total: filteredJobs.length,
    };
  }

  // Cancel a job
  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.getJob(jobId);
    if (!job) return false;

    if (job.status === 'queued' || job.status === 'retry') {
      job.status = 'cancelled';
      await this.updateJob(job);
      
      this.eventBus.emit('job_cancelled', {
        jobId: job.id,
        type: job.type,
        sourceModule: job.sourceModule,
      });
      
      return true;
    }

    return false;
  }

  // Retry a failed job
  async retryJob(jobId: string): Promise<boolean> {
    const job = await this.getJob(jobId);
    if (!job || job.status !== 'failed') return false;

    job.status = 'queued';
    job.retryCount += 1;
    job.error = undefined;
    job.nextRetryAt = undefined;
    
    await this.updateJob(job);
    this.scheduleJobProcessing(job);
    
    return true;
  }

  // Private methods

  private startJobProcessor(): void {
    // Start processing queued jobs
    setInterval(() => {
      this.processQueuedJobs();
    }, 5000); // Check every 5 seconds

    // Cleanup completed jobs
    setInterval(() => {
      this.cleanupOldJobs();
    }, BackgroundJobService.config.cleanupIntervalHours * 60 * 60 * 1000);
  }

  private async processQueuedJobs(): Promise<void> {
    const maxConcurrent = BackgroundJobService.config.maxConcurrentJobs || 10;
    
    if (this.activeJobs.size >= maxConcurrent) {
      return; // At capacity
    }

    // Get queued jobs (mock implementation)
    const queuedJobs = await this.getQueuedJobs(maxConcurrent - this.activeJobs.size);
    
    for (const job of queuedJobs) {
      this.processJob(job);
    }
  }

  private async processJob(job: BackgroundJob): Promise<void> {
    this.activeJobs.set(job.id, job);
    
    job.status = 'processing';
    job.startedAt = new Date();
    await this.updateJob(job);

    this.eventBus.emit('job_started', {
      jobId: job.id,
      type: job.type,
      sourceModule: job.sourceModule,
    });

    try {
      const handler = this.jobHandlers.get(job.type);
      if (!handler) {
        throw new Error(`No handler registered for job type: ${job.type}`);
      }

      const result = await handler(job);
      
      job.status = 'completed';
      job.completedAt = new Date();
      job.result = result;
      
      this.eventBus.emit('job_completed', {
        jobId: job.id,
        type: job.type,
        sourceModule: job.sourceModule,
        result,
      });
      
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : String(error);
      
      // Schedule retry if attempts remaining
      const maxRetries = job.options?.retryAttempts || 3;
      if (job.retryCount < maxRetries) {
        job.status = 'retry';
        job.nextRetryAt = new Date(Date.now() + Math.pow(2, job.retryCount) * 60000); // Exponential backoff
      }
      
      this.eventBus.emit('job_failed', {
        jobId: job.id,
        type: job.type,
        sourceModule: job.sourceModule,
        error: job.error,
      });
    } finally {
      await this.updateJob(job);
      this.activeJobs.delete(job.id);
    }
  }

  private scheduleJobProcessing(job: BackgroundJob): void {
    // Add to processing queue (simplified implementation)
    setTimeout(() => {
      if (job.status === 'queued') {
        this.processJob(job);
      }
    }, job.options?.delay || 0);
  }

  private async storeJob(job: BackgroundJob): Promise<void> {
    // Mock implementation - would store in background_jobs table
    console.log('💾 Storing background job:', job.id);
  }

  private async updateJob(job: BackgroundJob): Promise<void> {
    // Mock implementation - would update in background_jobs table
    console.log('🔄 Updating background job:', job.id, job.status);
  }

  private async loadJob(jobId: string): Promise<BackgroundJob | null> {
    // Mock implementation - would load from background_jobs table
    return null;
  }

  private async getQueuedJobs(limit: number): Promise<BackgroundJob[]> {
    // Mock implementation - would query queued jobs from database
    return [];
  }

  private async cleanupOldJobs(): Promise<void> {
    // Mock implementation - would clean up old completed/failed jobs
    console.log('🧹 Cleaning up old background jobs');
  }
}