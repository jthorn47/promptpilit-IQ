/**
 * HaaLO.VaultPay Module
 * Payroll/payment engine (optional module)
 */

import React from 'react';
import { RegisterModule, moduleRegistry, HaaLOModule } from '../core/ModuleLoader';

// Use the VaultPay page directly without ModuleWrapper since StandardPageLayout handles the layout
const VaultPayComponent = React.lazy(() => 
  import('../../pages/apps/client/halo-payroll/pages/VaultPayPage').then(module => ({
    default: module.VaultPayPage
  }))
);

const VaultPayModule: HaaLOModule = {
  metadata: {
    id: 'haalo.vaultpay',
    name: 'VaultPay',
    description: 'Payroll/payment engine (optional module)',
    version: '1.0.0',
    icon: 'CreditCard',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: '#059669'
  },
  routes: [
    {
      path: '/halo/vaultpay',
      component: VaultPayComponent,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],
  menu: [
    {
      id: 'vaultpay',
      label: 'VaultPay',
      icon: 'CreditCard',
      path: '/halo/vaultpay',
      requiredRoles: ['super_admin', 'company_admin']
    }
  ],
  initialize: async (config) => {
    console.log('💳 Initializing HaaLO.VaultPay module:', config);
  },
  destroy: async () => {
    console.log('💳 Destroying HaaLO.VaultPay module');
  }
};

// Register the module
RegisterModule(VaultPayModule);

// Set module access and load the module
moduleRegistry.setModuleAccess(VaultPayModule.metadata.id, true);
moduleRegistry.loadModule(VaultPayModule.metadata.id);