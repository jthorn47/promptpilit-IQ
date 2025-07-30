import { moduleRegistry } from '../core/ModuleLoader';

// Register the HaaLO.Shared module
moduleRegistry.register({
  metadata: {
    id: 'haalo-shared',
    name: 'HaaLO.Shared',
    version: '1.0.0',
    description: 'Shared Library Layer - Reusable UI components, hooks, and utilities',
    icon: 'Package',
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

// Export shared components, hooks, and utilities
export * from './components';
export * from './hooks';
export * from './utils';
export * from './types';