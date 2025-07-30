/**
 * EaseLearn.MyCertificates Module
 * Personal certificate portfolio for learners
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { myCertificatesRoutes } from './routes';
import { MyCertificatesConfig } from './components/MyCertificatesConfig';

const EaseLearnMyCertificatesModule: HaaLOModule = {
  metadata: {
    id: 'easelearn-mycertificates',
    name: 'My Certificates',
    description: 'Personal certificate portfolio and downloads for learners',
    version: '1.0.0',
    icon: 'Award',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: myCertificatesRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['learning:read', 'learner:self'],
    requiredRoles: ['employee', 'learner', 'user'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing EaseLearn.MyCertificates module:', config);
  },
  async destroy() {
    console.log('Destroying EaseLearn.MyCertificates module');
  },
  getComponent() {
    return MyCertificatesConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(EaseLearnMyCertificatesModule);

export default EaseLearnMyCertificatesModule;