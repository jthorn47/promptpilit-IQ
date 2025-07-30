/**
 * EaseLearn.Renewals Module
 * Certification renewal management and scheduling
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { renewalsRoutes } from './routes';
import { RenewalsConfig } from './components/RenewalsConfig';

const EaseLearnRenewalsModule: HaaLOModule = {
  metadata: {
    id: 'easelearn-renewals',
    name: 'Renewals Management',
    description: 'Certification renewal scheduling, notifications, and tracking',
    version: '1.0.0',
    icon: 'RotateCcw',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: renewalsRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['learning:write', 'renewals:manage'],
    requiredRoles: ['company_admin', 'super_admin', 'training_manager'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing EaseLearn.Renewals module:', config);
  },
  async destroy() {
    console.log('Destroying EaseLearn.Renewals module');
  },
  getComponent() {
    return RenewalsConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(EaseLearnRenewalsModule);

export default EaseLearnRenewalsModule;