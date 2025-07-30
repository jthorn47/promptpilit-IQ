/**
 * HaaLO.LeaveManagement Module
 * Streamlined PTO requests, approvals, and accrual tracking
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { leaveManagementRoutes } from './routes';
import { LeaveManagementConfig } from './components/LeaveManagementConfig';

const HaaLOLeaveManagementModule: HaaLOModule = {
  metadata: {
    id: 'leave-management',
    name: 'Leave Management',
    description: 'Streamlined PTO requests, approvals, and accrual tracking.',
    version: '1.0.0',
    icon: 'Calendar',
    category: 'hr',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: leaveManagementRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['leave:read', 'leave:write', 'leave:approve'],
    requiredRoles: ['company_admin', 'super_admin', 'hr_manager'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing HaaLO.LeaveManagement module:', config);
  },
  async destroy() {
    console.log('Destroying HaaLO.LeaveManagement module');
  },
  getComponent() {
    return LeaveManagementConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(HaaLOLeaveManagementModule);

export default HaaLOLeaveManagementModule;