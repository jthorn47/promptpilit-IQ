/**
 * HaaLO.Compliance Module
 * Automated compliance monitoring and reporting tools
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { complianceRoutes } from './routes';
import { ComplianceConfig } from './components/ComplianceConfig';

const HaaLOComplianceModule: HaaLOModule = {
  metadata: {
    id: 'compliance',
    name: 'Compliance',
    description: 'Automated compliance monitoring and reporting tools.',
    version: '1.0.0',
    icon: 'Shield',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: complianceRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['compliance:read', 'compliance:write', 'compliance:audit'],
    requiredRoles: ['company_admin', 'super_admin', 'compliance_officer'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing HaaLO.Compliance module:', config);
  },
  async destroy() {
    console.log('Destroying HaaLO.Compliance module');
  },
  getComponent() {
    return ComplianceConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(HaaLOComplianceModule);

export default HaaLOComplianceModule;