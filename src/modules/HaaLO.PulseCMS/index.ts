/**
 * HaaLO.PulseCMS Module
 * Case management and workflow system
 */

import React from 'react';
import { RegisterModule, moduleRegistry, HaaLOModule } from '../core/ModuleLoader';

// Use the cases page directly without ModuleWrapper since StandardPageLayout handles the layout
const CasesPage = React.lazy(() => 
  import('../../pages/cases/CasesPage').then(module => ({
    default: module.CasesPage
  }))
);

// Lazy load all Pulse CMS pages
const PulseDashboardPage = React.lazy(() => 
  import('../../pages/PulseDashboardPage').then(module => ({
    default: module.PulseDashboardPage
  }))
);

const PulseTemplatesPage = React.lazy(() => 
  import('../../pages/admin/pulse/PulseTemplatesPage').then(module => ({
    default: module.PulseTemplatesPage
  }))
);

const PulseDocumentsPage = React.lazy(() => 
  import('../../pages/admin/pulse/PulseDocumentsPage').then(module => ({
    default: module.PulseDocumentsPage
  }))
);

const PulseTasksPage = React.lazy(() => 
  import('../../pages/admin/pulse/PulseTasksPage').then(module => ({
    default: module.PulseTasksPage
  }))
);

const PulseReportsPage = React.lazy(() => 
  import('../../pages/admin/pulse/PulseReportsPage').then(module => ({
    default: module.PulseReportsPage
  }))
);

const PulseDynamicReportView = React.lazy(() => 
  import('../../components/pulse/PulseDynamicReportView').then(module => ({
    default: module.PulseDynamicReportView
  }))
);

const PulseAlertsPage = React.lazy(() => 
  import('../../pages/admin/pulse/PulseAlertsPage').then(module => ({
    default: module.PulseAlertsPage
  }))
);

const PulseInsightsPage = React.lazy(() => 
  import('../../pages/admin/pulse/PulseInsightsPage').then(module => ({
    default: module.PulseInsightsPage
  }))
);

const PulseLegalPage = React.lazy(() => 
  import('../../pages/admin/pulse/PulseLegalPage').then(module => ({
    default: module.PulseLegalPage
  }))
);

const HALIAssistantPage = React.lazy(() => 
  import('../../pages/admin/pulse/HALIAssistantPage').then(module => ({
    default: module.HALIAssistantPage
  }))
);

const ClientHALIAssistantPage = React.lazy(() => 
  import('../../pages/client/pulse/HALIAssistantPage').then(module => ({
    default: module.HALIAssistantPage
  }))
);

const PulseCMSModule: HaaLOModule = {
  metadata: {
    id: 'haalo.pulsecms',
    name: 'Pulse CMS',
    description: 'Case management and workflow system',
    version: '1.0.0',
    icon: 'Activity',
    category: 'premium' as const,
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: [
    {
      path: '/admin/pulse',
      component: PulseDashboardPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      path: '/admin/pulse/cases',
      component: CasesPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      path: '/admin/pulse/templates',
      component: PulseTemplatesPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      path: '/admin/pulse/documents',
      component: PulseDocumentsPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      path: '/admin/pulse/tasks',
      component: PulseTasksPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      path: '/admin/pulse/reports',
      component: PulseReportsPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      path: '/admin/pulse/reports/:reportId',
      component: PulseDynamicReportView,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      path: '/admin/pulse/alerts',
      component: PulseAlertsPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      path: '/admin/pulse/insights',
      component: PulseInsightsPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      path: '/admin/pulse/legal',
      component: PulseLegalPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      path: '/admin/pulse/settings',
      component: React.lazy(() => 
        import('../../pages/PulseSettingsPage').then(module => ({
          default: module.PulseSettingsPage
        }))
      ),
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      path: '/admin/pulse/hali',
      component: HALIAssistantPage,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin', 'case_manager']
    },
    {
      path: '/client/pulse/hali',
      component: ClientHALIAssistantPage,
      exact: true,
      protected: true,
      roles: ['client_admin', 'company_admin']
    }
  ],
  menu: [
    {
      id: 'pulse-main',
      label: 'Pulse CMS',
      icon: 'Activity',
      path: '/admin/pulse',
      requiredRoles: ['super_admin', 'company_admin', 'case_manager'],
      children: [
        {
          id: 'pulse-cases',
          label: 'Cases',
          path: '/admin/pulse/cases',
          icon: 'FileText'
        },
        {
          id: 'pulse-templates',
          label: 'Case Templates',
          path: '/admin/pulse/templates',
          icon: 'Template'
        },
        {
          id: 'pulse-documents',
          label: 'Documents & Evidence',
          path: '/admin/pulse/documents',
          icon: 'FolderOpen'
        },
        {
          id: 'pulse-tasks',
          label: 'Task Tracker',
          path: '/admin/pulse/tasks',
          icon: 'CheckSquare'
        },
        {
          id: 'pulse-reports',
          label: 'Reporting & Compliance',
          path: '/admin/pulse/reports',
          icon: 'BarChart3'
        },
        {
          id: 'pulse-alerts',
          label: 'Alerts & Triggers',
          path: '/admin/pulse/alerts',
          icon: 'Bell'
        },
        {
          id: 'pulse-insights',
          label: 'Case Insights',
          path: '/admin/pulse/insights',
          icon: 'Brain'
        },
        {
          id: 'pulse-legal',
          label: 'Legal Review',
          path: '/admin/pulse/legal',
          icon: 'Scale'
        },
        {
          id: 'pulse-hali',
          label: 'HALI - SMS Support',
          path: '/admin/pulse/hali',
          icon: 'MessageSquare'
        },
        {
          id: 'pulse-settings',
          label: 'Settings',
          path: '/admin/pulse/settings',
          icon: 'Settings'
        }
      ]
    }
  ],
  initialize: async (config) => {
    console.log('📊 Initializing HaaLO.PulseCMS module:', config);
    console.log('📊 PulseCMS module registered with routes:', {
      routes: ['/halo/pulse'],
      component: 'CasesPage'
    });
  },
  destroy: async () => {
    console.log('📊 Destroying HaaLO.PulseCMS module');
  }
};

// Register the module
RegisterModule(PulseCMSModule);

// Set module access and load the module
moduleRegistry.setModuleAccess(PulseCMSModule.metadata.id, true);
moduleRegistry.loadModule(PulseCMSModule.metadata.id);