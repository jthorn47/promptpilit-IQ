import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

const CertificateAdmin = lazy(() => import('./pages/CertificateAdmin').then(m => ({ default: m.CertificateAdmin })));

export const certificatesRoutes: ModuleRoute[] = [
  {
    path: '/admin/easelearn/certificates',
    component: CertificateAdmin,
    exact: true,
    roles: ['admin', 'super_admin', 'training_manager']
  }
];