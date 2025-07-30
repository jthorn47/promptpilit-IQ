
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { GlobalLoadingFallback } from "@/components/ui/LoadingFallback";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PermissionRoute } from "@/components/PermissionRoute";
import { SecurityBanner } from "@/components/SecurityBanner";
import { TourOverlay } from "@/components/tour/TourOverlay";

// Route modules
import { PublicRoutes } from "@/routes/publicRoutes";
import { AuthRoutes } from "@/routes/authRoutes";
import { AdminRoutes } from "@/routes/adminRoutes";
import { LearningRoutes } from "@/routes/learningRoutes";
import { PayrollRoutes } from "@/routes/payrollRoutes";
import { TestingRoutes } from "@/routes/testingRoutes";
import { SuperAdminRoutes } from "@/routes/superAdminRoutes";
import { LaunchpadRoutes } from "@/routes/launchpadRoutes";
import { VaultModule } from "@/modules/vault";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { LearnerDashboard } from "@/dashboard/learner";
import { ClientRoutes } from "@/domains/client-management/routes/client.routes";

import { DynamicModuleRoutes } from "@/modules/core/DynamicModuleRoutes";


// Import module registry to load all modules
import "@/modules";

// Error pages
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import InvitationAccept from "@/pages/InvitationAccept";

// Client pages
import ClientBenefitsIQPage from "@/pages/client/ClientBenefitsIQPage";
import ClientJobTitlesPage from "@/pages/client/ClientJobTitlesPage";

// Demo pages
import DemoShowcase from "@/pages/DemoShowcase";

// New Universal Navigation pages
import AdminDashboard from "@/pages/AdminDashboard";
import MyWorkPage from "@/pages/MyWorkPage";
import CompaniesPage from "@/pages/CompaniesPage";
import ProposalsPage from "@/pages/ProposalsPage";

// App pages
import { HaloIQApp } from "@/pages/apps/HaloIQApp";
import { DataBridgeIQApp } from "@/pages/apps/DataBridgeIQApp";
import { ConnectIQCRMApp } from "@/pages/apps/ConnectIQCRMApp";
import { ConnectIQApp } from "@/pages/apps/ConnectIQApp";
import { PayrollIQApp } from "@/pages/apps/PayrollIQApp";
import { CompIQApp } from "@/pages/apps/CompIQApp";
import { BenefitsIQApp } from "@/pages/apps/BenefitsIQApp";
import { CaseManagementApp } from "@/pages/apps/CaseManagementApp";
import { VaultApp } from "@/pages/apps/VaultApp";
import { TimeTrackApp } from "@/pages/apps/TimeTrackApp";
import { MarketingIQApp } from "@/pages/apps/MarketingIQApp";
import CommunicationsIQApp from "@/pages/apps/CommunicationsIQApp";

/**
 * Main application routing configuration
 * Clean, organized route structure with proper protection
 */
export const AppRoutes = () => (
  <>
    <SecurityBanner />
    <TourOverlay />
    
    <Suspense fallback={<GlobalLoadingFallback />}>
      <Routes>
        {/* Authentication routes */}
        <Route path="/auth/*" element={<AuthRoutes />} />
        
        {/* 2FA Setup route */}
        <Route path="/setup-2fa" element={
          <Suspense fallback={<GlobalLoadingFallback />}>
            {React.createElement(React.lazy(() => import('@/pages/Setup2FA')))}
          </Suspense>
        } />
        
        {/* 2FA Verification route */}
        <Route path="/verify-2fa" element={
          <Suspense fallback={<GlobalLoadingFallback />}>
            {React.createElement(React.lazy(() => import('@/pages/Verify2FA')))}
          </Suspense>
        } />
        
        {/* Secure Account Setup route */}
        <Route path="/secure-setup" element={
          <Suspense fallback={<GlobalLoadingFallback />}>
            {React.createElement(React.lazy(() => import('@/components/auth/SecureAccountSetup')))}
          </Suspense>
        } />
        
        {/* Public invitation acceptance */}
        <Route path="/invitation/accept" element={<InvitationAccept />} />
        
        {/* Public routes (including DomainRouter for root) */}
        <Route path="/*" element={<PublicRoutes />} />
        
        {/* Protected client routes with permission checks */}
        <Route path="/client/benefitsiq" element={
          <PermissionRoute 
            requiredPermission="view_training_module"
            requiredModule="training"
            fallbackTo="/unauthorized"
          >
            <ClientBenefitsIQPage />
          </PermissionRoute>
        } />
        
        <Route path="/client/job-titles" element={
          <ProtectedRoute
            fallbackTo="/auth"
            requiredRoles={['company_admin', 'client_admin']}
          >
            <ClientJobTitlesPage />
          </ProtectedRoute>
        } />
        
        {/* Protected admin routes - exact match */}
        <Route path="/admin" element={
          <ProtectedRoute 
            fallbackTo="/auth/login" 
            requiredRoles={['super_admin', 'company_admin', 'admin', 'client_admin']}
          >
            <AdminRoutes />
          </ProtectedRoute>
        } />
        
        {/* Protected admin routes - nested */}
        <Route path="/admin/*" element={
          <ProtectedRoute 
            fallbackTo="/auth/login" 
            requiredRoles={['super_admin', 'company_admin', 'admin', 'client_admin']}
          >
            <AdminRoutes />
          </ProtectedRoute>
        } />
        
        {/* Protected learning routes with permission checks */}
        <Route path="/learning/*" element={
          <PermissionRoute
            requiredPermission="view_training_module"
            requiredModule="training"
            fallbackTo="/unauthorized"
          >
            <LearningRoutes />
          </PermissionRoute>
        } />
        
        {/* Protected payroll routes with permission checks */}
        <Route path="/payroll/*" element={
          <PermissionRoute
            requiredPermission="view_payroll_module"
            requiredModule="payroll"
            fallbackTo="/unauthorized"
          >
            <PayrollRoutes />
          </PermissionRoute>
        } />
        
        {/* Protected testing routes */}
        <Route path="/testing/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin']}
          >
            <TestingRoutes />
          </ProtectedRoute>
        } />
        
        {/* Legacy dashboard redirects */}
        <Route path="/dashboards/launchpad" element={<Navigate to="/launchpad/system" replace />} />
        <Route path="/dashboards/company-overview" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboards/payroll" element={<Navigate to="/admin/payroll/dashboard" replace />} />
        <Route path="/dashboards/finance" element={<Navigate to="/admin/system/dashboard" replace />} />
        <Route path="/dashboards/hr-internal" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboards/time-tracking" element={<Navigate to="/admin/time-tracking" replace />} />
        <Route path="/dashboards/training" element={<Navigate to="/admin/easelearn/dashboard" replace />} />
        <Route path="/dashboards/policy-tracking" element={<Navigate to="/admin/compliance" replace />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['company_admin', 'learner']}
          >
            <LearnerDashboard />
          </ProtectedRoute>
        } />
        
        {/* System redirect to proper launchpad route */}
        <Route path="/system" element={<Navigate to="/launchpad/system" replace />} />
        
        {/* Role-based Launchpad routes */}
        <Route path="/launchpad/*" element={
          <ProtectedRoute fallbackTo="/auth">
            <LaunchpadRoutes />
          </ProtectedRoute>
        } />

        {/* SuperAdmin routes */}
        <Route path="/superadmin/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin']}
          >
            <SuperAdminRoutes />
          </ProtectedRoute>
        } />
        
        {/* Protected vault routes */}
        <Route path="/vault" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'client_admin']}
          >
            <VaultApp />
          </ProtectedRoute>
        } />
        <Route path="/vault/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <VaultModule />
          </ProtectedRoute>
        } />
        
        
        {/* Individual admin routes moved to AdminRoutes component */}

        {/* Protected finance routes */}
        <Route path="/finance/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DynamicModuleRoutes pathPrefix="/finance" />
          </ProtectedRoute>
        } />
        
        {/* Protected halo-iq routes */}
        <Route path="/halo-iq" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'client_admin']}
          >
            <HaloIQApp />
          </ProtectedRoute>
        } />
        <Route path="/halo-iq/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DynamicModuleRoutes pathPrefix="/halo-iq" />
          </ProtectedRoute>
        } />
        
        {/* DataBridge route alias */}
        <Route path="/databridge" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DataBridgeIQApp />
          </ProtectedRoute>
        } />
        <Route path="/databridge/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DynamicModuleRoutes pathPrefix="/databridge" />
          </ProtectedRoute>
        } />
        
        {/* Protected databridge-iq routes */}
        <Route path="/admin/databridge" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DataBridgeIQApp />
          </ProtectedRoute>
        } />
        <Route path="/admin/databridge/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DynamicModuleRoutes pathPrefix="/admin/databridge" />
          </ProtectedRoute>
        } />
        
        {/* Protected connect-iq CRM routes */}
        <Route path="/admin/crm" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <ConnectIQCRMApp />
          </ProtectedRoute>
        } />
        <Route path="/admin/connectiq" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <ConnectIQCRMApp />
          </ProtectedRoute>
        } />
        <Route path="/admin/connectiq/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DynamicModuleRoutes pathPrefix="/admin/connectiq" />
          </ProtectedRoute>
        } />
        
        {/* Protected connect-iq routes */}
        <Route path="/connect-iq" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <ConnectIQApp />
          </ProtectedRoute>
        } />
        <Route path="/connect-iq/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DynamicModuleRoutes pathPrefix="/connect-iq" />
          </ProtectedRoute>
        } />
        
        {/* Protected payroll-iq routes */}
        <Route path="/payroll-iq" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <PayrollIQApp />
          </ProtectedRoute>
        } />
        <Route path="/payroll-iq/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DynamicModuleRoutes pathPrefix="/payroll-iq" />
          </ProtectedRoute>
        } />
        
        {/* Protected comp-iq routes */}
        <Route path="/comp-iq" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <CompIQApp />
          </ProtectedRoute>
        } />
        <Route path="/comp-iq/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DynamicModuleRoutes pathPrefix="/comp-iq" />
          </ProtectedRoute>
        } />
        
        {/* Protected benefits-iq routes */}
        <Route path="/benefits-iq" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <BenefitsIQApp />
          </ProtectedRoute>
        } />
        <Route path="/benefits-iq/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DynamicModuleRoutes pathPrefix="/benefits-iq" />
          </ProtectedRoute>
        } />
        
        {/* Protected case-management routes */}
        <Route path="/case-management" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'client_admin']}
          >
            <CaseManagementApp />
          </ProtectedRoute>
        } />
        <Route path="/case-management/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'client_admin']}
          >
            <DynamicModuleRoutes pathPrefix="/case-management" />
          </ProtectedRoute>
        } />
        
        {/* Protected time-track routes */}
        <Route path="/time-track" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'employee']}
          >
            <TimeTrackApp />
          </ProtectedRoute>
        } />
        <Route path="/time-track/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'employee']}
          >
            <DynamicModuleRoutes pathPrefix="/time-track" />
          </ProtectedRoute>
        } />
        
        {/* Protected marketing-iq routes */}
        <Route path="/marketing-iq" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <MarketingIQApp />
          </ProtectedRoute>
        } />
        <Route path="/marketing-iq/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DynamicModuleRoutes pathPrefix="/marketing-iq" />
          </ProtectedRoute>
        } />
        
        {/* Protected communications-iq routes */}
        <Route path="/communications-iq" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'internal_staff']}
          >
            <CommunicationsIQApp />
          </ProtectedRoute>
        } />
        <Route path="/apps/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'internal_staff']}
          >
            <DynamicModuleRoutes pathPrefix="/apps" />
          </ProtectedRoute>
        } />
        
        {/* Protected client-management routes */}
        <Route path="/client-management/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'client_admin']}
          >
            <ClientRoutes />
          </ProtectedRoute>
        } />
        <Route path="/admin/command-center/client-management" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'client_admin']}
          >
            <ClientRoutes />
          </ProtectedRoute>
        } />
        
        
        {/* University routes - HaaLO IQ University */}
        <Route path="/university/haalo-iq" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'client_admin', 'employee']}
          >
            <Suspense fallback={<GlobalLoadingFallback />}>
              {React.createElement(React.lazy(() => import('@/modules/HaaLO.University/components/HaaLOIQUniversity')))}
            </Suspense>
          </ProtectedRoute>
        } />
        
        {/* Protected halo routes - Simple test */}
        <Route path="/halo/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <DynamicModuleRoutes pathPrefix="/halo" />
          </ProtectedRoute>
        } />
        
        {/* Protected pulse routes - Case Management */}
        <Route path="/pulse/*" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'case_manager']}
          >
            <UnifiedLayout>
              <DynamicModuleRoutes pathPrefix="/pulse" />
            </UnifiedLayout>
          </ProtectedRoute>
        } />
        
        {/* Pulse CMS Page Route */}
        <Route path="/pulse-cms" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'case_manager']}
          >
            <UnifiedLayout>
              <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
                {React.createElement(React.lazy(() => import('@/pages/halo-iq/PulseCMSPage').then(m => ({ default: m.PulseCMSPage }))))}
              </Suspense>
            </UnifiedLayout>
          </ProtectedRoute>
        } />
        
        {/* Business Functionality Routes */}
        <Route path="/analytics" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'admin']}
          >
            <Suspense fallback={<GlobalLoadingFallback />}>
              {React.createElement(React.lazy(() => import('@/pages/analytics/Analytics')))}
            </Suspense>
          </ProtectedRoute>
        } />
        
        <Route path="/team" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'admin']}
          >
            <Suspense fallback={<GlobalLoadingFallback />}>
              {React.createElement(React.lazy(() => import('@/pages/team/Team')))}
            </Suspense>
          </ProtectedRoute>
        } />
        
        <Route path="/tasks" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'admin', 'employee']}
          >
            <Suspense fallback={<GlobalLoadingFallback />}>
              {React.createElement(React.lazy(() => import('@/pages/tasks/Tasks')))}
            </Suspense>
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'admin', 'client_admin', 'employee', 'learner']}
          >
            <Suspense fallback={<GlobalLoadingFallback />}>
              {React.createElement(React.lazy(() => import('@/pages/SettingsPage')))}
            </Suspense>
          </ProtectedRoute>
        } />
        
        <Route path="/finance" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin']}
          >
            <Suspense fallback={<GlobalLoadingFallback />}>
              {React.createElement(React.lazy(() => import('@/pages/finance/Finance')))}
            </Suspense>
          </ProtectedRoute>
        } />
        
        <Route path="/campaigns" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'admin']}
          >
            <Suspense fallback={<GlobalLoadingFallback />}>
              {React.createElement(React.lazy(() => import('@/pages/campaigns/Campaigns')))}
            </Suspense>
          </ProtectedRoute>
        } />
        
        <Route path="/campaigns/new" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'admin']}
          >
            <Suspense fallback={<GlobalLoadingFallback />}>
              {React.createElement(React.lazy(() => import('@/pages/campaigns/Campaigns')))}
            </Suspense>
          </ProtectedRoute>
        } />
        
        <Route path="/calendar" element={
          <ProtectedRoute 
            fallbackTo="/auth"
            requiredRoles={['super_admin', 'company_admin', 'admin', 'employee']}
          >
            <Suspense fallback={<GlobalLoadingFallback />}>
              {React.createElement(React.lazy(() => import('@/pages/calendar/Calendar')))}
            </Suspense>
          </ProtectedRoute>
        } />
        
        {/* Demo Routes */}
        <Route path="/demo/hero-banner" element={
          <Suspense fallback={<GlobalLoadingFallback />}>
            {React.createElement(React.lazy(() => import('@/pages/demo/HeroBannerDemo')))}
          </Suspense>
        } />
        
        {/* Error pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  </>
);
