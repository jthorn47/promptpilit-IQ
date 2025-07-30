import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BenefitsIQDashboard } from './components/BenefitsIQDashboard';
import { BenchmarkReport } from './components/BenchmarkReport';
import { CostModeler } from './components/CostModeler';

// Client-level BenefitsIQ routes
export const ClientBenefitsIQRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<BenefitsIQDashboard />} />
      <Route path="/benchmark" element={<BenchmarkReport companyId="" />} />
      <Route path="/modeler" element={<CostModeler companyId="" />} />
      <Route path="/wizard" element={<div>Employee Wizard Component</div>} />
      <Route path="/reports" element={<div>Reports Component</div>} />
    </Routes>
  );
};

// Global admin BenefitsIQ routes
export const GlobalBenefitsIQRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<BenefitsIQDashboard isGlobalView={true} />} />
      <Route path="/benchmarks" element={<div>Global Benchmark Management</div>} />
      <Route path="/carriers" element={<div>Carrier Sync Management</div>} />
      <Route path="/config" element={<div>Global Configuration</div>} />
      <Route path="/analytics" element={<div>System Analytics</div>} />
    </Routes>
  );
};