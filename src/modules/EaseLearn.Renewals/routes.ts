import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

const RenewalsManager = lazy(() => import('./pages/RenewalsManager').then(m => ({ default: m.RenewalsManager })));

export const renewalsRoutes: ModuleRoute[] = [
  {
    path: '/admin/easelearn/renewals',
    component: RenewalsManager,
    exact: true,
    roles: ['admin', 'super_admin', 'training_manager']
  }
];