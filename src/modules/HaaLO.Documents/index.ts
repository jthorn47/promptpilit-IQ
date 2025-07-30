/**
 * HaaLO.Documents Module
 * Secure document storage, e-signatures, and workflow automation
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { documentsRoutes } from './routes';
import { DocumentsConfig } from './components/DocumentsConfig';

const HaaLODocumentsModule: HaaLOModule = {
  metadata: {
    id: 'documents',
    name: 'Documents',
    description: 'Secure document storage, e-signatures, and workflow automation.',
    version: '1.0.0',
    icon: 'FileText',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: documentsRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['documents:read', 'documents:write', 'documents:sign'],
    requiredRoles: ['company_admin', 'super_admin', 'document_manager'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing HaaLO.Documents module:', config);
  },
  async destroy() {
    console.log('Destroying HaaLO.Documents module');
  },
  getComponent() {
    return DocumentsConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(HaaLODocumentsModule);

export default HaaLODocumentsModule;