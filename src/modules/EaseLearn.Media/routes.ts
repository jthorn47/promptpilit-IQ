import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

const MediaLibrary = lazy(() => import('./pages/MediaLibrary').then(m => ({ default: m.MediaLibrary })));

export const mediaRoutes: ModuleRoute[] = [
  {
    path: '/admin/easelearn/media',
    component: MediaLibrary,
    exact: true,
    roles: ['admin', 'super_admin', 'training_manager']
  }
];