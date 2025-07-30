
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SuperAdminLaunchpad } from "@/launchpads/SuperAdminLaunchpad";
import { CompanyAdminLaunchpad } from "@/launchpads/CompanyAdminLaunchpad";
import { AdminLaunchpad } from "@/launchpads/AdminLaunchpad";
import { ClientLaunchpad } from "@/launchpads/ClientLaunchpad";
import { ClientAdminLaunchpad } from "@/launchpads/ClientAdminLaunchpad";
import { LearnerLaunchpad } from "@/launchpads/LearnerLaunchpad";
import { EmployeeLaunchpad } from "@/launchpads/EmployeeLaunchpad";
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export const LaunchpadRoutes = () => {
  const { userRoles } = useAuth();

  // Default redirect logic based on user role
  const getDefaultLaunchpad = () => {
    console.log('🚀 LaunchpadRoutes getDefaultLaunchpad:', { userRoles });
    if (userRoles?.includes('super_admin')) return '/launchpad/system';
    if (userRoles?.includes('company_admin')) return '/launchpad/company-admin';
    if (userRoles?.includes('client_admin')) return '/launchpad/client-admin';
    if (userRoles?.includes('admin')) return '/launchpad/admin';
    if (userRoles?.includes('learner')) return '/launchpad/learn';
    return '/launchpad/employee';
  };

  return (
    <Routes>
      <Route path="/system" element={<SuperAdminLaunchpad />} />
      <Route path="/company-admin" element={<CompanyAdminLaunchpad />} />
      <Route path="/client-admin" element={<ClientAdminLaunchpad />} />
      <Route path="/admin" element={<AdminLaunchpad />} />
      <Route path="/client" element={<ClientLaunchpad />} />
      <Route path="/learn" element={<LearnerLaunchpad />} />
      {/* Conditional employee route - redirect super_admin users to system launchpad */}
      <Route path="/employee" element={
        userRoles?.includes('super_admin') 
          ? <Navigate to="/launchpad/system" replace /> 
          : <EmployeeLaunchpad />
      } />
      <Route path="/client-dashboard/*" element={<UnifiedLayout><div className="p-6"><h1>Client Dashboard</h1><p>Dashboard content will be loaded here</p></div></UnifiedLayout>} />
      <Route path="/" element={<Navigate to={getDefaultLaunchpad()} replace />} />
    </Routes>
  );
};
