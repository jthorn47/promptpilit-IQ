/**
 * EaseLearn.MyLearning Module
 * Learner dashboard and personal learning experience
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { myLearningRoutes } from './routes';
import { MyLearningConfig } from './components/MyLearningConfig';

const EaseLearnMyLearningModule: HaaLOModule = {
  metadata: {
    id: 'easelearn-mylearning',
    name: 'My Learning',
    description: 'Personal learning dashboard and course access for learners',
    version: '1.0.0',
    icon: 'GraduationCap',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: myLearningRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['learning:read', 'learner:self'],
    requiredRoles: ['employee', 'learner', 'user'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing EaseLearn.MyLearning module:', config);
  },
  async destroy() {
    console.log('Destroying EaseLearn.MyLearning module');
  },
  getComponent() {
    return MyLearningConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(EaseLearnMyLearningModule);

export default EaseLearnMyLearningModule;