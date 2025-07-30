import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { BenefitsAdministration } from '@/domains/payroll/components/BenefitsAdministration';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const PayrollBenefitsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clientId = searchParams.get('clientId');

  const breadcrumbItems = [
    { label: 'Payroll', href: '/payroll' },
    { label: 'Benefits Administration' }
  ];

  const handleGoBack = () => {
    if (clientId) {
      // Go back to the client's Halo Payroll tab
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
                <Heart className="w-8 h-8 text-primary" />
                Benefits Administration
              </h1>
              <p className="text-muted-foreground">
                {clientId ? 'Manage client-specific benefit plans and settings' : 'Manage global benefit plans and settings'}
              </p>
            </div>
          </div>
        </div>

        {clientId ? (
          <Card>
            <CardHeader>
              <CardTitle>Client Benefits Management</CardTitle>
            </CardHeader>
            <CardContent>
              <BenefitsAdministration clientId={clientId} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Global Benefits Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Global Benefits Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Access global benefit plan templates and administration tools
                </p>
                <Button onClick={() => navigate('/payroll/super-admin-benefits')}>
                  <Heart className="w-4 h-4 mr-2" />
                  Open Global Benefits Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};