import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy load Content components for code splitting
const BlogDashboard = lazy(() => import('./components/BlogDashboard').then(m => ({ default: m.BlogDashboard })));
const BlogManager = lazy(() => import('./components/BlogManager').then(m => ({ default: m.BlogManager })));
const BlogEditor = lazy(() => import('./components/BlogEditor').then(m => ({ default: m.BlogEditor })));
const Blog = lazy(() => import('./pages/Blog'));

// Loading component for suspense
const ContentLoading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const ContentRouter = () => {
  return (
    <Suspense fallback={<ContentLoading />}>
      <Routes>
        <Route path="/" element={<Blog />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <BlogDashboard />
          </ProtectedRoute>
        } />
        <Route path="/manage" element={
          <ProtectedRoute>
            <BlogManager />
          </ProtectedRoute>
        } />
        <Route path="/editor" element={
          <ProtectedRoute>
            <BlogEditor onSave={() => {}} onCancel={() => {}} />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
};