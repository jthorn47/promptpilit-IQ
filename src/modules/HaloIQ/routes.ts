import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

// Lazy load HALO IQ components - Updated for new structure
const VaultModule = lazy(() => import('../vault'));
const WorkflowAutomationPage = lazy(() => import('../../pages/halo-iq/WorkflowAutomationPage').then(m => ({ default: m.WorkflowAutomationPage })));
const TrainingIQPage = lazy(() => import('../../pages/halo-iq/TrainingIQPage').then(m => ({ default: m.TrainingIQPage })));
const TaxIQPage = lazy(() => import('../../pages/halo-iq/TaxIQPage').then(m => ({ default: m.TaxIQPage })));
const HROIQUPage = lazy(() => import('../../pages/halo-iq/HROIQUPage').then(m => ({ default: m.HROIQUPage })));
const ComplianceEnginePage = lazy(() => import('../../pages/halo-iq/ComplianceEnginePage').then(m => ({ default: m.ComplianceEnginePage })));
const AuditLogsPage = lazy(() => import('../../pages/halo-iq/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const AnalyticsForecastingPage = lazy(() => import('../../pages/halo-iq/AnalyticsForecastingPage').then(m => ({ default: m.AnalyticsForecastingPage })));
const IdentityPermissionsPage = lazy(() => import('../../pages/halo-iq/IdentityPermissionsPage').then(m => ({ default: m.IdentityPermissionsPage })));

const ConversationAnalyticsPage = lazy(() => import('../../pages/halo-iq/ConversationAnalyticsPage').then(m => ({ default: m.ConversationAnalyticsPage })));

export const haloIQRoutes: ModuleRoute[] = [
  {
    path: '/halo-iq/vault',
    component: VaultModule,
    exact: false,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    path: '/halo-iq/workflow-automation',
    component: WorkflowAutomationPage,
    exact: true,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    path: '/halo-iq/training-iq',
    component: TrainingIQPage,
    exact: true,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    path: '/halo-iq/tax',
    component: TaxIQPage,
    exact: true,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    path: '/halo-iq/hro-iq-u',
    component: HROIQUPage,
    exact: true,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    path: '/halo-iq/compliance-engine',
    component: ComplianceEnginePage,
    exact: true,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    path: '/halo-iq/audit-logs',
    component: AuditLogsPage,
    exact: true,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    path: '/halo-iq/analytics-forecasting',
    component: AnalyticsForecastingPage,
    exact: true,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    path: '/halo-iq/identity-permissions',
    component: IdentityPermissionsPage,
    exact: true,
    roles: ['super_admin', 'company_admin', 'client_admin']
  },
  {
    path: '/halo-iq/conversation-analytics',
    component: ConversationAnalyticsPage,
    exact: true,
    roles: ['super_admin', 'company_admin']
  }
];