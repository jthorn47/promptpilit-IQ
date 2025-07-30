/**
 * HaaLO.TasksWorkflows Module
 * Automated task management and customizable workflow builders
 */

import { HaaLOModule } from '@/modules/core/ModuleLoader';
import { tasksWorkflowsRoutes } from './routes';
import { TasksWorkflowsConfig } from './components/TasksWorkflowsConfig';

const HaaLOTasksWorkflowsModule: HaaLOModule = {
  metadata: {
    id: 'tasks-workflows',
    name: 'Tasks & Workflows',
    description: 'Automated task management and customizable workflow builders.',
    version: '1.0.0',
    icon: 'CheckCircle',
    category: 'core',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: 'green'
  },
  routes: tasksWorkflowsRoutes,
  services: {},
  state: {},
  configuration: {
    permissions: ['tasks:read', 'tasks:write', 'workflows:manage'],
    requiredRoles: ['company_admin', 'super_admin', 'project_manager'],
    tenantScoped: true
  },
  async initialize(config) {
    console.log('Initializing HaaLO.TasksWorkflows module:', config);
  },
  async destroy() {
    console.log('Destroying HaaLO.TasksWorkflows module');
  },
  getComponent() {
    return TasksWorkflowsConfig;
  }
};

// Auto-register the module
import { moduleRegistry } from '@/modules/core/ModuleLoader';
moduleRegistry.register(HaaLOTasksWorkflowsModule);

export default HaaLOTasksWorkflowsModule;