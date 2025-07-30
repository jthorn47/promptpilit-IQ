/**
 * EaseLearn.Courses Module
 * Course management and content creation for EaseLearn LMS
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { coursesRoutes } from './routes';
import { CoursesConfig } from './components/CoursesConfig';

const EaseLearnCoursesModule: HaaLOModule = {
  metadata: {
    id: 'easelearn-courses',
    name: 'Course Management',
    description: 'Course creation, management and SCORM content for EaseLearn LMS',
    version: '1.0.0',
    icon: 'BookOpen',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: coursesRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['learning:write', 'courses:manage'],
    requiredRoles: ['company_admin', 'super_admin', 'training_manager'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing EaseLearn.Courses module:', config);
  },
  async destroy() {
    console.log('Destroying EaseLearn.Courses module');
  },
  getComponent() {
    return CoursesConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(EaseLearnCoursesModule);

export default EaseLearnCoursesModule;