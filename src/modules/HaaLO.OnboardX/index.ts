/**
 * HaaLO.OnboardX Module
 * Employee onboarding workflows
 */

import React from 'react';
import { RegisterModule } from '../core/ModuleLoader';

// Create a wrapped version of OnboardX with the hero banner
const OnboardXComponent = React.lazy(() => 
  Promise.all([
    import('../../pages/admin/haalo/HaaloPlaceholder'),
    import('../../components/shared/ModuleWrapper')
  ]).then(([placeholderModule, wrapperModule]) => ({
    default: () => React.createElement(
      wrapperModule.ModuleWrapper,
      { 
        children: React.createElement(placeholderModule.HaaloPlaceholder, {
          title: "OnboardX",
          description: "Smart employee onboarding workflows",
          moduleName: "OnboardX",
          icon: () => React.createElement('div')
        })
      }
    )
  }))
);

RegisterModule({
  metadata: {
    id: 'haalo.onboardx',
    name: 'OnboardX',
    description: 'Smart employee onboarding workflows',
    version: '1.0.0',
    icon: 'UserPlus',
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
      path: '/halo/onboarding',
      component: OnboardXComponent,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],
  menu: [
    {
      id: 'onboardx',
      label: 'OnboardX',
      icon: 'UserPlus',
      path: '/halo/onboarding',
      requiredRoles: ['super_admin', 'company_admin']
    }
  ],
  initialize: async (config) => {
    console.log('👤 Initializing HaaLO.OnboardX module:', config);
  },
  destroy: async () => {
    console.log('👤 Destroying HaaLO.OnboardX module');
  }
});