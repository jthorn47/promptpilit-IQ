import { moduleRegistry } from '../core/ModuleLoader';

// Register the HaaLO.Permissions module
moduleRegistry.register({
  metadata: {
    id: 'haalo-permissions',
    name: 'HaaLO.Permissions',
    version: '1.0.0',
    description: 'Permissions Engine - Centralized role and permission mapping system',
    icon: 'Shield',
    category: 'core',
    status: 'active',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    statusColor: 'green',
    dependencies: []
  },
  routes: []
});

// Export permissions functionality
export * from './services/PermissionsService';
export * from './hooks/usePermissions';
export * from './hooks/useRoleCheck';
export * from './types';