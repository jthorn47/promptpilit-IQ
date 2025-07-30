/**
 * HaaLO Pay Stub Generator Module
 * 
 * @module HaaLO.PayStubGenerator
 * @version 1.0.0
 * @description Isolated microservice for generating employee pay stubs with PDF and web views
 * @scope Tenant-scoped
 * @permissions ['admin', 'payroll_view', 'employee_self_service']
 */

import { lazy } from 'react';
import { RegisterModule } from '../core/ModuleLoader';
import type { HaaLOModule } from '../core/ModuleLoader';

// Lazy load components
const AdminPayStubDashboard = lazy(() => import('./components/AdminPayStubDashboard'));
const EmployeePayStubPortal = lazy(() => import('./components/EmployeePayStubPortal'));
const PayStubViewer = lazy(() => import('./components/PayStubViewer'));
const PayStubGenerator = lazy(() => import('./components/PayStubGenerator'));

export const HaaLOPayStubGeneratorModule: HaaLOModule = RegisterModule({
  metadata: {
    id: 'haalo-paystub-generator',
    name: 'Pay Stub Generator',
    description: 'Generate compliant, readable, and downloadable employee pay stubs based on payroll run results',
    version: '1.0.0',
    icon: 'FileText',
    category: 'hr',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: '#10B981',
    dependencies: ['haalo-payroll-engine']
  },

  routes: [
    {
      path: '/admin/payroll/paystubs',
      component: AdminPayStubDashboard,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/payroll/paystubs/generate',
      component: PayStubGenerator,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/payroll/paystubs/:stubId',
      component: PayStubViewer,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/employee/paystubs',
      component: EmployeePayStubPortal,
      exact: true,
      protected: true,
      roles: ['learner', 'employee']
    },
    {
      path: '/employee/paystubs/:stubId',
      component: PayStubViewer,
      exact: true,
      protected: true,
      roles: ['learner', 'employee']
    }
  ],

  menu: [
    {
      id: 'paystub-generator-admin',
      label: 'Pay Stubs',
      icon: 'FileText',
      path: '/admin/payroll/paystubs',
      requiredRoles: ['super_admin', 'company_admin'],
      permissions: ['admin', 'payroll_view']
    },
    {
      id: 'paystub-generator-employee',
      label: 'My Pay Stubs',
      icon: 'FileText',
      path: '/employee/paystubs',
      requiredRoles: ['learner', 'employee'],
      permissions: ['employee_self_service']
    }
  ],

  configuration: {
    tenantScoped: true,
    healthCheckEndpoint: '/paystubs/health',
    features: {
      webView: true,
      pdfDownload: true,
      batchGeneration: true,
      auditLogging: true,
      employeeSelfService: true
    },
    pdfSettings: {
      format: 'A4',
      orientation: 'portrait',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    }
  },

  initialize: async (config) => {
    console.log('🧾 Initializing HaaLO Pay Stub Generator Module...');
    
    // Validate dependencies
    const payrollEngineModule = (globalThis as any).moduleRegistry?.getModule('haalo-payroll-engine');
    if (!payrollEngineModule) {
      console.warn('⚠️ Pay Stub Generator requires HaaLO Payroll Engine module');
    }

    // Initialize health check
    try {
      const healthCheck = await fetch('/paystubs/health');
      if (healthCheck.ok) {
        console.log('✅ Pay Stub Generator health check passed');
      }
    } catch (error) {
      console.warn('⚠️ Pay Stub Generator health check failed:', error);
    }

    console.log('✅ HaaLO Pay Stub Generator Module initialized successfully');
  },

  destroy: async () => {
    console.log('🗑️ Destroying HaaLO Pay Stub Generator Module...');
    // Cleanup logic if needed
  }
});

// Export types for external use
export * from './types';
export * from './services/PayStubService';
export * from './hooks/usePayStubs';