import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy load Compliance components for code splitting
const ComplianceDashboard = lazy(() => import('./components/ComplianceDashboard').then(m => ({ default: m.ComplianceDashboard })));
const ComplianceTracker = lazy(() => import('./components/ComplianceTracker').then(m => ({ default: m.ComplianceTracker })));
const ComplianceReports = lazy(() => import('./components/ComplianceReports').then(m => ({ default: m.ComplianceReports })));
const ComplianceFrameworks = lazy(() => import('./components/ComplianceFrameworks').then(m => ({ default: m.ComplianceFrameworks })));
const Compliance = lazy(() => import('./pages/Compliance'));

// Loading component for suspense
const ComplianceLoading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const ComplianceRouter = () => {
  return (
    <Suspense fallback={<ComplianceLoading />}>
      <Routes>
        <Route path="/" element={<Compliance />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ComplianceDashboard />
          </ProtectedRoute>
        } />
        <Route path="/tracker" element={
          <ProtectedRoute>
            <ComplianceTracker />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <ComplianceReports />
          </ProtectedRoute>
        } />
        <Route path="/frameworks" element={
          <ProtectedRoute>
            <ComplianceFrameworks />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
};