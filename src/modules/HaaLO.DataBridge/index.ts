/**
 * HaaLO.DataBridge Module
 * API/ETL connections to external systems
 */

import React from 'react';
import { RegisterModule } from '../core/ModuleLoader';

// Create the DataBridge component
const DataBridgeComponent = React.lazy(() => 
  import('../../pages/databridge/DataBridgePage').then(module => ({
    default: module.DataBridgePage
  }))
);

const AnalyticsDashboard = React.lazy(() => 
  import('../../pages/databridge/AnalyticsDashboard').then(module => ({
    default: module.AnalyticsDashboard
  }))
);

const DataIntegration = React.lazy(() => 
  import('../../pages/databridge/DataIntegration').then(module => ({
    default: module.DataIntegration
  }))
);

const WorkflowAutomation = React.lazy(() => 
  import('../../pages/databridge/WorkflowAutomation').then(module => ({
    default: module.WorkflowAutomation
  }))
);

RegisterModule({
  metadata: {
    id: 'haalo.databridge',
    name: 'DataBridge',
    description: 'API/ETL connections to external systems',
    version: '1.0.0',
    icon: 'Database',
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
      path: '/halo/integrations',
      component: DataBridgeComponent,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'admin']
    },
    {
      path: '/admin/databridge/analytics',
      component: AnalyticsDashboard,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/databridge/integration',
      component: DataIntegration,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/databridge/workflows',
      component: WorkflowAutomation,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],
  menu: [
    {
      id: 'databridge',
      label: 'DataBridge',
      icon: 'Database',
      path: '/halo/integrations',
      requiredRoles: ['super_admin', 'company_admin', 'admin'] // Expanded roles for testing
    }
  ],
  initialize: async (config) => {
    console.log('🔗 Initializing HaaLO.DataBridge module:', config);
  },
  destroy: async () => {
    console.log('🔗 Destroying HaaLO.DataBridge module');
  }
});