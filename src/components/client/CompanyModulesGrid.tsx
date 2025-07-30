
import React from 'react';
import { BenefitsIQModuleCard } from './modules/BenefitsIQModuleCard';

export const CompanyModulesGrid: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Company Modules</h2>
        <p className="text-muted-foreground">Access and manage your organization's enabled modules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BenefitsIQModuleCard />
        {/* Additional module cards can be added here */}
      </div>
    </div>
  );
};
