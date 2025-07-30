import { ModuleRoute } from '../core/ModuleLoader';
import { lazy } from 'react';

// Lazy load case management pages
const PulseDashboardPage = lazy(() => import('../../pages/PulseDashboardPage').then(module => ({ default: module.PulseDashboardPage })));
const PulseAllCasesPage = lazy(() => import('../../pages/PulseAllCasesPage').then(module => ({ default: module.PulseAllCasesPage })));
const PulseNewCasePage = lazy(() => import('../../pages/PulseNewCasePage').then(module => ({ default: module.PulseNewCasePage })));
const PulseSettingsPage = lazy(() => import('../../pages/PulseSettingsPage').then(module => ({ default: module.PulseSettingsPage })));
const EmailProcessingPage = lazy(() => import('../../components/pulse/EmailProcessingDashboard').then(module => ({ default: module.EmailProcessingDashboard })));

export const caseManagementRoutes: ModuleRoute[] = [
  {
    path: '/pulse',
    component: PulseDashboardPage,
    protected: true,
    roles: ['super_admin', 'company_admin', 'case_manager']
  },
  {
    path: '/pulse/dashboard',
    component: PulseDashboardPage,
    protected: true,
    roles: ['super_admin', 'company_admin', 'case_manager']
  },
  {
    path: '/pulse/cases',
    component: PulseAllCasesPage,
    protected: true,
    roles: ['super_admin', 'company_admin', 'case_manager']
  },
  {
    path: '/pulse/new',
    component: PulseNewCasePage,
    protected: true,
    roles: ['super_admin', 'company_admin', 'case_manager']
  },
  {
    path: '/pulse/settings',
    component: PulseSettingsPage,
    protected: true,
    roles: ['super_admin', 'company_admin', 'case_manager']
  },
  {
    path: '/pulse/email-processing',
    component: EmailProcessingPage,
    protected: true,
    roles: ['super_admin', 'company_admin', 'case_manager']
  }
];