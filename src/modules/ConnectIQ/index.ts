/**
 * ConnectIQ Module
 * Customer Relationship Management System
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { connectIQRoutes } from './routes';

const ConnectIQModule: HaaLOModule = {
  metadata: {
    id: 'connect-iq',
    name: 'ConnectIQ',
    description: 'Customer Relationship Management',
    version: '1.0.0',
    icon: 'Users',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: connectIQRoutes,
  configuration: {
    permissions: ['crm:read', 'crm:write', 'analytics:read'],
    requiredRoles: ['company_admin', 'super_admin'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing ConnectIQ module:', config);
  },
  async destroy() {
    console.log('Destroying ConnectIQ module');
  }
};

export default ConnectIQModule;