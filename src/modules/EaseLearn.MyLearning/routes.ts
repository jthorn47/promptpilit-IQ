import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

// Lazy load MyLearning components
const MyLearningDashboard = lazy(() => import('./pages/MyLearningDashboard').then(m => ({ default: m.MyLearningDashboard })));

export const myLearningRoutes: ModuleRoute[] = [
  {
    path: '/learning/my-courses',
    component: MyLearningDashboard,
    exact: true,
    roles: ['employee', 'learner', 'user']
  }
];