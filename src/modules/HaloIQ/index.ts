/**
 * HALO IQ Module
 * Learning and development platform
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { haloIQRoutes } from './routes';

const HaloIQModule: HaaLOModule = {
  metadata: {
    id: 'halo-iq',
    name: 'HALO IQ',
    description: 'Core intelligence suite powering data and compliance',
    version: '1.0.0',
    icon: 'Brain',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: haloIQRoutes,
  configuration: {
    permissions: ['learning:read', 'learning:write', 'training:manage'],
    requiredRoles: ['company_admin', 'super_admin', 'client_admin'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing HALO IQ module:', config);
  },
  async destroy() {
    console.log('Destroying HALO IQ module');
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(HaloIQModule);

export default HaloIQModule;