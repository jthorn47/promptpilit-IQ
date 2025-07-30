import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy load Security components for code splitting
const SecurityDashboard = lazy(() => import('./components/SecurityDashboard').then(m => ({ default: m.SecurityDashboard })));
const SecurityAudit = lazy(() => import('./components/SecurityAudit').then(m => ({ default: m.SecurityAudit })));
const SecurityReports = lazy(() => import('./components/SecurityReports').then(m => ({ default: m.SecurityReports })));
const SecuritySettings = lazy(() => import('./components/SecuritySettings').then(m => ({ default: m.SecuritySettings })));
const Security = lazy(() => import('./pages/Security'));
const RowLevelSecurity = lazy(() => import('./pages/RowLevelSecurity'));

// Loading component for suspense
const SecurityLoading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const SecurityRouter = () => {
  return (
    <Suspense fallback={<SecurityLoading />}>
      <Routes>
        <Route path="/" element={<Security />} />
        <Route path="/row-level" element={<RowLevelSecurity />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SecurityDashboard />
          </ProtectedRoute>
        } />
        <Route path="/audit" element={
          <ProtectedRoute>
            <SecurityAudit />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <SecurityReports />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SecuritySettings />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
};