import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load Analytics components
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const AnalyticsReports = lazy(() => import('./components/AnalyticsReports').then(m => ({ default: m.AnalyticsReports })));
const AnalyticsMetrics = lazy(() => import('./components/AnalyticsMetrics').then(m => ({ default: m.AnalyticsMetrics })));
const AnalyticsAlerts = lazy(() => import('./components/AnalyticsAlerts').then(m => ({ default: m.AnalyticsAlerts })));
const KPIManager = lazy(() => import('./components/KPIManager').then(m => ({ default: m.KPIManager })));
const TrainingAnalytics = lazy(() => import('./components/TrainingAnalytics').then(m => ({ default: m.TrainingAnalytics })));

// Reports IQ Analytics Components
const BusinessIntelligence = lazy(() => import('./components/BusinessIntelligence'));
const PredictiveAnalytics = lazy(() => import('./components/PredictiveAnalytics'));
const RealtimeDashboard = lazy(() => import('./components/RealtimeDashboard'));
const CustomReports = lazy(() => import('./components/CustomReports'));

const AnalyticsRouter = () => {
  return (
    <Routes>
      <Route index element={<AnalyticsDashboard />} />
      <Route path="training" element={<TrainingAnalytics />} />
      <Route path="reports" element={<AnalyticsReports />} />
      <Route path="metrics" element={<AnalyticsMetrics />} />
      <Route path="alerts" element={<AnalyticsAlerts />} />
      <Route path="kpis" element={<KPIManager />} />
      
      {/* Reports IQ Routes */}
      <Route path="bi" element={<BusinessIntelligence />} />
      <Route path="predictive" element={<PredictiveAnalytics />} />
      <Route path="realtime" element={<RealtimeDashboard />} />
      <Route path="custom" element={<CustomReports />} />
    </Routes>
  );
};

export default AnalyticsRouter;