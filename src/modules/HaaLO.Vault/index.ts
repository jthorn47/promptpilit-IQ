/**
 * HaaLO.Vault Module
 * Secure document storage and management
 */

import React from 'react';
import { RegisterModule, moduleRegistry, HaaLOModule } from '../core/ModuleLoader';
import { Lock } from 'lucide-react';

// Use the vault component directly without ModuleWrapper since StandardPageLayout handles the layout
const VaultComponent = React.lazy(() => 
  import('../vault/VaultModule').then(module => ({
    default: module.VaultModule
  }))
);

const VaultModule: HaaLOModule = {
  metadata: {
    id: 'haalo.vault',
    name: 'The Vault',
    description: 'Secure document storage and management',
    version: '1.0.0',
    icon: 'Lock',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: '#10b981'
  },
  routes: [
    {
      path: '/halo/vault',
      component: VaultComponent,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],
  menu: [
    {
      id: 'vault',
      label: 'The Vault',
      icon: 'Lock',
      path: '/halo/vault',
      requiredRoles: ['super_admin', 'company_admin']
    }
  ],
  initialize: async (config) => {
    console.log('🔒 Initializing HaaLO.Vault module:', config);
  },
  destroy: async () => {
    console.log('🔒 Destroying HaaLO.Vault module');
  }
};

// Register the module
RegisterModule(VaultModule);

// Set module access and load the module
moduleRegistry.setModuleAccess(VaultModule.metadata.id, true);
moduleRegistry.loadModule(VaultModule.metadata.id);