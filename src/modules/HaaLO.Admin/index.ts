import { HaaLOModule } from '../core/ModuleLoader';
import { adminRoutes } from './routes';

export const HaaLOAdminModule: HaaLOModule = {
  metadata: {
    id: 'haalo-admin',
    name: 'HaaLO Admin',
    version: '1.0.0',
    description: 'Administrative tools and system management',
    icon: 'Settings',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: '#10b981'
  },
  routes: adminRoutes,
  menu: [
    {
      id: 'admin-dashboard',
      label: 'Admin Dashboard',
      path: '/admin',
      icon: 'Settings',
      requiredRoles: ['super_admin', 'company_admin']
    },
    {
      id: 'roles-permissions',
      label: 'Roles & Permissions',
      path: '/admin/roles-permissions',
      icon: 'Users',
      requiredRoles: ['super_admin']
    },
    {
      id: 'contact-search',
      label: 'Contact Search',
      path: '/admin/contact-search',
      icon: 'Search',
      requiredRoles: ['super_admin', 'company_admin']
    },
    {
      id: 'modules',
      label: 'Modules',
      path: '/admin/modules',
      icon: 'Package',
      requiredRoles: ['super_admin']
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      path: '/admin/settings',
      icon: 'Settings',
      requiredRoles: ['super_admin']
    },
    {
      id: 'stripe-dashboard',
      label: 'Stripe Dashboard',
      path: '/admin/stripe',
      icon: 'CreditCard',
      requiredRoles: ['super_admin']
    }
  ],
  initialize: async () => {
    console.log('🚀 Initializing HaaLO Admin module');
  },
  destroy: async () => {
    console.log('🔥 Destroying HaaLO Admin module');
  }
};

// Register the module
import { moduleRegistry } from '../core/ModuleLoader';
moduleRegistry.register(HaaLOAdminModule);
console.log('📦 Module registered: HaaLO Admin (haalo-admin)');