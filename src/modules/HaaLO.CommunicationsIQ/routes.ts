import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

// Lazy load Communications IQ components
const CommunicationsIQApp = lazy(() => import('@/pages/apps/CommunicationsIQApp'));

export const communicationsIQRoutes: ModuleRoute[] = [
  {
    path: '/apps/communications-iq',
    component: CommunicationsIQApp,
    exact: true,
    roles: ['super_admin', 'company_admin', 'internal_staff']
  }
];