/**
 * EaseLearn.Certificates Module
 * Certificate management and generation (Admin view)
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { certificatesRoutes } from './routes';
import { CertificatesConfig } from './components/CertificatesConfig';

const EaseLearnCertificatesModule: HaaLOModule = {
  metadata: {
    id: 'easelearn-certificates',
    name: 'Certificate Management',
    description: 'Certificate generation and administration for EaseLearn LMS',
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
  routes: certificatesRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['learning:write', 'certificates:manage'],
    requiredRoles: ['company_admin', 'super_admin', 'training_manager'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing EaseLearn.Certificates module:', config);
  },
  async destroy() {
    console.log('Destroying EaseLearn.Certificates module');
  },
  getComponent() {
    return CertificatesConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(EaseLearnCertificatesModule);

export default EaseLearnCertificatesModule;