import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { TimeProtectedRoute } from '@/components/TimeProtectedRoute';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Loader2 } from 'lucide-react';
import DomainRouter from '@/components/DomainRouter';

// Public components - lazy loaded
const Auth = lazy(() => import('@/pages/Auth'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TimeAuth = lazy(() => import('@/pages/TimeAuth').then(m => ({ default: m.TimeAuth })));
const TimeAttendance = lazy(() => import('@/pages/TimeAttendance').then(m => ({ default: m.TimeAttendance })));
const Resources = lazy(() => import('@/pages/Resources'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const HRBlueprint = lazy(() => import('@/pages/HRBlueprint'));
const ExcelParser = lazy(() => import('@/components/ExcelParser'));
const Blog = lazy(() => import('@/domains/content/pages/Blog'));
const SystemArchitecture = lazy(() => import('@/pages/SystemArchitecture'));
const Integrations = lazy(() => import('@/pages/Integrations'));
const CRM = lazy(() => import('@/modules/HaaLO.CRM/components/CRMDemo').then(m => ({ default: m.CRMDemo })));
const Analytics = lazy(() => import('@/domains/analytics/pages/Analytics'));
const Security = lazy(() => import('@/domains/security/pages/Security'));
const SSO = lazy(() => import('@/pages/SSO'));
const Compliance = lazy(() => import('@/domains/compliance/pages/Compliance'));
const RowLevelSecurity = lazy(() => import('@/domains/security/pages/RowLevelSecurity'));
const Assessment = lazy(() => import('@/domains/assessments/pages/Assessment'));
const Results = lazy(() => import('@/pages/Results'));
const EaseworksLanding = lazy(() => import('@/pages/EaseworksLanding').then(m => ({ default: m.EaseworksLanding })));
const HaaLOLanding = lazy(() => import('@/pages/HaaLOLanding'));
const AccelerateGrowth = lazy(() => import('@/pages/AccelerateGrowth'));
const HRSolutionsAssessment = lazy(() => import('@/pages/HRSolutionsAssessment'));

const ThankYouPage = lazy(() => import('@/pages/ThankYouPage').then(m => ({ default: m.ThankYouPage })));
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })));
// ClientAdminDashboard removed from system
const PEOLanding = lazy(() => import('@/pages/PEOLanding').then(m => ({ default: m.PEOLanding })));
const SharedStaffingArchitecture = lazy(() => import('@/pages/SharedStaffingArchitecture'));
const TimeAttendanceSettings = lazy(() => import('@/pages/TimeAttendanceSettings').then(m => ({ default: m.TimeAttendanceSettings })));
const LMSReportsPage = lazy(() => import('@/pages/LMSReportsPage').then(m => ({ default: m.LMSReportsPage })));
const PlanStartedPage = lazy(() => import('@/pages/PlanStartedPage').then(m => ({ default: m.PlanStartedPage })));

const EaseLearnStudio = lazy(() => import('@/pages/EaseLearnStudio'));
const ExplainerVideos = lazy(() => import('@/pages/ExplainerVideos'));
const WorkplaceViolenceTraining = lazy(() => import('@/pages/WorkplaceViolenceTraining'));

// Employee Portal components
const EmployeePaystubs = lazy(() => import('@/components/employee/EmployeePaystubs').then(m => ({ default: m.EmployeePaystubs })));
const EmployeePTO = lazy(() => import('@/components/employee/EmployeePTO').then(m => ({ default: m.EmployeePTO })));
const EmployeeTraining = lazy(() => import('@/components/employee/EmployeeTraining').then(m => ({ default: m.EmployeeTraining })));
const EmployeeSupport = lazy(() => import('@/components/employee/EmployeeSupport').then(m => ({ default: m.EmployeeSupport })));
const EmployeeDocuments = lazy(() => import('@/components/employee/EmployeeDocuments').then(m => ({ default: m.EmployeeDocuments })));

// Time Track Registration components
const EmployeeRegistration = lazy(() => import('@/modules/HaaLO.TimeTrack/components/EmployeeRegistration').then(m => ({ default: m.EmployeeRegistration })));
const RegistrationSuccess = lazy(() => import('@/modules/HaaLO.TimeTrack/components/RegistrationSuccess').then(m => ({ default: m.RegistrationSuccess })));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const PublicRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Root route - domain-aware routing */}
        <Route path="/" element={<DomainRouter />} />
        
        {/* Workplace Violence Training page */}
        <Route path="/workplace-violence-training" element={<WorkplaceViolenceTraining />} />
        
        {/* Public shared routes */}
        <Route path="shared/staffing-architecture/:token" element={<SharedStaffingArchitecture />} />
        
        {/* Employee Portal Routes */}
        <Route path="employee/paystubs" element={<EmployeePaystubs />} />
        <Route path="employee/pto" element={<EmployeePTO />} />
        <Route path="employee/training" element={<EmployeeTraining />} />
        <Route path="employee/support" element={<EmployeeSupport />} />
        <Route path="employee/documents" element={<EmployeeDocuments />} />
        <Route path="employee/handbook" element={<EmployeeDocuments />} />
        <Route path="employee/contact-hr" element={<EmployeeSupport />} />
        
        {/* Time Track Registration Routes */}
        <Route path="register/:token" element={<EmployeeRegistration />} />
        <Route path="register/success" element={<RegistrationSuccess />} />
        
        {/* Marketing pages */}
        <Route path="marketing/landing-pages/easeworks" element={<EaseworksLanding />} />
        <Route path="waste-management-landing" element={<EaseworksLanding />} />
        <Route path="accelerate-growth" element={<AccelerateGrowth />} />
        <Route path="hr-solutions-assessment" element={<HRSolutionsAssessment />} />
        
        {/* Home page */}
        <Route path="home" element={<Home />} />
        
        {/* Easeworks main page */}
        <Route path="easeworks" element={<EaseworksLanding />} />
        
        {/* Auth pages */}
        <Route path="thank-you" element={<ThankYouPage />} />
        <Route path="plan-started" element={<PlanStartedPage />} />
        
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="time-auth-alt" element={<TimeAuth />} />
        
        {/* Client dashboard removed from system */}
        
        {/* PEO */}
        <Route path="peo" element={<PEOLanding />} />
        
        {/* Legal pages */}
        <Route path="terms-of-service" element={<TermsOfService />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        
        {/* Time tracking */}
        <Route path="time-auth" element={<TimeAuth />} />
        <Route path="time-attendance" element={
          <TimeProtectedRoute>
            <TimeAttendance />
          </TimeProtectedRoute>
        } />
        <Route path="time-attendance-settings" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin'] as any}>
            <TimeAttendanceSettings />
          </ProtectedRoute>
        } />
        
        {/* Public content */}
        <Route path="pricing" element={<Pricing />} />
        <Route path="hr-blueprint" element={<HRBlueprint />} />
        <Route path="excel-parser" element={<ExcelParser />} />
        <Route path="resources" element={<Resources />} />
        <Route path="blog" element={<Blog />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="system-architecture" element={<SystemArchitecture />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="crm" element={<CRM />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="security" element={<Security />} />
        <Route path="sso" element={<SSO />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="row-level-security" element={<RowLevelSecurity />} />
        <Route path="assessment" element={<Assessment />} />
        <Route path="results" element={<Results />} />
        <Route path="lms-reports" element={<LMSReportsPage />} />
        <Route path="studio" element={<EaseLearnStudio />} />
        <Route path="easlearn-studio" element={<EaseLearnStudio />} />
        <Route path="explainer-videos" element={<ExplainerVideos />} />
        
        {/* HaaLO Landing Page Preview */}
        <Route path="haalo-landing" element={<HaaLOLanding />} />
      </Routes>
    </Suspense>
  );
};