// Halo.BenefitsIQ Module
// Intelligent benefits benchmarking, cost modeling, and decision support

import React from 'react';
import { RegisterModule } from '../core/ModuleLoader';

const BenefitsIQComponent = React.lazy(() => import('./components/BenefitsIQDashboard').then(m => ({ 
  default: m.BenefitsIQDashboard
})));

// This module structure is for the new comprehensive implementation
// It's registered separately from the main HaaLO module system

// Export main components
export { BenefitsIQDashboard } from './components/BenefitsIQDashboard';
export { BenchmarkReport } from './components/BenchmarkReport';
export { CostModeler } from './components/CostModeler';

// Export hooks and services
export * from './hooks/useBenefitsIQ';
export * from './services/api';
export * from './types';

// Export routes
export { ClientBenefitsIQRoutes, GlobalBenefitsIQRoutes } from './routes';

export default {
  name: 'Halo.BenefitsIQ',
  version: '1.0.0',
  description: 'Intelligent benefits benchmarking and cost modeling module'
};