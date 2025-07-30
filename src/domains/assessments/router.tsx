import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy load assessment components for code splitting
const AssessmentDashboard = lazy(() => import('./components/AssessmentDashboard').then(m => ({ default: m.AssessmentDashboard })));
const AdminAssessments = lazy(() => import('./components/AdminAssessments').then(m => ({ default: m.AdminAssessments })));
const AssessmentForm = lazy(() => import('./components/AssessmentForm').then(m => ({ default: m.AssessmentForm })));
const AssessmentReports = lazy(() => import('./components/AssessmentReports'));
const AssessmentAnalytics = lazy(() => import('./components/AssessmentAnalytics'));
const Assessment = lazy(() => import('./pages/Assessment'));
const AssessmentResults = lazy(() => import('./pages/AssessmentResults'));

// Loading component for suspense
const AssessmentsLoading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const AssessmentsRouter = () => {
  return (
    <Suspense fallback={<AssessmentsLoading />}>
      <Routes>
        <Route path="/" element={<Assessment />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AssessmentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminAssessments />
          </ProtectedRoute>
        } />
        <Route path="/form" element={<AssessmentForm />} />
        <Route path="/results" element={
          <ProtectedRoute>
            <AssessmentResults />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <AssessmentReports />
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <AssessmentAnalytics />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
};