import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Loader2, Shield } from 'lucide-react';
import { SectionErrorBoundary } from '@/components/ErrorBoundary';
import { createLazyComponent } from '@/utils/performance';
import { CompactLoadingFallback } from '@/components/ui/LoadingFallback';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { DynamicModuleRoutes } from '@/modules/core/DynamicModuleRoutes';
import { WPVLearnerFlow } from '@/components/learner/WPVLearnerFlow';
import { CompanyWPVTrainingFlow } from '@/components/learner/CompanyWPVTrainingFlow';
// Removed ModularDashboard - using role-based launchpad system
// CRM routes now handled by module registry
import TrainingFlow from '@/pages/TrainingFlow';

// Admin components - optimized lazy loading with better error handling
const AdminDashboard = createLazyComponent(
  () => import('@/pages/AdminDashboard'),
  'AdminDashboard'
);
const AdminAssessments = createLazyComponent(
  () => import('@/domains/assessments/components/AdminAssessments').then(m => ({ default: m.AdminAssessments })),
  'AdminAssessments'
);
const AssessmentResults = createLazyComponent(
  () => import('@/domains/assessments/pages/AssessmentResults'),
  'AssessmentResults'
);
const AssessmentReports = createLazyComponent(
  () => import('@/domains/assessments/components/AssessmentReports'),
  'AssessmentReports'
);
const AssessmentAnalytics = createLazyComponent(
  () => import('@/domains/assessments/components/AssessmentAnalytics'),
  'AssessmentAnalytics'
);
const UnifiedUserManagement = createLazyComponent(
  () => import('@/components/admin/UnifiedUserManagement').then(m => ({ default: m.UnifiedUserManagement })),
  'UnifiedUserManagement'
);
const AdminSettings = createLazyComponent(
  () => import('@/components/AdminSettings').then(m => ({ default: m.AdminSettings })),
  'AdminSettings'
);
const SystemSettings = createLazyComponent(
  () => import('@/pages/admin/SystemSettings'),
  'SystemSettings'
);
// Removed SuperAdminDashboard - using clean dashboard approach
const EaseWorksStaffingArchitecture = createLazyComponent(
  () => import('@/pages/EaseWorksStaffingArchitecture'),
  'EaseWorksStaffingArchitecture'
);
const HaaLOSystemArchitecture = createLazyComponent(
  () => import('@/pages/admin/HaaLOSystemArchitecture'),
  'HaaLOSystemArchitecture'
);
const SuperAdminExecutiveDashboard = createLazyComponent(
  () => import('@/pages/admin/SuperAdminExecutiveDashboard'),
  'SuperAdminExecutiveDashboard'
);
const ClientAdminDashboard = createLazyComponent(
  () => import('@/pages/admin/ClientAdminDashboard'),
  'ClientAdminDashboard'
);
const AdminTrainingModules = createLazyComponent(
  () => import('@/components/AdminTrainingModules').then(m => ({ default: m.AdminTrainingModules })),
  'AdminTrainingModules'
);
const AdminLMSReports = createLazyComponent(
  () => import('@/components/AdminLMSReports').then(m => ({ default: m.AdminLMSReports })),
  'AdminLMSReports'
);
const AdminEmployees = createLazyComponent(
  () => import('@/components/AdminEmployees').then(m => ({ default: m.AdminEmployees })),
  'AdminEmployees'
);
const AdminCertificates = createLazyComponent(
  () => import('@/components/AdminCertificates').then(m => ({ default: m.AdminCertificates })),
  'AdminCertificates'
);
const KnowledgeBase = createLazyComponent(
  () => import('@/pages/KnowledgeBase'),
  'KnowledgeBase'
);
const CompaniesPage = createLazyComponent(
  () => import('@/domains/crm/components/CompaniesPage'),
  'CompaniesPage'
);
const CompanyDetailPageSimple = createLazyComponent(
  () => import('@/pages/admin/CompanyDetailPageSimple'),
  'CompanyDetailPageSimple'
);
const CompanyDetailPage = createLazyComponent(
  () => import('@/pages/admin/CompanyDetailPage'),
  'CompanyDetailPage'
);
// Removed UnifiedDashboard - using clean dashboard approach

// Additional missing components
const ClientSubmissionForm = createLazyComponent(
  () => import('@/pages/admin/staffing/ClientSubmissionForm').then(m => ({ default: m.ClientSubmissionForm })),
  'ClientSubmissionForm'
);
const PEOOnboardingManagement = createLazyComponent(
  () => import('@/pages/admin/peo/PEOOnboardingManagement').then(m => ({ default: m.PEOOnboardingManagement })),
  'PEOOnboardingManagement'
);
const PEOOnboardingWizard = createLazyComponent(
  () => import('@/pages/admin/peo/PEOOnboardingWizard').then(m => ({ default: m.PEOOnboardingWizard })),
  'PEOOnboardingWizard'
);
const PerformanceEvaluationDashboard = createLazyComponent(
  () => import('@/pages/PerformanceEvaluationDashboard'),
  'PerformanceEvaluationDashboard'
);
const ReviewCycleBuilder = createLazyComponent(
  () => import('@/components/performance/ReviewCycleBuilder').then(m => ({ default: m.ReviewCycleBuilder })),
  'ReviewCycleBuilder'
);
const F45PayrollDashboard = createLazyComponent(
  () => import('@/domains/payroll/components/F45PayrollDashboard').then(m => ({ default: m.F45PayrollDashboard })),
  'F45PayrollDashboard'
);
const Compliance = createLazyComponent(
  () => import('@/domains/compliance/pages/Compliance'),
  'Compliance'
);
const ModulesPage = lazy(() => import('@/pages/admin/ModulesPage'));
const PurchasesPage = lazy(() => import('@/pages/admin/PurchasesPage'));
const EmailManagement = lazy(() => import('@/components/email/EmailManagement'));
const AdvancedIntegrationHub = lazy(() => import('@/components/AdvancedIntegrationHub').then(m => ({ default: m.AdvancedIntegrationHub })));
const TwoFactorManagement = lazy(() => import('@/components/admin/TwoFactorManagement').then(m => ({ default: m.TwoFactorManagement })));
const IntegrationsPage = lazy(() => import('@/pages/admin/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));
const IntegrationTriggersManager = lazy(() => import('@/components/IntegrationTriggersManager').then(m => ({ default: m.IntegrationTriggersManager })));
const SecurityAuditPanel = lazy(() => import('@/components/SecurityAuditPanel').then(m => ({ default: m.SecurityAuditPanel })));
const SSOManagement = lazy(() => import('@/components/admin/SSOManagement').then(m => ({ default: m.SSOManagement })));
const CRMEmailPage = lazy(() => import('@/pages/admin/CRMEmailPage'));
const ClientOnboarding = lazy(() => import('@/pages/admin/ClientOnboarding'));
const ClientSettings = lazy(() => import('@/pages/admin/ClientSettings'));
const ClientSupport = lazy(() => import('@/pages/admin/ClientSupport'));
const AdminOnboarding = lazy(() => import('@/components/admin/AdminOnboarding'));
const PlaceholderPage = lazy(() => import('@/pages/admin/PlaceholderPage'));
const ClientsManagerPage = lazy(() => import('@/pages/ClientsManagerPage').then(m => ({ default: m.default })));
const AdminPricing = lazy(() => import('@/components/AdminPricing').then(m => ({ default: m.AdminPricing })));
const SBW9237ClientManagement = lazy(() => import('@/components/admin/sbw9237/SBW9237ClientManagement').then(m => ({ default: m.SBW9237ClientManagement })));
const ClientTrainingBuilder = lazy(() => import('@/components/client/ClientTrainingBuilder').then(m => ({ default: m.ClientTrainingBuilder })));

// Payroll Components
const PayrollManager = lazy(() => import('@/domains/payroll/pages/PayrollManager'));
const PayrollSettingsPage = lazy(() => import('@/pages/payroll/PayrollSettingsPage').then(m => ({ default: m.PayrollSettingsPage })));
const PayrollEarningsDeductionsPage = lazy(() => import('@/pages/payroll/PayrollEarningsDeductionsPage').then(m => ({ default: m.PayrollEarningsDeductionsPage })));
const PayrollBasicSettingsPage = lazy(() => import('@/pages/payroll/PayrollBasicSettingsPage').then(m => ({ default: m.PayrollBasicSettingsPage })));
const PayrollTaxConfigPage = lazy(() => import('@/pages/payroll/PayrollTaxConfigPage').then(m => ({ default: m.PayrollTaxConfigPage })));
const PayrollReportsPage = lazy(() => import('@/pages/PayrollReportsPage').then(m => ({ default: m.PayrollReportsPage })));
const ClientPayrollProcessingPage = lazy(() => import('@/modules/payroll/pages/ClientPayrollProcessingPage').then(m => ({ default: m.ClientPayrollProcessingPage })));

const BenefitsManagement = lazy(() => import('@/pages/SuperAdminBenefitsDashboard').then(m => ({ default: m.SuperAdminBenefitsDashboard })));

// HR Tools
const GlobalJobTitlesPage = lazy(() => import('@/pages/admin/hr-tools/GlobalJobTitlesPage'));
const GlobalJobDescriptionPage = lazy(() => import('@/pages/admin/hr-tools/GlobalJobDescriptionPage'));

// Organization Structure
const OrgStructurePage = lazy(() => import('@/modules/org-structure').then(m => ({ default: m.OrgStructurePage })));
const ClientOrgStructurePage = lazy(() => import('@/modules/org-structure').then(m => ({ default: m.ClientOrgStructurePage })));

// Earnings & Deductions
const GlobalPayTypesPage = lazy(() => import('@/modules/earnings-deductions').then(m => ({ default: m.GlobalPayTypesPage })));
const ClientPayTypesPage = lazy(() => import('@/modules/earnings-deductions').then(m => ({ default: m.ClientPayTypesPage })));

// Roles & Permissions
const RolesPermissions = lazy(() => import('@/pages/admin/RolesPermissions'));

// EaseLearn Command Center
const EaseLearnCommandCenter = lazy(() => import('@/pages/admin/easelearn/EaseLearnCommandCenter'));

// Analytics
const AnalyticsRouter = lazy(() => import('@/domains/analytics/router'));

// Case Management
const CasesPage = lazy(() => import('@/pages/cases/CasesPage').then(m => ({ default: m.CasesPage })));

// Vault Module
const VaultModule = lazy(() => import('@/modules/vault').then(m => ({ default: m.VaultModule })));

// HALOworks Control Console
const HALOworksControl = lazy(() => import('@/components/admin/haloworks/HALOworksControl').then(m => ({ default: m.HALOworksControl })));

// Proposal components
const ProposalsDashboard = lazy(() => import('@/pages/admin/proposals/ProposalsDashboard'));
const ProposalBuilder = lazy(() => import('@/pages/admin/proposals/ProposalBuilder'));
const SampleProposal = lazy(() => import('@/pages/admin/proposals/SampleProposal'));
const PropGENWizard = lazy(() => import('@/components/proposals/PropGENWizard').then(m => ({ default: m.PropGENWizard })));

const TeamPerformance = lazy(() => import('@/components/admin/TeamPerformance').then(m => ({ default: m.TeamPerformance })));
const ProposalAnalytics = lazy(() => import('@/components/admin/ProposalAnalytics').then(m => ({ default: m.ProposalAnalytics })));
const CoachingDigest = lazy(() => import('@/components/admin/CoachingDigest').then(m => ({ default: m.CoachingDigest })));

// Reports IQ Components
const ExecutiveReports = lazy(() => import('@/pages/admin/reports/ExecutiveReports'));
const OperationalReports = lazy(() => import('@/pages/admin/reports/OperationalReports'));
const FinancialReports = lazy(() => import('@/pages/admin/reports/FinancialReports'));
const ComplianceReports = lazy(() => import('@/domains/compliance/components/ComplianceReports').then(m => ({ default: m.ComplianceReports })));

// Marketing IQ Components
const MarketingDashboard = lazy(() => import('@/pages/admin/marketing/MarketingDashboard'));

const MarketingAutomation = lazy(() => import('@/pages/admin/marketing/MarketingAutomation'));
const LeadManagement = lazy(() => import('@/pages/admin/marketing/LeadManagement'));
const SocialMedia = lazy(() => import('@/pages/admin/marketing/SocialMedia'));
const EmailTemplates = lazy(() => import('@/pages/admin/email/EmailTemplates'));
const EmailCampaigns = lazy(() => import('@/pages/admin/email/EmailCampaigns'));
const EmailAnalytics = lazy(() => import('@/pages/admin/email/EmailAnalytics'));

// HaaloIQ Components
const HaaloCoreAdmin = lazy(() => import('@/pages/admin/haalo/HaaloCoreAdmin'));
const HaaloCompanies = lazy(() => import('@/pages/admin/haalo/HaaloCompanies'));
const HaaloUsers = lazy(() => import('@/pages/admin/haalo/HaaloUsers'));
const HaaloRoles = lazy(() => import('@/pages/admin/haalo/HaaloRoles'));
const HaaloAuth = lazy(() => import('@/pages/admin/haalo/HaaloAuth'));
const HaaloCommunications = lazy(() => import('@/pages/admin/haalo/HaaloCommunications'));
const HaaloPlaceholder = lazy(() => import('@/pages/admin/haalo/HaaloPlaceholder'));
const SystemRegistry = lazy(() => import('@/pages/admin/haalo/SystemRegistry'));
const AuditTrail = lazy(() => import('@/pages/admin/haalo/AuditTrail'));

// HaaLO Learn Components
const LearningPathsPage = lazy(() => import('@/pages/admin/haalo-learn/LearningPathsPage'));
const AdaptiveQuizPage = lazy(() => import('@/pages/admin/haalo-learn/AdaptiveQuizPage'));
const GamificationPage = lazy(() => import('@/pages/admin/haalo-learn/GamificationPage'));
const MicroLearningPage = lazy(() => import('@/pages/admin/haalo-learn/MicroLearningPage'));
const AIAssessmentsPage = lazy(() => import('@/pages/admin/haalo-learn/AIAssessmentsPage'));
const BadgesPage = lazy(() => import('@/pages/admin/haalo-learn/BadgesPage'));
const SocialLearningPage = lazy(() => import('@/pages/admin/haalo-learn/SocialLearningPage'));
const LearningAnalyticsPage = lazy(() => import('@/pages/admin/haalo-learn/LearningAnalyticsPage'));

// Additional Tools
const AdditionalToolsPage = lazy(() => import('@/pages/admin/tools/AdditionalToolsPage').then(m => ({ default: m.AdditionalToolsPage })));

// System Dashboard 
const SystemDashboard = lazy(() => import('@/pages/admin/SystemDashboard').then(m => ({ default: m.SystemDashboard })));

// System Email Templates
const SystemEmailTemplates = lazy(() => import('@/components/system/SystemEmailTemplates'));

// Consulting Services Components
const ConsultingDashboard = lazy(() => import('@/pages/admin/consulting/ConsultingDashboard'));
const AssessmentPage = lazy(() => import('@/pages/admin/consulting/AssessmentPage'));

// CRM Components
const GlobalContactsManager = lazy(() => import('@/domains/crm/components/contacts/GlobalContactsManager').then(m => ({ default: m.GlobalContactsManager })));

// Pulse CMS Components
const PulseReportsPage = lazy(() => import('@/pages/admin/pulse/PulseReportsPage').then(m => ({ default: m.PulseReportsPage })));
const CaseResolutionTrendsPage = lazy(() => import('@/pages/admin/pulse/reports/CaseResolutionTrendsPage').then(m => ({ default: m.CaseResolutionTrendsPage })));
const ComplianceDashboardPage = lazy(() => import('@/pages/admin/pulse/reports/ComplianceDashboardPage').then(m => ({ default: m.ComplianceDashboardPage })));
const RiskAssessmentPage = lazy(() => import('@/pages/admin/pulse/reports/RiskAssessmentPage').then(m => ({ default: m.RiskAssessmentPage })));
const PerformanceAnalyticsPage = lazy(() => import('@/pages/admin/pulse/reports/PerformanceAnalyticsPage').then(m => ({ default: m.PerformanceAnalyticsPage })));
const ResourceUtilizationPage = lazy(() => import('@/pages/admin/pulse/reports/ResourceUtilizationPage').then(m => ({ default: m.ResourceUtilizationPage })));
const SMSCasesDashboardPage = lazy(() => import('@/pages/admin/pulse/SMSCasesDashboardPage').then(m => ({ default: m.SMSCasesDashboardPage })));

// Optimized loading component with better mobile experience
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="relative">
        <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
        <div className="absolute inset-0 h-6 w-6 md:h-8 md:w-8 rounded-full border-2 border-primary/20 animate-pulse" />
      </div>
      <div className="text-center">
        <p className="text-sm md:text-base text-muted-foreground">Loading...</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Please wait</p>
      </div>
    </div>
  </div>
);

export const AdminRoutes = () => {
  return (
    <SectionErrorBoundary title="Admin Section Error">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
        
        {/* HaaLO Payroll Routes - Direct implementation (placed before index redirect) */}
        <Route path="payroll/dashboard" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'payroll_admin']}>
            <PayrollManager />
          </ProtectedRoute>
        } />
        <Route path="payroll/processing" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'payroll_admin']}>
            <ClientPayrollProcessingPage />
          </ProtectedRoute>
        } />
        <Route path="payroll/settings" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'payroll_admin']}>
            <PayrollSettingsPage />
          </ProtectedRoute>
        } />
        <Route path="payroll/settings/deductions" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'payroll_admin']}>
            <PayrollEarningsDeductionsPage />
          </ProtectedRoute>
        } />
        <Route path="payroll/settings/earnings" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'payroll_admin']}>
            <PayrollEarningsDeductionsPage />
          </ProtectedRoute>
        } />
        <Route path="payroll/settings/basic" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'payroll_admin']}>
            <PayrollBasicSettingsPage />
          </ProtectedRoute>
        } />
        <Route path="payroll/settings/tax" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'payroll_admin']}>
            <PayrollTaxConfigPage />
          </ProtectedRoute>
        } />
        <Route path="payroll/reports/payroll" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'payroll_admin']}>
            <PayrollReportsPage />
          </ProtectedRoute>
        } />

        {/* Default admin index - redirect to appropriate launchpad */}
        <Route index element={
          <>
            {console.log('🔍 AdminRoutes: Rendering index route, redirecting to launchpad/system')}
            <Navigate to="/launchpad/system" replace />
          </>
        } />
        
        {/* Consulting Services routes */}
        <Route path="consulting/dashboard" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <ConsultingDashboard />
          </ProtectedRoute>
        } />
        <Route path="consulting/assessment" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <AssessmentPage />
          </ProtectedRoute>
        } />
        
        {/* Assessment routes */}
        <Route path="assessments" element={<AdminAssessments />} />
        <Route path="assessments/results" element={<AssessmentResults />} />
        <Route path="assessments/reports" element={<AssessmentReports />} />
        <Route path="assessments/analytics" element={<AssessmentAnalytics />} />
        
        {/* Company management */}
        <Route path="companies" element={
          <>
            {console.log('🔍 AdminRoutes: Rendering companies route')}
            <CompaniesPage />
          </>
        } />
        <Route path="companies/:id" element={<CompanyDetailPage />} />
        <Route path="companies/edit/:id" element={<CompaniesPage />} />
        <Route path="companies/manage/:id" element={<CompaniesPage />} />
        
        {/* CRM Companies override */}
        <Route path="crm/companies" element={<CompaniesPage />} />
        
        {/* Client management */}
        <Route path="clients" element={<ClientsManagerPage />} />
        
        {/* Case management */}
        <Route path="cases" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <CasesPage />
          </ProtectedRoute>
        } />
        
        {/* Client IQ routes */}
        <Route path="clients/onboarding" element={<ClientOnboarding />} />
        <Route path="clients/settings" element={<ClientSettings />} />
        <Route path="clients/support" element={<ClientSupport />} />
        
        {/* Legacy client onboarding route (redirect or keep for compatibility) */}
        <Route path="client-onboarding" element={<ClientOnboarding />} />
        
        {/* Employee onboarding */}
        <Route path="onboarding" element={<AdminOnboarding />} />
        
        {/* HaaLO IQ University */}
        <Route path="university" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <Suspense fallback={<LoadingFallback />}>
              {React.createElement(lazy(() => import('@/modules/HaaLO.University/components/HaaLOIQUniversity')))}
            </Suspense>
          </ProtectedRoute>
        } />

        {/* User management */}
        <Route path="users" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <UnifiedUserManagement />
          </ProtectedRoute>
        } />
        <Route path="settings" element={<SystemDashboard />} />
        <Route path="system-settings" element={
          <ProtectedRoute requiredRole="super_admin">
            <SystemSettings />
          </ProtectedRoute>
        } />
        <Route path="configuration" element={
          <ProtectedRoute requiredRole="super_admin">
            <SystemSettings />
          </ProtectedRoute>
        } />
        <Route path="integrations" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <AdvancedIntegrationHub />
          </ProtectedRoute>
        } />
        <Route path="2fa" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <TwoFactorManagement />
          </ProtectedRoute>
        } />
        <Route path="config" element={
          <ProtectedRoute requiredRole="super_admin">
            <SystemSettings />
          </ProtectedRoute>
        } />
        
        {/* Reports IQ Routes */}
        <Route path="reports/executive" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <ExecutiveReports />
          </ProtectedRoute>
        } />
        <Route path="reports/operational" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <OperationalReports />
          </ProtectedRoute>
        } />
        <Route path="reports/financial" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <FinancialReports />
          </ProtectedRoute>
        } />
        <Route path="reports/compliance" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <ComplianceReports />
          </ProtectedRoute>
        } />
        
        {/* Marketing IQ Routes */}
        <Route path="marketing/dashboard" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <MarketingDashboard />
          </ProtectedRoute>
        } />
        <Route path="marketing/automation" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <MarketingAutomation />
          </ProtectedRoute>
        } />
        <Route path="marketing/leads" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <LeadManagement />
          </ProtectedRoute>
        } />
        <Route path="marketing/social" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <SocialMedia />
          </ProtectedRoute>
        } />
        <Route path="email/templates" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <EmailTemplates />
          </ProtectedRoute>
        } />
        <Route path="email/campaigns" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <EmailCampaigns />
          </ProtectedRoute>
        } />
        <Route path="email/analytics" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <EmailAnalytics />
          </ProtectedRoute>
        } />
        
        {/* Training & LMS */}
        <Route path="training-modules" element={<AdminTrainingModules />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="lms-reports" element={<AdminLMSReports />} />
        <Route path="reports" element={<AdminLMSReports />} />
        <Route path="certificates" element={<AdminCertificates />} />
        <Route path="knowledge-base" element={<KnowledgeBase />} />
        
        {/* Vault Module */}
        <Route path="vault/*" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <VaultModule />
          </ProtectedRoute>
        } />
        
        <Route path="wpv-learner" element={<WPVLearnerFlow />} />
        {/* <Route path="wpv-learner" element={<CompanyWPVTrainingFlow />} /> */}
        
        {/* Learning route for learners */}
        <Route path="learning" element={<WPVLearnerFlow />} />

        {/* HaaLO Learn Routes */}
        <Route path="haalo-learn/learning-paths" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <LearningPathsPage />
          </ProtectedRoute>
        } />
        <Route path="haalo-learn/adaptive-quiz" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <AdaptiveQuizPage />
          </ProtectedRoute>
        } />
        <Route path="haalo-learn/gamification" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'learner']}>
            <GamificationPage />
          </ProtectedRoute>
        } />
        <Route path="haalo-learn/micro-learning" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <MicroLearningPage />
          </ProtectedRoute>
        } />
        <Route path="haalo-learn/ai-assessments" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <AIAssessmentsPage />
          </ProtectedRoute>
        } />
        <Route path="haalo-learn/badges" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'learner']}>
            <BadgesPage />
          </ProtectedRoute>
        } />
        <Route path="haalo-learn/social-learning" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'learner']}>
            <SocialLearningPage />
          </ProtectedRoute>
        } />
        <Route path="haalo-learn/learning-analytics" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <LearningAnalyticsPage />
          </ProtectedRoute>
        } />
        
        {/* Modules */}
        <Route path="modules" element={
          <ProtectedRoute requiredRoles={['company_admin', 'super_admin']}>
            <ModulesPage />
          </ProtectedRoute>
        } />
        
        {/* Removed super-admin route - using clean dashboard approach */}
        
        {/* System Architecture */}
        <Route path="easeworks-staffing-architecture" element={<EaseWorksStaffingArchitecture />} />
        <Route path="haalo-system-architecture" element={
          <ProtectedRoute requiredRole="super_admin">
            <HaaLOSystemArchitecture />
          </ProtectedRoute>
        } />
        
        {/* Staffing */}
        <Route path="staffing/client-form" element={<ClientSubmissionForm />} />
        
        {/* PEO */}
        <Route path="peo-onboarding" element={<PEOOnboardingManagement />} />
        <Route path="peo/onboarding/:sessionId" element={<PEOOnboardingWizard />} />
        
        {/* Performance management */}
        <Route path="performance" element={
          <ProtectedRoute requiredRoles={['company_admin', 'super_admin']}>
            <PerformanceEvaluationDashboard />
          </ProtectedRoute>
        } />
        <Route path="performance/review-cycles/new" element={
          <ProtectedRoute requiredRoles={['company_admin', 'super_admin']}>
            <ReviewCycleBuilder />
          </ProtectedRoute>
        } />
        
        {/* Payroll */}
        <Route path="f45-payroll" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <F45PayrollDashboard />
          </ProtectedRoute>
        } />
        
        {/* Purchases */}
        <Route path="purchases" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <PurchasesPage />
          </ProtectedRoute>
        } />
        
        {/* Compliance */}
        <Route path="compliance" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <Compliance />
          </ProtectedRoute>
        } />
        
        {/* Email Management */}
        <Route path="email-management" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <EmailManagement />
          </ProtectedRoute>
        } />
        
        {/* Integrations */}
        <Route path="integrations" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <IntegrationsPage />
          </ProtectedRoute>
        } />
        <Route path="integration-triggers" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <IntegrationTriggersManager />
          </ProtectedRoute>
        } />
        
        {/* Security Audit */}
        <Route path="security-audit" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <SecurityAuditPanel />
          </ProtectedRoute>
        } />
        
        {/* SSO Management */}
        <Route path="sso" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <SSOManagement />
          </ProtectedRoute>
        } />
        
        {/* Tools Routes */}
        <Route path="tools" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <AdditionalToolsPage />
          </ProtectedRoute>
        } />
        <Route path="tools/api" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <SecurityAuditPanel />
          </ProtectedRoute>
        } />
        <Route path="tools/bulk" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <PlaceholderPage 
              title="Bulk Operations"
              description="Perform bulk operations on data and system entities."
            />
          </ProtectedRoute>
        } />
        
        {/* Executive Dashboard Routes */}
        <Route path="executive/dashboard" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <SuperAdminExecutiveDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="client/dashboard" element={
          <ProtectedRoute requiredRoles={['client_admin']}>
            <ClientAdminDashboard />
          </ProtectedRoute>
        } />

        {/* System Routes */}
        <Route path="system" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <SystemDashboard />
          </ProtectedRoute>
        } />
        <Route path="system/dashboard" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <SystemDashboard />
          </ProtectedRoute>
        } />
        <Route path="system/email-templates" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <SystemEmailTemplates />
          </ProtectedRoute>
        } />
        
        {/* Roles & Permissions */}
        <Route path="roles-permissions" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <RolesPermissions />
          </ProtectedRoute>
        } />
        <Route path="permissions" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <RolesPermissions />
          </ProtectedRoute>
        } />
        
        {/* Pricing Management */}
        <Route path="pricing" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <AdminPricing />
          </ProtectedRoute>
        } />
        
        {/* Proposal Management */}
        <Route path="proposals" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <ProposalsDashboard />
          </ProtectedRoute>
        } />
        <Route path="proposals/create" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <ProposalBuilder />
          </ProtectedRoute>
        } />
        <Route path="proposals/propgen" element={
          <ProtectedRoute requiredRoles={['admin', 'super_admin', 'internal_staff']}>
            <PropGENWizard />
          </ProtectedRoute>
        } />
        <Route path="proposals/sample" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <SampleProposal />
          </ProtectedRoute>
        } />
        <Route path="proposals/:id/edit" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <ProposalBuilder />
          </ProtectedRoute>
        } />
        
        {/* HR Tools */}
        <Route path="hr-tools/job-titles" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'admin']}>
            <GlobalJobTitlesPage />
          </ProtectedRoute>
        } />
        <Route path="hr-tools/job-descriptions" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'admin']}>
            <GlobalJobDescriptionPage />
          </ProtectedRoute>
        } />
        <Route path="org-structure" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'admin']}>
            <OrgStructurePage />
          </ProtectedRoute>
        } />
        <Route path="org-structure/client/:companyId" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'admin']}>
            <ClientOrgStructurePage />
          </ProtectedRoute>
        } />
        
        {/* Earnings & Deductions */}
        <Route path="pay-types" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <GlobalPayTypesPage />
          </ProtectedRoute>
        } />
        <Route path="pay-types/client/:companyId" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <ClientPayTypesPage />
          </ProtectedRoute>
        } />
        
        {/* Client Training Module Configuration */}
        <Route path="clients/:clientId/training/:moduleId" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <ClientTrainingBuilder />
          </ProtectedRoute>
        } />
        
        {/* SBW-9237 Management */}
        <Route path="clients/:clientId/sbw9237" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <SBW9237ClientManagement />
          </ProtectedRoute>
        } />
        
        {/* CRM Routes */}
        <Route path="crm/contacts" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'internal_staff']}>
            <GlobalContactsManager />
          </ProtectedRoute>
        } />
        
        {/* CRM Email */}
        <Route path="crm-email" element={
          <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
            <CRMEmailPage />
          </ProtectedRoute>
        } />
        
        {/* CRM Dynamic Module Routes - Must be after specific CRM routes */}
        <Route path="crm/*" element={
          <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
            <DynamicModuleRoutes pathPrefix="/admin/crm" />
          </ProtectedRoute>
        } />
        
        {/* Team Performance */}
        <Route path="team-performance" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <TeamPerformance />
          </ProtectedRoute>
        } />
        
        {/* Proposal Analytics */}
        <Route path="proposal-analytics" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <ProposalAnalytics />
          </ProtectedRoute>
        } />
        
        {/* AI Coaching Digest */}
        <Route path="coaching-digest" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <CoachingDigest />
          </ProtectedRoute>
        } />
        
        {/* EaseLearn Command Center */}
        <Route path="command-center/easelearn" element={
          <ProtectedRoute requiredRole="super_admin">
            <EaseLearnCommandCenter />
          </ProtectedRoute>
        } />
        
        {/* HALOworks Control Console */}
        <Route path="haloworks-control" element={
          <ProtectedRoute requiredRole="super_admin">
            <HALOworksControl />
          </ProtectedRoute>
        } />

        {/* Analytics Routes */}
        <Route path="analytics/*" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <AnalyticsRouter />
          </ProtectedRoute>
        } />
        
        {/* Placeholder routes for missing components */}
        <Route path="vimeo-videos" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <PlaceholderPage 
              title="Vimeo Video Management"
              description="Manage and organize Vimeo videos for training content."
              breadcrumbItems={[{ label: 'EaseLearn' }, { label: 'Vimeo Videos' }]}
            />
          </ProtectedRoute>
        } />
        
        <Route path="google-analytics" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <PlaceholderPage 
              title="Google Analytics"
              description="View Google Analytics data and insights."
              breadcrumbItems={[{ label: 'Analytics' }, { label: 'Google Analytics' }]}
            />
          </ProtectedRoute>
        } />
        
        <Route path="security" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <PlaceholderPage 
              title="Security Center"
              description="Monitor and manage system security settings."
              breadcrumbItems={[{ label: 'Administration' }, { label: 'Security Center' }]}
            />
          </ProtectedRoute>
        } />
        
        <Route path="api-playground" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <PlaceholderPage 
              title="API Playground"
              description="Test and explore API endpoints."
              breadcrumbItems={[{ label: 'Administration' }, { label: 'API Playground' }]}
            />
          </ProtectedRoute>
        } />
        
        <Route path="billing" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <PlaceholderPage 
              title="Billing Management"
              description="Manage billing and subscription settings."
              breadcrumbItems={[{ label: 'Administration' }, { label: 'Billing' }]}
            />
          </ProtectedRoute>
        } />
        
        {/* Dynamic Module Routes - All modules now handled through module registry */}
        <Route path="*" element={<DynamicModuleRoutes pathPrefix="/admin" />} />

        {/* HaaloIQ Routes */}
        <Route path="haalo/core-admin" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <HaaloCoreAdmin />
          </ProtectedRoute>
        } />
        <Route path="haalo/companies" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloCompanies />
          </ProtectedRoute>
        } />
        <Route path="haalo/users" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloUsers />
          </ProtectedRoute>
        } />
        <Route path="haalo/roles" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <HaaloRoles />
          </ProtectedRoute>
        } />
        <Route path="haalo/registry" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <SystemRegistry />
          </ProtectedRoute>
        } />
        <Route path="haalo/auth" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <HaaloAuth />
          </ProtectedRoute>
        } />
        <Route path="haalo/communications" element={
          <ProtectedRoute requiredRoles={['company_admin']}>
            <HaaloCommunications />
          </ProtectedRoute>
        } />
        <Route path="haalo/org-settings" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloPlaceholder title="Organization Settings" description="Organization configuration and preferences" moduleName="Org Settings" icon={() => <div />} />
          </ProtectedRoute>
        } />
        <Route path="haalo/directory" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloPlaceholder title="Directory" description="Employee and contact directory management" moduleName="Directory" icon={() => <div />} />
          </ProtectedRoute>
        } />
        <Route path="haalo/documents" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloPlaceholder title="Documents" description="Document management and storage system" moduleName="Documents" icon={() => <div />} />
          </ProtectedRoute>
        } />
        <Route path="haalo/compliance" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloPlaceholder title="Compliance" description="Compliance tracking and management" moduleName="Compliance" icon={() => <div />} />
          </ProtectedRoute>
        } />
        <Route path="haalo/training" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloPlaceholder title="Training" description="Training module and curriculum management" moduleName="Training" icon={() => <div />} />
          </ProtectedRoute>
        } />
        <Route path="haalo/tasks" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloPlaceholder title="Tasks" description="Task management and workflow automation" moduleName="Tasks" icon={() => <div />} />
          </ProtectedRoute>
        } />
        <Route path="haalo/time" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloPlaceholder title="Time Tracking" description="Time tracking and attendance management" moduleName="Time" icon={() => <div />} />
          </ProtectedRoute>
        } />
        <Route path="haalo/leave" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloPlaceholder title="Leave Management" description="Leave requests and time-off management" moduleName="Leave" icon={() => <div />} />
          </ProtectedRoute>
        } />
        <Route path="haalo/knowledge" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloPlaceholder title="Knowledge Base" description="Knowledge management and documentation" moduleName="Knowledge" icon={() => <div />} />
          </ProtectedRoute>
        } />
        <Route path="haalo/announcements" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloPlaceholder title="Announcements" description="Company announcements and communications" moduleName="Announcements" icon={() => <div />} />
          </ProtectedRoute>
        } />
        <Route path="haalo/notifications" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin']}>
            <HaaloPlaceholder title="Notifications" description="Notification system and alert management" moduleName="Notifications" icon={() => <div />} />
          </ProtectedRoute>
        } />
        <Route path="haalo/audit-trail" element={
          <ProtectedRoute requiredRoles={['super_admin']}>
            <AuditTrail />
          </ProtectedRoute>
        } />
        
        {/* HaaLO IQ Dynamic Module Routes */}
        <Route path="halo/*" element={<DynamicModuleRoutes pathPrefix="/admin/halo" />} />
        
        
        {/* Benefits Management */}
        <Route path="benefits" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'payroll_admin']}>
            <BenefitsManagement />
          </ProtectedRoute>
        } />
        
        {/* HaaLO Payroll Dynamic Module Routes - Fallback */}
        <Route path="payroll/*" element={<DynamicModuleRoutes pathPrefix="/admin/payroll" />} />
        
        {/* Pulse CMS Routes */}
        <Route path="pulse/reports" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'case_manager']}>
            <PulseReportsPage />
          </ProtectedRoute>
        } />
        <Route path="pulse/reports/case-resolution-trends" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'case_manager']}>
            <CaseResolutionTrendsPage />
          </ProtectedRoute>
        } />
        <Route path="pulse/reports/compliance-dashboard" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'case_manager']}>
            <ComplianceDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="pulse/reports/risk-assessment" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'case_manager']}>
            <RiskAssessmentPage />
          </ProtectedRoute>
        } />
        <Route path="pulse/reports/performance-analytics" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'case_manager']}>
            <PerformanceAnalyticsPage />
          </ProtectedRoute>
        } />
        <Route path="pulse/reports/resource-utilization" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'case_manager']}>
            <ResourceUtilizationPage />
          </ProtectedRoute>
        } />
        <Route path="pulse/sms-cases" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'case_manager']}>
            <SMSCasesDashboardPage />
          </ProtectedRoute>
        } />
        
        {/* Pulse CMS Dynamic Module Routes - Fallback */}
        <Route path="pulse/*" element={<DynamicModuleRoutes pathPrefix="/admin/pulse" />} />
        
        {/* HRO IQ Direct Routes - Bypass module system for testing */}
        <Route path="hro-iq/*" element={
          <ProtectedRoute requiredRoles={['super_admin', 'company_admin', 'client_admin']}>
            <DynamicModuleRoutes pathPrefix="/admin/hro-iq" />
          </ProtectedRoute>
        } />
        </Routes>
      </Suspense>
    </SectionErrorBoundary>
  );
};