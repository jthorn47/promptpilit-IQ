import { HaaLOModule } from '../core/ModuleLoader';
import { crmRoutes } from './routes';
import { CRMDemo } from './components/CRMDemo';

// Component exports
export { default as DealsManager } from './components/DealsManager';
export { LeadsManager } from './components/LeadsManager';
export { ActivitiesManager } from './components/ActivitiesManager';
export { CompaniesManager } from './components/CompaniesManager';
export { CRMDemo } from './components/CRMDemo';
export { HubSpotImportManager } from './components/HubSpotImportManager';
export { SubscriptionsManager } from './components/SubscriptionsManager';
export { PurchasesManager } from './components/PurchasesManager';

// Hook exports
export * from './hooks';

// Type exports
export * from './types';

// Routes export
export { crmRoutes } from './routes';

// Module definition
const HaaLOCRMModule: HaaLOModule = {
  metadata: {
    id: 'haalo.crm',
    name: 'Connect IQ',
    description: 'Customer Relationship Management',
    version: '1.0.0',
    category: 'hr',
    status: 'active',
    icon: 'Users',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    statusColor: 'bg-green-500'
  },
  routes: crmRoutes,
  menu: [
    {
      id: 'crm-main',
      label: 'CRM',
      icon: 'Users',
      path: '/admin/crm/dashboard',
      children: [
        {
          id: 'crm-dashboard',
          label: 'Dashboard',
          icon: 'BarChart3',
          path: '/admin/crm/dashboard'
        },
        {
          id: 'crm-companies',
          label: 'Companies',
          icon: 'Building',
          path: '/admin/crm/companies'
        },
        {
          id: 'crm-leads',
          label: 'Leads',
          icon: 'Users',
          path: '/admin/crm/leads'
        },
        {
          id: 'crm-deals',
          label: 'Deals',
          icon: 'TrendingUp',
          path: '/admin/crm/deals'
        },
        {
          id: 'crm-activities',
          label: 'Activities',
          icon: 'Activity',
          path: '/admin/crm/activities'
        },
        {
          id: 'crm-email-templates',
          label: 'Email Templates',
          icon: 'FileText',
          path: '/admin/crm/email-templates'
        },
        {
          id: 'crm-email-campaigns',
          label: 'Email Campaigns',
          icon: 'Send',
          path: '/admin/crm/email-campaigns'
        },
        {
          id: 'crm-email-client',
          label: 'Halo Mail',
          icon: 'Mail',
          path: '/admin/crm/email-client'
        },
        {
          id: 'crm-hubspot-import',
          label: 'HubSpot Import',
          icon: 'Download',
          path: '/admin/crm/hubspot-import'
        },
        {
          id: 'crm-subscriptions',
          label: 'Subscriptions',
          icon: 'CreditCard',
          path: '/admin/subscriptions'
        },
        {
          id: 'crm-purchases',
          label: 'Purchases',
          icon: 'ShoppingBag',
          path: '/admin/purchases'
        },
        {
          id: 'crm-automations',
          label: 'Automations',
          icon: 'Workflow',
          path: '/admin/crm/automations'
        }
      ]
    }
  ],
  services: {},
  state: {},
  configuration: {},
  
  async initialize(config) {
    console.log('🚀 Initializing HaaLO CRM module', config);
  },

  async destroy() {
    console.log('🗑️ Destroying HaaLO CRM module');
  },

  getComponent() {
    return CRMDemo;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(HaaLOCRMModule);
// Grant access to the module (in production, this would be permission-based)
moduleRegistry.setModuleAccess(HaaLOCRMModule.metadata.id, true);
moduleRegistry.loadModule(HaaLOCRMModule.metadata.id);

export default HaaLOCRMModule;
