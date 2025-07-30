import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

const MyCertificatesPortfolio = lazy(() => import('./pages/MyCertificatesPortfolio').then(m => ({ default: m.MyCertificatesPortfolio })));

export const myCertificatesRoutes: ModuleRoute[] = [
  {
    path: '/learning/my-certificates',
    component: MyCertificatesPortfolio,
    exact: true,
    roles: ['employee', 'learner', 'user']
  }
];