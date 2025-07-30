import { moduleRegistry } from '../core/ModuleLoader';
import { BackgroundJobService } from './services/BackgroundJobService';
import { JobQueueDashboard } from './components/JobQueueDashboard';

// Register the HaaLO.BackgroundJobs module
moduleRegistry.register({
  metadata: {
    id: 'haalo-backgroundjobs',
    name: 'HaaLO.BackgroundJobs',
    description: 'Background job queue service for handling long-running tasks across all HaaLO modules',
    version: '1.0.0',
    icon: 'Clock',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green',
  },
  routes: [
    {
      path: '/admin/background-jobs',
      component: JobQueueDashboard,
      protected: true,
    },
  ],
  menu: [
    {
      id: 'background-jobs',
      label: 'Background Jobs',
      icon: 'Clock',
      path: '/admin/background-jobs',
      requiredRoles: ['super_admin'],
    },
  ],
  services: {
    backgroundJobService: BackgroundJobService,
  },
  configuration: {
    tenantScoped: true,
    maxConcurrentJobs: 10,
    retryAttempts: 3,
    jobTimeout: 300000, // 5 minutes
    cleanupIntervalHours: 24,
  },
  initialize: async (config) => {
    console.log('⏰ Initializing HaaLO.BackgroundJobs module');
    await BackgroundJobService.initialize(config);
  },
});

export * from './types';
export * from './services/BackgroundJobService';