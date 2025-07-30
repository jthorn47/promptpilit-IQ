/**
 * HaaLO Tax Filing & Compliance Engine Module
 * 
 * @module HaaLO.TaxFilingEngine
 * @version 1.0.0
 * @description Isolated microservice for tax filing, compliance, and agency notice management
 * @scope Tenant-scoped
 * @permissions ['admin', 'compliance_officer']
 */

import { lazy } from 'react';
import { RegisterModule } from '../core/ModuleLoader';
import type { HaaLOModule } from '../core/ModuleLoader';

// Lazy load components
const TaxDashboard = lazy(() => import('./components/TaxDashboard'));
const TaxSetup = lazy(() => import('./components/TaxSetup'));
const TaxCalendar = lazy(() => import('./components/TaxCalendar'));
const TaxFilings = lazy(() => import('./components/TaxFilings'));
const TaxPayments = lazy(() => import('./components/TaxPayments'));
const TaxNotices = lazy(() => import('./components/TaxNotices'));
const TaxArchive = lazy(() => import('./components/TaxArchive'));
const TaxReports = lazy(() => import('./components/TaxReports'));

export const HaaLOTaxFilingEngineModule: HaaLOModule = RegisterModule({
  metadata: {
    id: 'haalo-tax-filing-engine',
    name: 'Tax Filing & Compliance Engine',
    description: 'Comprehensive tax filing, compliance tracking, and agency notice management for federal, state, and local jurisdictions',
    version: '1.0.0',
    icon: 'Receipt',
    category: 'hr',
    isPremium: true,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    status: 'active',
    statusColor: '#10B981',
    dependencies: ['haalo-pay-calculation-engine', 'haalo-company-org-settings']
  },

  routes: [
    {
      path: '/admin/tax',
      component: TaxDashboard,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/tax/setup',
      component: TaxSetup,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/tax/calendar',
      component: TaxCalendar,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/tax/filings',
      component: TaxFilings,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/tax/payments',
      component: TaxPayments,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/tax/notices',
      component: TaxNotices,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/tax/archive',
      component: TaxArchive,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/tax/reports',
      component: TaxReports,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],

  menu: [
    {
      id: 'tax-filing-engine',
      label: 'Tax Filing',
      icon: 'Receipt',
      path: '/admin/tax',
      requiredRoles: ['super_admin', 'company_admin'],
      permissions: ['admin', 'compliance_officer']
    }
  ],

  configuration: {
    tenantScoped: true,
    healthCheckEndpoint: '/tax-filing/health',
    features: {
      federalFiling: true,
      stateFiling: true,
      localFiling: true,
      eFilingConnector: true,
      paymentScheduling: true,
      agencyNotices: true,
      complianceCalendar: true,
      documentArchive: true,
      auditTrail: true
    },
    filing: {
      supportedForms: ['941', '940', 'W2', 'W3', '1099', 'state_quarterly', 'suta'],
      supportedAgencies: ['IRS', 'state_dor', 'local_tax', 'unemployment'],
      autoCalculation: true,
      electronicFiling: true,
      paperFiling: false
    },
    compliance: {
      deadlineAlerts: true,
      reminderDaysBefore: [30, 14, 7, 1],
      overdueNotifications: true,
      complianceScoring: true
    },
    payments: {
      achPayments: true,
      wireTransfers: true,
      onlinePayments: true,
      paymentScheduling: true,
      confirmationTracking: true
    },
    notices: {
      documentUpload: true,
      statusTracking: true,
      responseDeadlines: true,
      escalationAlerts: true
    }
  },

  initialize: async (config) => {
    console.log('🧾 Initializing HaaLO Tax Filing Engine Module...');
    
    // Validate dependencies
    const requiredModules = ['haalo-pay-calculation-engine', 'haalo-company-org-settings'];
    const missingModules = requiredModules.filter(moduleId => !(globalThis as any).moduleRegistry?.getModule(moduleId));
    
    if (missingModules.length > 0) {
      console.warn(`⚠️ Tax Filing Engine missing dependencies: ${missingModules.join(', ')}`);
    }

    // Initialize health check
    try {
      const healthCheck = await fetch('/tax-filing/health');
      if (healthCheck.ok) {
        console.log('✅ Tax Filing Engine health check passed');
      }
    } catch (error) {
      console.warn('⚠️ Tax Filing Engine health check failed:', error);
    }

    // Initialize compliance calendar if configured
    if (config?.autoGenerateCalendar) {
      console.log('📅 Auto-generating tax calendar for current year');
    }

    // Initialize e-filing connector if configured
    if (config?.eFilingProvider) {
      console.log(`🔗 E-filing connector initialized: ${config.eFilingProvider}`);
    }

    console.log('✅ HaaLO Tax Filing Engine Module initialized successfully');
  },

  destroy: async () => {
    console.log('🗑️ Destroying HaaLO Tax Filing Engine Module...');
    // Cleanup any active filing processes
    // Cancel any scheduled reminders
    // Close e-filing connections
  }
});

// Export types and services for external use
export * from './types';
export * from './services/TaxProfileService';
export * from './services/TaxFilingService';
export * from './services/TaxPaymentService';
export * from './services/TaxNoticeService';
export * from './hooks/useTaxProfile';
export * from './hooks/useTaxFilings';
export * from './hooks/useTaxPayments';
export * from './hooks/useTaxNotices';