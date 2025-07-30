import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

const LearnerManagement = lazy(() => import('./pages/LearnerManagement').then(m => ({ default: m.LearnerManagement })));

export const usersRoutes: ModuleRoute[] = [
  {
    path: '/admin/easelearn/users',
    component: LearnerManagement,
    exact: true,
    roles: ['admin', 'super_admin', 'training_manager']
  }
];