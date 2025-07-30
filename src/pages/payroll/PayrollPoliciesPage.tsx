import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PayrollPoliciesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clientId = searchParams.get('clientId');

  const breadcrumbItems = [
    { label: 'Payroll', href: '/payroll' },
    { label: 'Policies' }
  ];

  const handleGoBack = () => {
    if (clientId) {
      navigate(`/admin/crm/clients/${clientId}?tab=halo-payroll`);
    } else {
      navigate('/payroll');
    }
  };

  return (
    <>
      <BreadcrumbNav items={breadcrumbItems} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Settings className="w-8 h-8 text-primary" />
                Policies
              </h1>
              <p className="text-muted-foreground">
                {clientId ? 'Manage client-specific direct deposit and PTO settings' : 'Manage global policy settings'}
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Direct Deposit & PTO Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Policy Management</h3>
              <p className="text-muted-foreground mb-4">
                Configure direct deposit requirements, PTO policies, and pay stub delivery
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};