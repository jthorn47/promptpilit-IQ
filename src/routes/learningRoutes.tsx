
import { Routes, Route } from "react-router-dom";
import { lazy } from "react";

// New LMS domain components
const LearnerDashboard = lazy(() => 
  import("@/domains/lms/pages/LearnerDashboard").then(m => ({ default: m.LearnerDashboard }))
);
const TrainingModulesPage = lazy(() => 
  import("@/domains/lms/pages/TrainingModulesPage").then(m => ({ default: m.TrainingModulesPage }))
);
const TrainingAssignmentsPage = lazy(() => 
  import("@/domains/lms/pages/TrainingAssignmentsPage").then(m => ({ default: m.TrainingAssignmentsPage }))
);
const CertificatesPage = lazy(() => 
  import("@/domains/lms/pages/CertificatesPage").then(m => ({ default: m.CertificatesPage }))
);
const LMSReportsPage = lazy(() => 
  import("@/domains/lms/pages/LMSReportsPage").then(m => ({ default: m.LMSReportsPage }))
);
const ProgressTrackingPage = lazy(() => 
  import("@/domains/lms/pages/ProgressTrackingPage").then(m => ({ default: m.ProgressTrackingPage }))
);

// EaseLearn module pages
const MyLearningDashboard = lazy(() => 
  import("@/modules/EaseLearn.MyLearning/pages/MyLearningDashboard").then(m => ({ default: m.MyLearningDashboard }))
);
const MyCertificatesPortfolio = lazy(() => 
  import("@/modules/EaseLearn.MyCertificates/pages/MyCertificatesPortfolio").then(m => ({ default: m.MyCertificatesPortfolio }))
);

// Legacy components for backward compatibility
const CourseSelectionPage = lazy(() => 
  import("@/pages/CourseSelectionPage").then(m => ({ default: m.CourseSelectionPage }))
);
const TrainingFlow = lazy(() => import("@/pages/TrainingFlow"));
const SecureVideoPlayer = lazy(() => 
  import("@/pages/SecureVideoPlayer").then(m => ({ default: m.SecureVideoPlayer }))
);
const CertificateViewer = lazy(() => import("@/pages/CertificateViewer"));
const LearnerCertificates = lazy(() => 
  import("@/pages/LearnerCertificates").then(m => ({ default: m.LearnerCertificates }))
);

/**
 * Learning management system routes with new domain architecture
 */
export const LearningRoutes = () => (
  <Routes>
    {/* Main Learner Dashboard */}
    <Route index element={<LearnerDashboard />} />
    
    {/* Core Learning Routes */}
    <Route path="modules" element={<TrainingModulesPage />} />
    <Route path="my-courses" element={<MyLearningDashboard />} />
    <Route path="assignments" element={<TrainingAssignmentsPage />} />
    <Route path="my-certificates" element={<MyCertificatesPortfolio />} />
    <Route path="progress" element={<ProgressTrackingPage />} />
    
    {/* Admin/Reports Routes */}
    <Route path="certificates" element={<CertificatesPage />} />
    <Route path="reports" element={<LMSReportsPage />} />
    
    {/* Legacy Routes for Backward Compatibility */}
    <Route path="courses" element={<CourseSelectionPage />} />
    <Route path="training/*" element={<TrainingFlow />} />
    <Route path="video" element={<SecureVideoPlayer />} />
    <Route path="learner-certificates" element={<LearnerCertificates />} />
    <Route path="certificates/:certificateId" element={<CertificateViewer />} />
  </Routes>
);
