import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

// Lazy load Course components
const CourseLibrary = lazy(() => import('./pages/CourseLibrary').then(m => ({ default: m.CourseLibrary })));

export const coursesRoutes: ModuleRoute[] = [
  {
    path: '/admin/easelearn/courses',
    component: CourseLibrary,
    exact: true,
    roles: ['admin', 'super_admin', 'training_manager']
  }
];