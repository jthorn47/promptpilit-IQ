/**
 * EaseLearn.Media Module
 * Media management and Vimeo integration for EaseLearn LMS
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { mediaRoutes } from './routes';
import { MediaConfig } from './components/MediaConfig';

const EaseLearnMediaModule: HaaLOModule = {
  metadata: {
    id: 'easelearn-media',
    name: 'Media Management',
    description: 'Video library, Vimeo integration, and media content management',
    version: '1.0.0',
    icon: 'Video',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: mediaRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['learning:write', 'media:manage'],
    requiredRoles: ['company_admin', 'super_admin', 'training_manager'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing EaseLearn.Media module:', config);
  },
  async destroy() {
    console.log('Destroying EaseLearn.Media module');
  },
  getComponent() {
    return MediaConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(EaseLearnMediaModule);

export default EaseLearnMediaModule;