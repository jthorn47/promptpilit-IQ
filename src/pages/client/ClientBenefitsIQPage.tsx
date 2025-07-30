
import React from 'react';
import { useParams } from 'react-router-dom';
import { ClientBenefitsIQ } from '@/modules/Halo.BenefitsIQ/components/client/ClientBenefitsIQ';
import { useModuleAccess } from '@/hooks/useModuleAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export default function ClientBenefitsIQPage() {
  const { data: moduleAccess, isLoading } = useModuleAccess('haalo.benefitsiq-v11');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading BenefitsIQ...</p>
        </div>
      </div>
    );
  }

  if (!moduleAccess?.hasAccess || !moduleAccess?.isEnabled) {
    return (
      <StandardPageLayout
        title="BenefitsIQ"
        subtitle="Access Required"
      >
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-muted">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <CardTitle>BenefitsIQ Not Available</CardTitle>
            <CardDescription>
              You don't have access to the BenefitsIQ module or it's not enabled for your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Contact your administrator to request access to BenefitsIQ.
            </p>
            <Button variant="outline" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </StandardPageLayout>
    );
  }

  // Use mock data for now - in production this would come from the authenticated user's company
  return (
    <StandardPageLayout
      title="BenefitsIQ"
      subtitle="Manage employee benefits, enrollment, and administration"
    >
      <ClientBenefitsIQ 
        companyId="22222222-2222-2222-2222-222222222222" 
        companyName="TestClient_2025" 
      />
    </StandardPageLayout>
  );
}
