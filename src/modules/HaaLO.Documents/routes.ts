import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

// Lazy load Documents components
const DocumentsDashboard = lazy(() => import('./components/DocumentsDashboard').then(m => ({ default: m.DocumentsDashboard })));
const DocumentLibrary = lazy(() => import('./components/DocumentLibrary').then(m => ({ default: m.DocumentLibrary })));
const DocumentTemplates = lazy(() => import('./components/DocumentTemplates').then(m => ({ default: m.DocumentTemplates })));
const ESignatures = lazy(() => import('./components/ESignatures').then(m => ({ default: m.ESignatures })));
const DocumentWorkflows = lazy(() => import('./components/DocumentWorkflows').then(m => ({ default: m.DocumentWorkflows })));
const DocumentsConfig = lazy(() => import('./components/DocumentsConfig').then(m => ({ default: m.DocumentsConfig })));

export const documentsRoutes: ModuleRoute[] = [
  {
    path: '/admin/documents',
    component: DocumentsDashboard,
    exact: true,
    roles: ['admin', 'super_admin', 'document_manager']
  },
  {
    path: '/admin/documents/library',
    component: DocumentLibrary,
    roles: ['admin', 'super_admin', 'document_manager']
  },
  {
    path: '/admin/documents/templates',
    component: DocumentTemplates,
    roles: ['admin', 'super_admin', 'document_manager']
  },
  {
    path: '/admin/documents/signatures',
    component: ESignatures,
    roles: ['admin', 'super_admin', 'document_manager']
  },
  {
    path: '/admin/documents/workflows',
    component: DocumentWorkflows,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/documents/config',
    component: DocumentsConfig,
    roles: ['admin', 'super_admin']
  }
];