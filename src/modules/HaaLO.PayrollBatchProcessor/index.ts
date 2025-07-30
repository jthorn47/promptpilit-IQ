/**
 * HaaLO Payroll Batch Processor Module
 * 
 * @module HaaLO.PayrollBatchProcessor
 * @version 1.0.0
 * @description Isolated microservice for processing multiple payroll runs in secure batches
 * @scope Tenant-scoped
 * @permissions ['admin', 'payroll_admin']
 */

import { lazy } from 'react';
import { RegisterModule } from '../core/ModuleLoader';
import type { HaaLOModule } from '../core/ModuleLoader';

// Lazy load components
const BatchDashboard = lazy(() => import('./components/BatchDashboard'));
const BatchCreator = lazy(() => import('./components/BatchCreator'));
const BatchViewer = lazy(() => import('./components/BatchViewer'));
const BatchMonitor = lazy(() => import('./components/BatchMonitor'));

export const HaaLOPayrollBatchProcessorModule: HaaLOModule = RegisterModule({
  metadata: {
    id: 'haalo-payroll-batch-processor',
    name: 'Payroll Batch Processor',
    description: 'Secure processing and submission of multiple payroll runs in batches with automated calculations',
    version: '1.0.0',
    icon: 'Package',
    category: 'hr',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: false,
    status: 'active',
    statusColor: '#10B981',
    dependencies: ['haalo-payroll-engine', 'haalo-tax-engine', 'haalo-paystub-generator']
  },

  routes: [
    {
      path: '/admin/payroll/batches',
      component: BatchDashboard,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/payroll/batches/create',
      component: BatchCreator,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/payroll/batches/:batchId',
      component: BatchViewer,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/payroll/batches/monitor/:batchId',
      component: BatchMonitor,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],

  menu: [
    {
      id: 'payroll-batch-processor',
      label: 'Payroll Batches',
      icon: 'Package',
      path: '/admin/payroll/batches',
      requiredRoles: ['super_admin', 'company_admin'],
      permissions: ['admin', 'payroll_admin']
    }
  ],

  configuration: {
    tenantScoped: true,
    healthCheckEndpoint: '/batches/health',
    features: {
      multiGroupSupport: true,
      asyncProcessing: true,
      errorRecovery: true,
      auditLogging: true,
      batchRollback: true,
      retryFailedEmployees: true
    },
    processing: {
      maxBatchSize: 10000,
      maxRetryAttempts: 3,
      batchTimeout: 3600, // 1 hour
      chunkSize: 100 // Process employees in chunks
    },
    notifications: {
      emailOnCompletion: true,
      emailOnFailure: true,
      slackIntegration: false
    }
  },

  initialize: async (config) => {
    console.log('📦 Initializing HaaLO Payroll Batch Processor Module...');
    
    // Validate dependencies
    const requiredModules = ['haalo-payroll-engine', 'haalo-tax-engine', 'haalo-paystub-generator'];
    const missingModules = requiredModules.filter(moduleId => !(globalThis as any).moduleRegistry?.getModule(moduleId));
    
    if (missingModules.length > 0) {
      console.warn(`⚠️ Payroll Batch Processor missing dependencies: ${missingModules.join(', ')}`);
    }

    // Initialize health check
    try {
      const healthCheck = await fetch('/batches/health');
      if (healthCheck.ok) {
        console.log('✅ Payroll Batch Processor health check passed');
      }
    } catch (error) {
      console.warn('⚠️ Payroll Batch Processor health check failed:', error);
    }

    // Initialize background queue monitoring if configured
    if (config?.enableQueueMonitoring) {
      console.log('🔄 Queue monitoring enabled');
    }

    console.log('✅ HaaLO Payroll Batch Processor Module initialized successfully');
  },

  destroy: async () => {
    console.log('🗑️ Destroying HaaLO Payroll Batch Processor Module...');
    // Cleanup any running batch processes
    // Cancel any pending queue jobs
  }
});

// Export types and services for external use
export * from './types';
export * from './services/BatchService';
export * from './hooks/useBatches';