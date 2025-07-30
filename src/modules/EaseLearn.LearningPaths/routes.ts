import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

const LearningPathsManager = lazy(() => import('./pages/LearningPathsManager').then(m => ({ default: m.LearningPathsManager })));

export const learningPathsRoutes: ModuleRoute[] = [
  {
    path: '/admin/easelearn/learning-paths',
    component: LearningPathsManager,
    exact: true,
    roles: ['admin', 'super_admin', 'training_manager']
  }
];