import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

const KnowledgeBaseManager = lazy(() => import('./pages/KnowledgeBaseManager').then(m => ({ default: m.KnowledgeBaseManager })));

export const kbRoutes: ModuleRoute[] = [
  {
    path: '/admin/easelearn/knowledge-base',
    component: KnowledgeBaseManager,
    exact: true,
    roles: ['admin', 'super_admin', 'training_manager']
  }
];