import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeLaunchpad } from '@/launchpads/EmployeeLaunchpad';
import { LMSDashboard } from '@/domains/lms/pages/LMSDashboard';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { LoadingState } from '@/components/performance/LoadingState';

/**
 * Learner Dashboard - Dual Experience
 * 
 * Dynamically switches between Employee and LMS dashboards
 * based on company's purchased modules:
 * - If payroll module enabled: Shows Employee Dashboard (payroll + LMS features)
 * - If payroll module disabled: Shows pure LMS Dashboard (learning-focused)
 */
export const LearnerDashboard: React.FC = () => {
  const { hasModuleAccess, loading, companyModules } = useAuth();

  // Show loading state while auth context loads
  if (loading) {
    return <LoadingState message="Loading your dashboard..." variant="page" />;
  }

  // Check if company has purchased the payroll module
  const hasPayrollModule = hasModuleAccess('payroll');

  console.log('🎓 LearnerDashboard: Module check', {
    hasPayrollModule,
    companyModules,
    dashboardType: hasPayrollModule ? 'Employee Dashboard' : 'LMS Dashboard'
  });

  return (
    <UnifiedLayout>
      {hasPayrollModule ? (
        // Rich Employee Dashboard (includes payroll, time tracking, benefits, etc.)
        <EmployeeLaunchpad />
      ) : (
        // Pure LMS Dashboard (learning-focused experience)
        <div className="p-6">
          <LMSDashboard />
        </div>
      )}
    </UnifiedLayout>
  );
};

export default LearnerDashboard;