/**
 * HaaLO.PropGEN Module
 * Document generation and proposals
 */

import React from 'react';
import { RegisterModule } from '../core/ModuleLoader';

// Create a wrapped version of PropGEN with the hero banner
const PropGENWizard = React.lazy(() => 
  Promise.all([
    import('../../pages/admin/haalo/HaaloPlaceholder'),
    import('../../components/shared/ModuleWrapper')
  ]).then(([placeholderModule, wrapperModule]) => ({
    default: () => React.createElement(
      wrapperModule.ModuleWrapper,
      { 
        children: React.createElement(placeholderModule.HaaloPlaceholder, {
          title: "PropGEN Pro",
          description: "Smart document generation and proposal wizard",
          moduleName: "PropGEN Pro",
          icon: () => React.createElement('div')
        })
      }
    )
  }))
);

RegisterModule({
  metadata: {
    id: 'haalo.propgen',
    name: 'PropGEN Pro',
    description: 'Smart document generation and proposal wizard',
    version: '1.0.0',
    icon: 'FileText',
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
      path: '/halo/propgen',
      component: PropGENWizard,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],
  menu: [
    {
      id: 'propgen',
      label: 'PropGEN Pro',
      icon: 'FileText',
      path: '/halo/propgen',
      requiredRoles: ['super_admin', 'company_admin']
    }
  ],
  initialize: async (config) => {
    console.log('📄 Initializing HaaLO.PropGEN module:', config);
  },
  destroy: async () => {
    console.log('📄 Destroying HaaLO.PropGEN module');
  }
});