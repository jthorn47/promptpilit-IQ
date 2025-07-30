/**
 * EaseLearn.Admin Module
 * Command center and system administration for EaseLearn LMS
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { adminRoutes } from './routes';
import { AdminConfig } from './components/AdminConfig';

const EaseLearnAdminModule: HaaLOModule = {
  metadata: {
    id: 'easelearn-admin',
    name: 'Command Center',
    description: 'System administration and global configuration for EaseLearn LMS',
    version: '1.0.0',
    icon: 'Settings',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: adminRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['learning:manage', 'admin:full'],
    requiredRoles: ['super_admin', 'system_admin'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing EaseLearn.Admin module:', config);
  },
  async destroy() {
    console.log('Destroying EaseLearn.Admin module');
  },
  getComponent() {
    return AdminConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(EaseLearnAdminModule);

export default EaseLearnAdminModule;