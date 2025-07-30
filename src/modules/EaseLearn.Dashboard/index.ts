/**
 * EaseLearn.Dashboard Module
 * Main dashboard and overview for EaseLearn LMS
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { dashboardRoutes } from './routes';
import { DashboardConfig } from './components/DashboardConfig';

const EaseLearnDashboardModule: HaaLOModule = {
  metadata: {
    id: 'easelearn-dashboard',
    name: 'EaseLearn Dashboard',
    description: 'Main dashboard and overview for EaseLearn LMS system',
    version: '1.0.0',
    icon: 'LayoutDashboard',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: dashboardRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['learning:read', 'dashboard:view'],
    requiredRoles: ['company_admin', 'super_admin', 'training_manager'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing EaseLearn.Dashboard module:', config);
  },
  async destroy() {
    console.log('Destroying EaseLearn.Dashboard module');
  },
  getComponent() {
    return DashboardConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(EaseLearnDashboardModule);

export default EaseLearnDashboardModule;