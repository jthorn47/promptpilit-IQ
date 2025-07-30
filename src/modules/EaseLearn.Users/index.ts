/**
 * EaseLearn.Users Module
 * Learner management and enrollment for EaseLearn LMS
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { usersRoutes } from './routes';
import { UsersConfig } from './components/UsersConfig';

const EaseLearnUsersModule: HaaLOModule = {
  metadata: {
    id: 'easelearn-users',
    name: 'Learner Management',
    description: 'Learner enrollment, progress tracking, and user management',
    version: '1.0.0',
    icon: 'Users',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: usersRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['learning:write', 'users:manage'],
    requiredRoles: ['company_admin', 'super_admin', 'training_manager'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing EaseLearn.Users module:', config);
  },
  async destroy() {
    console.log('Destroying EaseLearn.Users module');
  },
  getComponent() {
    return UsersConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(EaseLearnUsersModule);

export default EaseLearnUsersModule;