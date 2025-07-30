import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy load payroll components for code splitting
const PayrollDashboard = lazy(() => import('./components/PayrollDashboard').then(m => ({ default: m.PayrollDashboard })));
const ClientPayrollDashboard = lazy(() => import('../../components/payroll/ClientPayrollDashboard').then(m => ({ default: m.ClientPayrollDashboard })));


const PayTypesManager = lazy(() => import('./components/PayTypesManager').then(m => ({ default: m.PayTypesManager })));
const F45PayrollDashboard = lazy(() => import('./components/F45PayrollDashboard').then(m => ({ default: m.F45PayrollDashboard })));
const PayrollManager = lazy(() => import('./pages/PayrollManager'));
const PayrollEmployeeManager = lazy(() => import('../../components/payroll/PayrollEmployeeManager').then(m => ({ default: m.PayrollEmployeeManager })));

// Loading component for suspense
const PayrollLoading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const PayrollRouter = () => {
  return (
    <Suspense fallback={<PayrollLoading />}>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <PayrollDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PayrollDashboard />
          </ProtectedRoute>
        } />
        <Route path="/client-dashboard" element={
          <ProtectedRoute>
            <ClientPayrollDashboard />
          </ProtectedRoute>
        } />
        <Route path="/f45-dashboard" element={
          <ProtectedRoute>
            <F45PayrollDashboard />
          </ProtectedRoute>
        } />
        <Route path="/pay-types" element={
          <ProtectedRoute>
            <PayTypesManager companyId="demo-company" />
          </ProtectedRoute>
        } />
        <Route path="/manager" element={
          <ProtectedRoute>
            <PayrollManager />
          </ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute>
            <PayrollEmployeeManager companyId="demo-company" />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
};