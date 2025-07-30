import { lazy } from 'react';
import { createLazyComponent, ROUTE_CHUNKS } from '@/utils/performance';

// Enhanced lazy loading with chunk names for better code splitting
// Dashboard components removed from system

// Analytics Dashboard removed from system

// Advanced Analytics Dashboard removed from system

export const LazyCompaniesPage = createLazyComponent(
  () => import('@/pages/admin/CompaniesPage'),
  'CompaniesPage'
);

export const LazyUsersAdmin = createLazyComponent(
  () => import('@/components/AdminUsers').then(m => ({ default: m.AdminUsers })),
  'AdminUsers'
);

export const LazySettingsAdmin = createLazyComponent(
  () => import('@/components/AdminSettings').then(m => ({ default: m.AdminSettings })),
  'AdminSettings'
);

export const LazyLMSReports = createLazyComponent(
  () => import('@/components/AdminLMSReports').then(m => ({ default: m.AdminLMSReports })),
  'AdminLMSReports'
);

export const LazyTrainingModules = createLazyComponent(
  () => import('@/components/AdminTrainingModules').then(m => ({ default: m.AdminTrainingModules })),
  'AdminTrainingModules'
);

export const LazyCertificates = createLazyComponent(
  () => import('@/components/AdminCertificates').then(m => ({ default: m.AdminCertificates })),
  'AdminCertificates'
);

export const LazyIntegrationHub = createLazyComponent(
  () => import('@/components/AdvancedIntegrationHub').then(m => ({ default: m.AdvancedIntegrationHub })),
  'AdvancedIntegrationHub'
);

export const LazySecurityAudit = createLazyComponent(
  () => import('@/components/SecurityAuditPanel').then(m => ({ default: m.SecurityAuditPanel })),
  'SecurityAuditPanel'
);

export const LazyEmailManagement = createLazyComponent(
  () => import('@/components/email/EmailManagement'),
  'EmailManagement'
);

// CRM Components
export const LazyCRMDashboard = createLazyComponent(
  () => import('@/components/CRMCommandCenter').then(m => ({ default: m.CRMCommandCenter })),
  'CRMCommandCenter'
);

// Mobile-optimized components
export const LazyMobileChart = createLazyComponent(
  () => import('@/components/charts/MobileOptimizedChart'),
  'MobileOptimizedChart'
);

export const LazyMobileTable = createLazyComponent(
  () => import('@/components/tables/MobileOptimizedTable'),
  'MobileOptimizedTable'
);