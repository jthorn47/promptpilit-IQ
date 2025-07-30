import { Database, BarChart3, Zap } from 'lucide-react';

export const dataBridgeModuleConfig = {
  id: 'databridge',
  name: 'DataBridge IQ',
  description: 'Data integration and analytics platform',
  version: '1.0.0',
  routes: [
    {
      path: '/admin/databridge/integration',
      name: 'Data Integration',
      icon: Database,
      roles: ['super_admin', 'company_admin'],
      component: () => import('@/pages/databridge/DataIntegration').then(m => ({ default: m.DataIntegration }))
    },
    {
      path: '/admin/databridge/analytics',
      name: 'Analytics Dashboard',
      icon: BarChart3,
      roles: ['super_admin', 'company_admin'],
      component: () => import('@/pages/databridge/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard }))
    },
    {
      path: '/admin/databridge/workflows',
      name: 'Workflow Automation',
      icon: Zap,
      roles: ['super_admin', 'company_admin'],
      component: () => import('@/pages/databridge/WorkflowAutomation').then(m => ({ default: m.WorkflowAutomation }))
    }
  ],
  permissions: ['databridge:read', 'databridge:write', 'databridge:admin'],
  dependencies: [],
  settings: {}
};