import React, { Suspense, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { TrainingKPIs } from './modules/TrainingKPIs';
import { PayrollKPIs } from './modules/PayrollKPIs';
import { HRKPIs } from './modules/HRKPIs';
import { SB553KPIs } from './modules/SB553KPIs';
import { UserManagement } from './modules/UserManagement';

// Module registry for dynamic loading
const MODULE_REGISTRY = {
  'training': TrainingKPIs,
  'payroll': PayrollKPIs,
  'hr': HRKPIs,
  'sb553': SB553KPIs,
};

export const KPILoader: React.FC = () => {
  const { companyId } = useAuth();

  // TODO: Replace with actual API call to get purchased modules
  const purchasedModules = useMemo(() => {
    // Mock data - in real implementation, fetch from API or company settings
    return ['training', 'payroll', 'hr', 'sb553'];
  }, [companyId]);

  const loadedModules = useMemo(() => {
    return purchasedModules
      .filter(module => MODULE_REGISTRY[module as keyof typeof MODULE_REGISTRY])
      .map(module => ({
        key: module,
        Component: MODULE_REGISTRY[module as keyof typeof MODULE_REGISTRY]
      }));
  }, [purchasedModules]);

  return (
    <div className="space-y-8">
      {/* KPI Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loadedModules.map(({ key, Component }) => (
          <Suspense 
            key={key} 
            fallback={
              <div className="p-6 border rounded-lg bg-card">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </div>
            }
          >
            <Component />
          </Suspense>
        ))}
      </div>

      {/* User Management - Always included */}
      <Suspense 
        fallback={
          <div className="p-6 border rounded-lg bg-card">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-40" />
          </div>
        }
      >
        <UserManagement />
      </Suspense>
    </div>
  );
};