/**
 * HaaLO.ComplyIQ Module
 * Compliance tracking and alerts
 */

import React from 'react';
import { RegisterModule } from '../core/ModuleLoader';


// Create a wrapped component with hero banner
const ComplyIQComponent = React.lazy(() => 
  Promise.all([
    import('../../pages/admin/haalo/HaaloPlaceholder'),
    import('../../components/shared/ModuleWrapper')
  ]).then(([placeholderModule, wrapperModule]) => ({
    default: () => React.createElement(
      wrapperModule.ModuleWrapper,
      { 
        children: React.createElement(placeholderModule.HaaloPlaceholder, {
          title: "ComplyIQ",
          description: "Compliance tracking and alerts", 
          moduleName: "ComplyIQ",
          icon: () => React.createElement('div')
        })
      }
    )
  }))
);

RegisterModule({
  metadata: {
    id: 'haalo.complyiq',
    name: 'ComplyIQ',
    description: 'Compliance tracking and alerts',
    version: '1.0.0',
    icon: 'CheckCircle',
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
      path: '/halo/comply',
      component: ComplyIQComponent,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],
  menu: [
    {
      id: 'complyiq',
      label: 'ComplyIQ',
      icon: 'CheckCircle',
      path: '/halo/comply',
      requiredRoles: ['super_admin', 'company_admin']
    }
  ],
  initialize: async (config) => {
    console.log('✅ Initializing HaaLO.ComplyIQ module:', config);
  },
  destroy: async () => {
    console.log('✅ Destroying HaaLO.ComplyIQ module');
  }
});