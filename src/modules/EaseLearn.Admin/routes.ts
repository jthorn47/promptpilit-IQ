import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

const CommandCenter = lazy(() => import('./pages/CommandCenter').then(m => ({ default: m.CommandCenter })));

export const adminRoutes: ModuleRoute[] = [
  {
    path: '/admin/easelearn/command-center',
    component: CommandCenter,
    exact: true,
    roles: ['super_admin', 'system_admin']
  }
];