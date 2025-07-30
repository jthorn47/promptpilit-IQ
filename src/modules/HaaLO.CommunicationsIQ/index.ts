import { HaaLOModule } from '../core/ModuleLoader';
import { communicationsIQRoutes } from './routes';
import CommunicationsIQApp from '@/pages/apps/CommunicationsIQApp';

const HaaLOCommunicationsIQModule: HaaLOModule = {
  metadata: {
    id: 'haalo.communications-iq',
    name: 'Communications IQ',
    description: 'Unified communication management for CRM',
    version: '1.0.0',
    category: 'core',
    status: 'active',
    icon: 'Mail',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    statusColor: 'bg-blue-500'
  },
  routes: communicationsIQRoutes,
  menu: [
    {
      id: 'communications-main',
      label: 'Communications',
      icon: 'Mail',
      path: '/apps/communications-iq',
      children: [
        {
          id: 'communications-dashboard',
          label: 'Dashboard',
          icon: 'BarChart3',
          path: '/apps/communications-iq'
        },
        {
          id: 'email-client',
          label: 'Email Client',
          icon: 'Inbox',
          path: '/admin/crm/email-client'
        },
        {
          id: 'email-templates',
          label: 'Email Templates',
          icon: 'FileText',
          path: '/admin/crm/email-templates'
        },
        {
          id: 'email-campaigns',
          label: 'Email Campaigns',
          icon: 'Send',
          path: '/admin/crm/email-campaigns'
        },
        {
          id: 'communications-log',
          label: 'Communications Log',
          icon: 'MessageSquare',
          path: '/admin/crm/activities'
        }
      ]
    }
  ],
  services: {},
  state: {},
  configuration: {},
  
  async initialize(config) {
    console.log('🚀 Initializing Communications IQ module', config);
  },

  async destroy() {
    console.log('🗑️ Destroying Communications IQ module');
  },

  getComponent() {
    return CommunicationsIQApp;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(HaaLOCommunicationsIQModule);
// Grant access to the module (in production, this would be permission-based)
moduleRegistry.setModuleAccess(HaaLOCommunicationsIQModule.metadata.id, true);
moduleRegistry.loadModule(HaaLOCommunicationsIQModule.metadata.id);

export default HaaLOCommunicationsIQModule;