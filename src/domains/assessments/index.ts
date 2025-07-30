// Assessments Domain - Main export
export { AssessmentsRouter } from './router';

// Component exports
export { AdminAssessments } from './components/AdminAssessments';
export { AssessmentForm } from './components/AssessmentForm';
export { AssessmentDashboard } from './components/AssessmentDashboard';
export { default as AssessmentReports } from './components/AssessmentReports';
export { default as AssessmentAnalytics } from './components/AssessmentAnalytics';
export { AssessmentNotifications } from './components/AssessmentNotifications';

// Page exports
export { default as Assessment } from './pages/Assessment';
export { default as AssessmentResults } from './pages/AssessmentResults';

// Hook exports
export * from './hooks';

// Type exports
export * from './types';