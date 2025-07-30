import React from 'react';
import { useParams } from 'react-router-dom';
import { OrgStructureTab } from '@/components/org-structure/OrgStructureTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';

export const ClientOrgStructurePage = () => {
  const { companyId } = useParams<{ companyId: string }>();

  if (!companyId) {
    return (
      <StandardPageLayout
        title="Organization Structure"
        subtitle="Company ID required"
      >
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Company ID is required to view organization structure.</p>
          </CardContent>
        </Card>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title="Organization Structure"
      subtitle="Manage your company's locations, divisions, and departments"
    >
      <OrgStructureTab companyId={companyId} />
    </StandardPageLayout>
  );
};