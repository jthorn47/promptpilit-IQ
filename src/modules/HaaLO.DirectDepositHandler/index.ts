/**
 * HaaLO Direct Deposit Handler Module
 * 
 * @module HaaLO.DirectDepositHandler
 * @version 1.0.0
 * @description Isolated microservice for generating NACHA-compliant ACH files and transmitting to banks
 * @scope Tenant-scoped
 * @permissions ['admin', 'payroll_admin', 'finance']
 */

import { lazy } from 'react';
import { RegisterModule, moduleRegistry } from '../core/ModuleLoader';
import type { HaaLOModule } from '../core/ModuleLoader';

// Lazy load components
const ACHDashboard = lazy(() => import('./components/ACHDashboard'));
const ACHSettings = lazy(() => import('./components/ACHSettings'));
const ACHFileViewer = lazy(() => import('./components/ACHFileViewer'));
const BankingProfileManager = lazy(() => import('./components/BankingProfileManager'));

export const HaaLODirectDepositHandlerModule: HaaLOModule = RegisterModule({
  metadata: {
    id: 'haalo-direct-deposit-handler',
    name: 'Direct Deposit & ACH Handler',
    description: 'Generate NACHA-compliant ACH files and transmit to banks for direct deposit processing',
    version: '1.0.0',
    icon: 'CreditCard',
    category: 'hr',
    isPremium: false,
    isBeta: false,
    isComingSoon: false,
    requiredSetup: true,
    status: 'active',
    statusColor: '#10B981',
    dependencies: ['haalo-payroll-batch-processor']
  },

  routes: [
    {
      path: '/admin/payroll/ach',
      component: ACHDashboard,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/payroll/ach/settings',
      component: ACHSettings,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/payroll/ach/files/:fileId',
      component: ACHFileViewer,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    },
    {
      path: '/admin/payroll/ach/banking',
      component: BankingProfileManager,
      exact: true,
      protected: true,
      roles: ['super_admin', 'company_admin']
    }
  ],

  menu: [
    {
      id: 'direct-deposit-handler',
      label: 'ACH Files',
      icon: 'CreditCard',
      path: '/admin/payroll/ach',
      requiredRoles: ['super_admin', 'company_admin'],
      permissions: ['admin', 'payroll_admin', 'finance']
    }
  ],

  configuration: {
    tenantScoped: true,
    healthCheckEndpoint: '/ach/health',
    features: {
      nachaFileGeneration: true,
      sftpTransmission: true,
      apiTransmission: true,
      routingValidation: true,
      transmissionRetry: true,
      auditLogging: true,
      testMode: true
    },
    transmission: {
      maxRetryAttempts: 3,
      retryDelayMinutes: 15,
      defaultCutoffTime: '15:00:00',
      supportedMethods: ['sftp', 'api', 'manual']
    },
    validation: {
      routingNumberValidation: true,
      accountNumberValidation: true,
      amountLimits: {
        maxPerTransaction: 1000000, // $1M
        maxPerFile: 10000000 // $10M
      }
    },
    notifications: {
      emailOnTransmissionSuccess: true,
      emailOnTransmissionFailure: true,
      emailOnFileGeneration: false
    }
  },

  initialize: async (config) => {
    console.log('💳 Initializing HaaLO Direct Deposit Handler Module...');
    
    // Validate dependencies
    const requiredModules = ['haalo-payroll-batch-processor'];
    const missingModules = requiredModules.filter(moduleId => !moduleRegistry.getModule(moduleId));
    
    if (missingModules.length > 0) {
      console.warn(`⚠️ Direct Deposit Handler missing dependencies: ${missingModules.join(', ')}`);
    }

    // Initialize health check
    try {
      const healthCheck = await fetch('/ach/health');
      if (healthCheck.ok) {
        console.log('✅ Direct Deposit Handler health check passed');
      }
    } catch (error) {
      console.warn('⚠️ Direct Deposit Handler health check failed:', error);
    }

    // Initialize transmission queue monitoring if configured
    if (config?.enableTransmissionMonitoring) {
      console.log('📡 Transmission monitoring enabled');
    }

    console.log('✅ HaaLO Direct Deposit Handler Module initialized successfully');
  },

  destroy: async () => {
    console.log('🗑️ Destroying HaaLO Direct Deposit Handler Module...');
    // Cleanup any active transmissions
    // Cancel any pending retry jobs
  }
});

// Export types and services for external use
export * from './types';
export * from './services/ACHService';
export * from './services/BankingService';
export * from './hooks/useACHFiles';
export * from './hooks/useBankingProfiles';