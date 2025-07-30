/**
 * EaseLearn.KB Module
 * Knowledge Base management for EaseLearn LMS
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { kbRoutes } from './routes';
import { KBConfig } from './components/KBConfig';

const EaseLearnKBModule: HaaLOModule = {
  metadata: {
    id: 'easelearn-kb',
    name: 'Knowledge Base',
    description: 'Knowledge base creation, article management, and content organization',
    version: '1.0.0',
    icon: 'BookOpenCheck',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: kbRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['learning:write', 'kb:manage'],
    requiredRoles: ['company_admin', 'super_admin', 'training_manager'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing EaseLearn.KB module:', config);
  },
  async destroy() {
    console.log('Destroying EaseLearn.KB module');
  },
  getComponent() {
    return KBConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(EaseLearnKBModule);

export default EaseLearnKBModule;