/**
 * HaaLO.SecureForms Module
 * Secure form submission and e-signature
 */

import React from 'react';
import { RegisterModule } from '../core/ModuleLoader';

// Create a wrapped version of SecureForms with the hero banner
const SecureFormsComponent = React.lazy(() => 
  Promise.all([
    import('../../pages/admin/haalo/HaaloPlaceholder'),
    import('../../components/shared/ModuleWrapper')
  ]).then(([placeholderModule, wrapperModule]) => ({
    default: () => React.createElement(
      wrapperModule.ModuleWrapper,
      { 
        children: React.createElement(placeholderModule.HaaloPlaceholder, {
          title: "SecureForms",
          description: "Secure form submission and e-signature",
          moduleName: "SecureForms",
          icon: () => React.createElement('div')
        })
      }
    )
  }))
);

RegisterModule({
  metadata: {
    id: 'haalo.secureforms',
    name: 'SecureForms',
    description: 'Secure form submission and e-signature',
    version: '1.0.0',
    icon: 'FileSignature',
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
      path: '/halo/forms',
      component: SecureFormsComponent,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],
  menu: [
    {
      id: 'secureforms',
      label: 'SecureForms',
      icon: 'FileSignature',
      path: '/halo/forms',
      requiredRoles: ['super_admin', 'company_admin']
    }
  ],
  initialize: async (config) => {
    console.log('📝 Initializing HaaLO.SecureForms module:', config);
  },
  destroy: async () => {
    console.log('📝 Destroying HaaLO.SecureForms module');
  }
});