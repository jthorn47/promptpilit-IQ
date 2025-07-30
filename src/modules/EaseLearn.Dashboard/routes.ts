import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

// Lazy load Dashboard components
const DashboardOverview = lazy(() => import('./pages/DashboardOverview').then(m => ({ default: m.DashboardOverview })));

export const dashboardRoutes: ModuleRoute[] = [
  {
    path: '/admin/easelearn/dashboard',
    component: DashboardOverview,
    exact: true,
    roles: ['admin', 'super_admin', 'training_manager']
  }
];