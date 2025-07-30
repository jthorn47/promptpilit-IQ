import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

// Testing components - lazy loaded
const TestingUsers = lazy(() => import('@/pages/TestingUsers'));
const TestingAutoLogin = lazy(() => import('@/pages/TestingAutoLogin'));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const TestingRoutes = () => {
  return (
    <UnifiedLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route index element={<TestingUsers />} />
          <Route path="login/:role" element={<TestingAutoLogin />} />
        </Routes>
      </Suspense>
    </UnifiedLayout>
  );
};