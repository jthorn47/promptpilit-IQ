import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

// Lazy load Tasks & Workflows components
const TasksWorkflowsDashboard = lazy(() => import('./components/TasksWorkflowsDashboard').then(m => ({ default: m.TasksWorkflowsDashboard })));
const TaskManager = lazy(() => import('./components/TaskManager').then(m => ({ default: m.TaskManager })));
const WorkflowBuilder = lazy(() => import('./components/WorkflowBuilder').then(m => ({ default: m.WorkflowBuilder })));
const WorkflowTemplates = lazy(() => import('./components/WorkflowTemplates').then(m => ({ default: m.WorkflowTemplates })));
const AutomationRules = lazy(() => import('./components/AutomationRules').then(m => ({ default: m.AutomationRules })));
const TasksWorkflowsConfig = lazy(() => import('./components/TasksWorkflowsConfig').then(m => ({ default: m.TasksWorkflowsConfig })));

// Legacy pages integration
const TasksManagerPage = lazy(() => import('../../pages/TasksManagerPage').then(m => ({ default: m.TasksManagerPage })));
const WorkflowPage = lazy(() => import('../../pages/WorkflowPage').then(m => ({ default: m.WorkflowPage })));

export const tasksWorkflowsRoutes: ModuleRoute[] = [
  {
    path: '/admin/tasks-workflows',
    component: TasksWorkflowsDashboard,
    exact: true,
    roles: ['admin', 'super_admin', 'project_manager']
  },
  {
    path: '/admin/tasks-workflows/tasks',
    component: TaskManager,
    roles: ['admin', 'super_admin', 'project_manager']
  },
  {
    path: '/admin/tasks-workflows/builder',
    component: WorkflowBuilder,
    roles: ['admin', 'super_admin', 'project_manager']
  },
  {
    path: '/admin/tasks-workflows/templates',
    component: WorkflowTemplates,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/tasks-workflows/automation',
    component: AutomationRules,
    roles: ['admin', 'super_admin']
  },
  {
    path: '/admin/tasks-workflows/config',
    component: TasksWorkflowsConfig,
    roles: ['admin', 'super_admin']
  },
  // Legacy routes integration
  {
    path: '/tasks',
    component: TasksManagerPage,
    roles: ['admin', 'super_admin', 'project_manager']
  },
  {
    path: '/workflow',
    component: WorkflowPage,
    roles: ['admin', 'super_admin', 'project_manager']
  }
];