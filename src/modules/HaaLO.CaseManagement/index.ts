import { HaaLOModule } from '../core/ModuleLoader';
import { caseManagementRoutes } from './routes';

export const HaaLOCaseManagementModule: HaaLOModule = {
  metadata: {
    id: 'haalo-case-management',
    name: 'HaaLO Case Management',
    version: '1.0.0',
    description: 'Comprehensive case management and client pulse monitoring',
    icon: 'FileText',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: '#3b82f6'
  },
  routes: caseManagementRoutes,
  menu: [
    {
      id: 'pulse-main',
      label: 'Pulse CMS',
      path: '/pulse/dashboard',
      icon: 'Activity',
      children: [
        {
          id: 'pulse-dashboard',
          label: 'Dashboard',
          path: '/pulse/dashboard',
          icon: 'Activity'
        },
        {
          id: 'pulse-cases',
          label: 'All Cases',
          path: '/pulse/cases',
          icon: 'FileText'
        },
        {
          id: 'pulse-new-case',
          label: 'New Case',
          path: '/pulse/new',
          icon: 'Plus'
        },
        {
          id: 'pulse-settings',
          label: 'Settings',
          path: '/pulse/settings',
          icon: 'Settings'
        },
        {
          id: 'pulse-email-processing',
          label: 'Email Processing',
          path: '/pulse/email-processing',
          icon: 'Mail'
        }
      ]
    }
  ],
  initialize: async () => {
    console.log('🚀 Initializing HaaLO Case Management module');
  },
  destroy: async () => {
    console.log('🔥 Destroying HaaLO Case Management module');
  }
};

// Register the module
import { moduleRegistry } from '../core/ModuleLoader';

// FORCE CLEAR any existing registration first
console.log('🔧 Checking existing modules before registration...');
const existingModules = moduleRegistry.getAllModules();
console.log('🔧 Existing modules:', existingModules.map(m => ({name: m.metadata.name, id: m.metadata.id, menu: m.menu})));

console.log('🔧 Before registering HaaLO Case Management module');
moduleRegistry.register(HaaLOCaseManagementModule);
console.log('🔧 After registering HaaLO Case Management module');

// Grant access to the module (in production, this would be permission-based)
moduleRegistry.setModuleAccess(HaaLOCaseManagementModule.metadata.id, true);
console.log('🔧 Granted access to module:', HaaLOCaseManagementModule.metadata.id);
moduleRegistry.loadModule(HaaLOCaseManagementModule.metadata.id);
console.log('🔧 Loaded module:', HaaLOCaseManagementModule.metadata.id);
console.log('🔧 Module menu items:', HaaLOCaseManagementModule.menu);

// Check what modules are now registered
const allModules = moduleRegistry.getAllModules();
console.log('🔧 All modules after registration:', allModules.map(m => ({name: m.metadata.name, id: m.metadata.id, menu: m.menu})));

console.log('📦 Module registered: HaaLO Case Management (haalo-case-management)');