import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PayrollContactInfoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clientId = searchParams.get('clientId');

  const breadcrumbItems = [
    { label: 'Payroll', href: '/payroll' },
    { label: 'Contact Information' }
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
                <Users className="w-8 h-8 text-primary" />
                Contact Information
              </h1>
              <p className="text-muted-foreground">
                {clientId ? 'Manage client-specific payroll contact details' : 'Manage global contact information'}
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Contact Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Contact Information Management</h3>
              <p className="text-muted-foreground mb-4">
                Configure payroll contact details and communication preferences
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};