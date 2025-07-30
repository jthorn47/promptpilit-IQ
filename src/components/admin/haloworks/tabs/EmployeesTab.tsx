import React from 'react';
import { OnboardingConfigurationWizard } from '../OnboardingConfigurationWizard';
import { useHasClientAccess } from '@/hooks/useClientAccess';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmployeesTabProps {
  clientId: string;
}

export const EmployeesTab: React.FC<EmployeesTabProps> = ({ clientId }) => {
  const hasAccess = useHasClientAccess(clientId);
  
  if (!hasAccess) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-destructive">
            <Shield className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Access Denied</h3>
              <p className="text-sm">You don't have permission to manage employees for this client.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Employee Management</h3>
        <p className="text-muted-foreground">
          Configure onboarding workflows and manage employee settings for this client.
        </p>
      </div>
      
      <OnboardingConfigurationWizard clientId={clientId} />
    </div>
  );
};