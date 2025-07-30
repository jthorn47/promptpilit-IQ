import { lazy } from 'react';
import { ModuleRoute } from '@/modules/core/ModuleLoader';

// Lazy load Compliance components
const ComplianceDashboard = lazy(() => import('./components/ComplianceDashboard').then(m => ({ default: m.ComplianceDashboard })));
const ComplianceAudits = lazy(() => import('./components/ComplianceAudits').then(m => ({ default: m.ComplianceAudits })));
const CompliancePolicies = lazy(() => import('./components/CompliancePolicies').then(m => ({ default: m.CompliancePolicies })));
const ComplianceReports = lazy(() => import('./components/ComplianceReports').then(m => ({ default: m.ComplianceReports })));
const ComplianceConfig = lazy(() => import('./components/ComplianceConfig').then(m => ({ default: m.ComplianceConfig })));

export const complianceRoutes: ModuleRoute[] = [
  {
    path: '/admin/compliance',
    component: ComplianceDashboard,
    exact: true,
    roles: ['admin', 'super_admin', 'compliance_officer']
  },
  {
    path: '/admin/compliance/audits',
    component: ComplianceAudits,
    roles: ['admin', 'super_admin', 'compliance_officer']
  },
  {
    path: '/admin/compliance/policies',
    component: CompliancePolicies,
    roles: ['admin', 'super_admin', 'compliance_officer']
  },
  {
    path: '/admin/compliance/reports',
    component: ComplianceReports,
    roles: ['admin', 'super_admin', 'compliance_officer']
  },
  {
    path: '/admin/compliance/config',
    component: ComplianceConfig,
    roles: ['admin', 'super_admin']
  }
];