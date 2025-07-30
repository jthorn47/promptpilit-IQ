/**
 * HaaLO.CompX Module
 * Workers' compensation management
 */

import React from 'react';
import { RegisterModule } from '../core/ModuleLoader';

// Create a wrapped version of CompX with the hero banner
const CompXComponent = React.lazy(() => 
  Promise.all([
    import('../../pages/admin/haalo/CompXDashboard'),
    import('../../components/shared/ModuleWrapper')
  ]).then(([compxModule, wrapperModule]) => ({
    default: () => React.createElement(
      wrapperModule.ModuleWrapper,
      { children: React.createElement(compxModule.default) }
    )
  }))
);

RegisterModule({
  metadata: {
    id: 'haalo.compx',
    name: 'CompX',
    description: "Workers' compensation management",
    version: '1.0.0',
    icon: 'Shield',
    category: 'premium',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: [
    {
      path: '/halo/comp',
      component: CompXComponent,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],
  menu: [
    {
      id: 'compx',
      label: 'CompX',
      icon: 'Shield',
      path: '/halo/comp',
      requiredRoles: ['super_admin', 'company_admin']
    }
  ],
  initialize: async (config) => {
    console.log('🛡️ Initializing HaaLO.CompX module:', config);
  },
  destroy: async () => {
    console.log('🛡️ Destroying HaaLO.CompX module');
  }
});