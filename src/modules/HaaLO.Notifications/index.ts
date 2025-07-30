import { moduleRegistry } from '../core/ModuleLoader';
import { NotificationService } from './services/NotificationService';
import { NotificationDashboard } from './components/NotificationDashboard';
import { NotificationProvider } from './providers/NotificationProvider';

// Register the HaaLO.Notifications module
moduleRegistry.register({
  metadata: {
    id: 'haalo-notifications',
    name: 'HaaLO.Notifications',
    description: 'Global notification service supporting in-app, email, and SMS notifications',
    version: '1.0.0',
    icon: 'Bell',
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
      path: '/admin/notifications',
      component: NotificationDashboard,
      protected: true,
    },
  ],
  menu: [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'Bell',
      path: '/admin/notifications',
      requiredRoles: ['super_admin', 'admin'],
    },
  ],
  services: {
    notificationService: NotificationService,
  },
  configuration: {
    tenantScoped: true,
    enableEmail: true,
    enableSMS: false,
    enableInApp: true,
    retryAttempts: 3,
    queueBatchSize: 100,
  },
  initialize: async (config) => {
    console.log('🔔 Initializing HaaLO.Notifications module');
    await NotificationService.initialize(config);
  },
  getComponent: () => NotificationProvider,
});

export * from './types';
export * from './services/NotificationService';
export * from './components/NotificationDashboard';
export * from './providers/NotificationProvider';