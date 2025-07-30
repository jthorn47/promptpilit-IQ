/**
 * Microservices Module Registry
 * 
 * Registers all microservices and micro-frontends in the system
 */

import { moduleRegistry } from '@/modules/core/ModuleLoader';

// Landing Site Microservice
import { LandingSiteModule, LandingSiteModuleMetadata } from '@/microservices/landing-site/LandingSiteModule';

// Auth UI Micro-Frontend  
import { AuthUIModule, AuthUIModuleMetadata } from '@/microservices/auth-ui/AuthUIModule';

// Auth Service Central Microservice
import { AuthServiceModule, AuthServiceModuleMetadata } from '@/microservices/auth-service/AuthServiceModule';

// Convert microservice metadata to HaaLO module format and register
const LandingSiteHaaLOModule = {
  metadata: {
    id: LandingSiteModuleMetadata.id,
    name: LandingSiteModuleMetadata.name,
    version: LandingSiteModuleMetadata.version,
    description: LandingSiteModuleMetadata.description,
    category: 'core' as const,
    icon: 'Globe',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active' as const,
    statusColor: '#10b981'
  },
  routes: [{ path: '/', component: LandingSiteModule }],
  menu: [],
  initialize: async () => console.log('🚀 LandingSite initialized'),
  destroy: async () => console.log('🔥 LandingSite destroyed')
};

const AuthUIHaaLOModule = {
  metadata: {
    id: AuthUIModuleMetadata.id,
    name: AuthUIModuleMetadata.name,
    version: AuthUIModuleMetadata.version,
    description: AuthUIModuleMetadata.description,
    category: 'core' as const,
    icon: 'Lock',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active' as const,
    statusColor: '#10b981'
  },
  routes: [
    { path: '/auth', component: AuthUIModule },
    { path: '/login', component: AuthUIModule },
    { path: '/signup', component: AuthUIModule }
  ],
  menu: [],
  initialize: async () => console.log('🚀 AuthUI initialized'),
  destroy: async () => console.log('🔥 AuthUI destroyed')
};

// Register microservices
moduleRegistry.register(LandingSiteHaaLOModule);
moduleRegistry.register(AuthUIHaaLOModule);

console.log('✅ Microservices registered as HaaLO modules');