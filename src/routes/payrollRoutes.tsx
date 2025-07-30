
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Payroll components - lazy loaded
const PayrollManager = lazy(() => import('@/domains/payroll/pages/PayrollManager'));
const PayrollDashboard = lazy(() => import('@/domains/payroll/components/PayrollDashboard').then(m => ({ default: m.PayrollDashboard })));
const F45PayrollDashboard = lazy(() => import('@/domains/payroll/components/F45PayrollDashboard').then(m => ({ default: m.F45PayrollDashboard })));
const ClientPayrollProcessingPage = lazy(() => import('@/modules/payroll/pages/ClientPayrollProcessingPage').then(m => ({ default: m.ClientPayrollProcessingPage })));
const PayrollEmployeeManager = lazy(() => import('@/components/payroll/PayrollEmployeeManager').then(m => ({ default: m.PayrollEmployeeManager })));
const GlobalJobTitles = lazy(() => import('@/modules/jobtitles').then(m => ({ default: m.GlobalJobTitles })));

const PayTypesManager = lazy(() => import('@/domains/payroll/components/PayTypesManager').then(m => ({ default: m.PayTypesManager })));
const ACHProcessingPage = lazy(() => import('@/pages/ACHProcessingPage').then(m => ({ default: m.ACHProcessingPage })));
const PayrollReportsPage = lazy(() => import('@/pages/PayrollReportsPage').then(m => ({ default: m.PayrollReportsPage })));
const SuperAdminBenefitsDashboard = lazy(() => import('@/pages/SuperAdminBenefitsDashboard').then(m => ({ default: m.SuperAdminBenefitsDashboard })));
const SuperAdminPayrollProcessing = lazy(() => import('@/pages/SuperAdminPayrollProcessing').then(m => ({ default: m.SuperAdminPayrollProcessing })));
const PayrollBenefitsPage = lazy(() => import('@/pages/payroll/PayrollBenefitsPage').then(m => ({ default: m.PayrollBenefitsPage })));
const PayrollBasicSettingsPage = lazy(() => import('@/pages/payroll/PayrollBasicSettingsPage').then(m => ({ default: m.PayrollBasicSettingsPage })));
const PayrollTaxConfigPage = lazy(() => import('@/pages/payroll/PayrollTaxConfigPage').then(m => ({ default: m.PayrollTaxConfigPage })));
const PayrollEarningsDeductionsPage = lazy(() => import('@/pages/payroll/PayrollEarningsDeductionsPage').then(m => ({ default: m.PayrollEarningsDeductionsPage })));
const PayrollWorkersCompPage = lazy(() => import('@/pages/payroll/PayrollWorkersCompPage').then(m => ({ default: m.PayrollWorkersCompPage })));
const PayrollPoliciesPage = lazy(() => import('@/pages/payroll/PayrollPoliciesPage').then(m => ({ default: m.PayrollPoliciesPage })));
const PayrollContactInfoPage = lazy(() => import('@/pages/payroll/PayrollContactInfoPage').then(m => ({ default: m.PayrollContactInfoPage })));

// Phase 2 Enhancement Pages - lazy loaded
const PayrollAssistantPage = lazy(() => import('@/pages/payroll/PayrollAssistantPage'));
const PayrollAssistantDemo = lazy(() => import('@/pages/payroll/PayrollAssistantDemo'));
const RetroPayPage = lazy(() => import('@/pages/payroll/RetroPayPage'));
const PayCalendarPage = lazy(() => import('@/pages/payroll/PayCalendarPage'));
const AuditTrailPage = lazy(() => import('@/pages/payroll/AuditTrailPage'));
const MultiStateTaxPage = lazy(() => import('@/pages/payroll/MultiStateTaxPage'));

// Demo Showcase Page
const DemoShowcase = lazy(() => import('@/pages/DemoShowcase'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const PayrollRoutes = () => {
  console.log('🔍 PayrollRoutes component is rendering...');
  return (
    <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<PayrollManager />} />
          <Route path="dashboard" element={<PayrollDashboard />} />
          <Route path="f45-dashboard" element={<F45PayrollDashboard />} />
          <Route path="processing" element={<ClientPayrollProcessingPage />} />
          <Route path="employees" element={<PayrollEmployeeManager companyId="bc172f1c-e102-4a76-945a-c1de29e9f34c" />} />
          <Route path="pay-types" element={<PayTypesManager companyId="bc172f1c-e102-4a76-945a-c1de29e9f34c" />} />
          <Route path="job-titles" element={
            <div className="container mx-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Global Job Titles Library</h1>
                  <p className="text-muted-foreground">Manage job titles for payroll processing and workers' compensation classification</p>
                </div>
              </div>
              <GlobalJobTitles />
            </div>
          } />
          <Route path="ach" element={<ACHProcessingPage />} />
          <Route path="reports" element={<PayrollReportsPage />} />
          
          <Route path="basic-settings" element={<PayrollBasicSettingsPage />} />
          <Route path="tax-config" element={<PayrollTaxConfigPage />} />
          <Route path="earnings-deductions" element={<PayrollEarningsDeductionsPage />} />
          <Route path="workers-comp" element={<PayrollWorkersCompPage />} />
          <Route path="policies" element={<PayrollPoliciesPage />} />
          <Route path="contact-info" element={<PayrollContactInfoPage />} />
          
          {/* Demo Showcase Route */}
          <Route path="demo-showcase" element={<DemoShowcase />} />
          
          {/* Phase 2 Enhancement Routes */}
          <Route path="assistant" element={<PayrollAssistantPage />} />
          <Route path="assistant-demo" element={<PayrollAssistantDemo />} />
          <Route path="retro-pay" element={<RetroPayPage />} />
          <Route path="off-cycle" element={
            <ProtectedRoute requiredRole="super_admin">
              <RetroPayPage />
            </ProtectedRoute>
          } />
          <Route path="calendar" element={<PayCalendarPage />} />
          <Route path="audit-trail" element={<AuditTrailPage />} />
          <Route path="multi-state-tax" element={<MultiStateTaxPage />} />
          <Route path="tax-engine" element={
            <ProtectedRoute requiredRole="super_admin">
              <MultiStateTaxPage />
            </ProtectedRoute>
          } />
          
          {/* Super admin routes */}
          <Route path="super-admin-benefits" element={
            <ProtectedRoute requiredRole="super_admin">
              <SuperAdminBenefitsDashboard />
            </ProtectedRoute>
          } />
          <Route path="super-admin-processing" element={
            <ProtectedRoute requiredRole="super_admin">
              <SuperAdminPayrollProcessing />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
  );
};
