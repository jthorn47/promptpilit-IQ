import { moduleRegistry } from '../core/ModuleLoader';

// Register the HaaLO.EventBus module
moduleRegistry.register({
  metadata: {
    id: 'haalo-eventbus',
    name: 'HaaLO.EventBus',
    version: '1.0.0',
    description: 'Event Bus - Internal pub-sub system for cross-module communication',
    icon: 'Zap',
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

// Export event bus functionality
export * from './services/EventBusService';
export * from './hooks/useEventSubscription';
export * from './types';