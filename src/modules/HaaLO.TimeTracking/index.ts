/**
 * HaaLO.TimeTracking Module
 * Advanced time tracking with GPS verification and project-based billing
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { timeTrackingRoutes } from './routes';
import { TimeTrackingService } from './services/TimeTrackingService';
import { useTimeTrackingState } from './state/useTimeTrackingState';
import { TimeTrackingConfig } from './components/TimeTrackingConfig';

const HaaLOTimeTrackingModule: HaaLOModule = {
  metadata: {
    id: 'time-tracking',
    name: 'Time Tracking',
    description: 'Advanced time tracking with GPS verification and project-based billing.',
    version: '1.0.0',
    icon: 'Clock',
    category: 'hr',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: timeTrackingRoutes,
  services: {
    timeTrackingService: TimeTrackingService
  },
  state: {
    useTimeTrackingState
  },
  configuration: {
    permissions: ['time:read', 'time:write', 'time:approve'],
    requiredRoles: ['company_admin', 'super_admin', 'hr_manager'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing HaaLO.TimeTracking module:', config);
  },
  async destroy() {
    console.log('Destroying HaaLO.TimeTracking module');
  },
  getComponent() {
    return TimeTrackingConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(HaaLOTimeTrackingModule);

export default HaaLOTimeTrackingModule;