import { moduleRegistry } from '../core/ModuleLoader';
import { AuditLogService } from './services/AuditLogService';
import { AuditLogDashboard } from './components/AuditLogDashboard';

// Register the HaaLO.AuditLog module
moduleRegistry.register({
  metadata: {
    id: 'haalo-auditlog',
    name: 'HaaLO.AuditLog',
    description: 'System-wide audit logging service for tracking all user actions and system events',
    version: '1.0.0',
    icon: 'FileText',
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
      path: '/admin/audit-logs',
      component: AuditLogDashboard,
      protected: true,
    },
  ],
  menu: [
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: 'FileText',
      path: '/admin/audit-logs',
      requiredRoles: ['super_admin', 'admin'],
    },
  ],
  services: {
    auditLogService: AuditLogService,
  },
  configuration: {
    tenantScoped: true,
    retentionDays: 365,
    enableRealTimeLogging: true,
    logSensitiveData: false,
  },
  initialize: async (config) => {
    console.log('📝 Initializing HaaLO.AuditLog module');
    await AuditLogService.initialize(config);
  },
});

export * from './types';
export * from './services/AuditLogService';