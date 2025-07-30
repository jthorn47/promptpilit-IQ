/**
 * PayrollIQ Module
 * Comprehensive payroll management system
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { payrollIQRoutes } from './routes';

const PayrollIQModule: HaaLOModule = {
  metadata: {
    id: 'payroll-iq',
    name: 'PayrollIQ',
    description: 'Comprehensive payroll management system',
    version: '1.0.0',
    icon: 'FileSpreadsheet',
    category: 'finance',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: payrollIQRoutes,
  configuration: {
    permissions: ['payroll:read', 'payroll:write', 'payroll:process'],
    requiredRoles: ['company_admin', 'super_admin'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing PayrollIQ module:', config);
  },
  async destroy() {
    console.log('Destroying PayrollIQ module');
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(PayrollIQModule);

export default PayrollIQModule;