/**
 * EaseLearn.LearningPaths Module
 * Learning path creation and management for EaseLearn LMS
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { learningPathsRoutes } from './routes';
import { LearningPathsConfig } from './components/LearningPathsConfig';

const EaseLearnLearningPathsModule: HaaLOModule = {
  metadata: {
    id: 'easelearn-learningpaths',
    name: 'Learning Paths',
    description: 'Learning path creation, sequencing, and prerequisite management',
    version: '1.0.0',
    icon: 'Route',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: learningPathsRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['learning:write', 'paths:manage'],
    requiredRoles: ['company_admin', 'super_admin', 'training_manager'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing EaseLearn.LearningPaths module:', config);
  },
  async destroy() {
    console.log('Destroying EaseLearn.LearningPaths module');
  },
  getComponent() {
    return LearningPathsConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(EaseLearnLearningPathsModule);

export default EaseLearnLearningPathsModule;